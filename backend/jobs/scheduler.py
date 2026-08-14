"""Recurring and one-time job scheduling using APScheduler."""
import logging
import asyncio
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from apscheduler.triggers.interval import IntervalTrigger
from backend.storage.db import (
    list_schedules, get_schedule, update_schedule, insert_schedule,
    delete_schedule as db_delete_schedule, insert_job,
    list_groups, get_group, update_group, delete_group as db_delete_group,
    get_group_schedules, bulk_assign_to_group, remove_from_group,
    reorder_group_schedules, insert_group
)
from backend.jobs.manager import start_job
from backend.scraper.engine import ScraperConfig

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

def parse_schedule_trigger(schedule_str: str):
    """
    Parses either a standard 5-part cron expression (e.g. '0 9 * * *')
    or a one-time execution string (e.g. 'once:2026-08-13T23:45:00' or ISO datetime '2026-08-13T23:45:00').
    Returns (trigger, is_one_time: bool, next_fire_datetime)
    """
    cleaned = schedule_str.replace('once:', '').replace('at:', '').strip()
    try:
        dt = datetime.fromisoformat(cleaned)
        trigger = DateTrigger(run_date=dt)
        return trigger, True, dt
    except Exception:
        trigger = CronTrigger.from_crontab(schedule_str)
        next_time = trigger.get_next_fire_time(None, datetime.now(trigger.timezone))
        return trigger, False, next_time

def generate_job_nickname(sched: dict, dance_style: str) -> str:
    now_str = datetime.now().strftime("%b %d, %H:%M")
    label = (sched.get('label') or '').strip()
    if label:
        return f"{label} · {now_str}"
        
    filters = sched.get('filters') or {}
    style = (dance_style or '').strip().title()
    city = (filters.get('city') or '').strip().title()
    keyword = (filters.get('keyword') or '').strip()
    platform_name = sched.get('platform', 'goandance').title()
    
    if style and city:
        main_part = f"{style} in {city}"
    elif style:
        main_part = f"{style}"
    elif city:
        main_part = f"{platform_name} {city}"
    elif keyword:
        main_part = f"{keyword} ({platform_name})"
    else:
        main_part = f"{platform_name}"
        
    return f"{main_part} · {now_str}"

_executing_schedules: set[str] = set()
_executing_groups: set[str] = set()

async def _run_scheduled_job(schedule_id: str) -> None:
    """Callback triggered by APScheduler to run a job."""
    if schedule_id in _executing_schedules:
        logger.warning(f"Schedule {schedule_id} is already executing, skipping duplicate trigger")
        return
        
    _executing_schedules.add(schedule_id)
    try:
        sched = await get_schedule(schedule_id)
        if not sched or not sched.get('active'):
            return
            
        trigger, is_one_time, next_time = parse_schedule_trigger(sched['cron_expression'])
        
        # Immediately update schedule in DB & remove one-time jobs so duplicates can never spawn
        if is_one_time:
            await update_schedule(schedule_id, {
                'last_run_at': datetime.utcnow().isoformat(),
                'next_run_at': None,
                'active': 0
            })
            if scheduler.get_job(schedule_id):
                try:
                    scheduler.remove_job(schedule_id)
                except Exception:
                    pass
        else:
            next_fire = trigger.get_next_fire_time(None, datetime.now(trigger.timezone))
            await update_schedule(schedule_id, {
                'last_run_at': datetime.utcnow().isoformat(),
                'next_run_at': next_fire.isoformat() if next_fire else None
            })

        dance_style = sched.get('dance_style') or (sched.get('filters') or {}).get('dance_style')
        nickname = generate_job_nickname(sched, dance_style)
        job_dict = {
            'url': sched['url'],
            'platform': sched.get('platform', 'goandance'),
            'dance_style': dance_style,
            'filters': sched.get('filters', {}),
            'schedule_id': schedule_id,
            'nickname': nickname
        }
        
        job_id = await insert_job(job_dict)
        config = ScraperConfig(
            job_id=job_id,
            url=sched['url'],
            platform=sched.get('platform', 'goandance'),
            dance_style=dance_style,
            filters=sched.get('filters', {}),
            schedule_id=schedule_id
        )
        
        await start_job(job_id, config)
    except Exception as e:
        logger.error(f"Error executing scheduled job {schedule_id}: {e}")
    finally:
        _executing_schedules.discard(schedule_id)

# ── Schedule Group Execution ──────────────────────────────────────────────────

async def _run_group_job(group_id: str) -> None:
    """Callback triggered by APScheduler interval to run the next job in a group."""
    if group_id in _executing_groups:
        logger.warning(f"Group {group_id} is already executing, skipping duplicate trigger")
        return

    _executing_groups.add(group_id)
    try:
        group = await get_group(group_id)
        if not group or not group.get('active'):
            return

        schedules = await get_group_schedules(group_id)
        if not schedules:
            logger.info(f"Group {group_id} has no schedules, skipping.")
            return

        total = len(schedules)
        idx = group.get('current_index', 0)

        # Safety: wrap index if it somehow exceeds the list length
        idx = idx % total

        sched = schedules[idx]
        schedule_id = sched['id']

        logger.info(f"[Group {group['name']}] Running schedule {idx + 1}/{total}: {sched.get('label') or sched['url']}")

        dance_style = sched.get('dance_style') or (sched.get('filters') or {}).get('dance_style')
        nickname = generate_job_nickname(sched, dance_style)
        job_dict = {
            'url': sched['url'],
            'platform': sched.get('platform', 'goandance'),
            'dance_style': dance_style,
            'filters': sched.get('filters', {}),
            'schedule_id': schedule_id,
            'nickname': nickname
        }

        job_id = await insert_job(job_dict)
        config = ScraperConfig(
            job_id=job_id,
            url=sched['url'],
            platform=sched.get('platform', 'goandance'),
            dance_style=dance_style,
            filters=sched.get('filters', {}),
            schedule_id=schedule_id
        )

        await start_job(job_id, config)

        # Advance the index
        next_idx = idx + 1
        now_iso = datetime.utcnow().isoformat()

        if next_idx >= total:
            # All schedules in the group have been executed
            loop_mode = group.get('loop_mode', 'loop')
            if loop_mode == 'once':
                # One-time run: mark as completed and deactivate APScheduler job
                await update_group(group_id, {
                    'current_index': 0,
                    'active': 0,
                    'last_triggered_at': now_iso,
                    'completed_at': now_iso
                })
                if scheduler.get_job(f"group_{group_id}"):
                    try:
                        scheduler.remove_job(f"group_{group_id}")
                    except Exception:
                        pass
                logger.info(f"[Group {group['name']}] All jobs completed (one-time mode). Group deactivated.")
            else:
                # Loop mode: reset to beginning
                await update_group(group_id, {
                    'current_index': 0,
                    'last_triggered_at': now_iso
                })
                logger.info(f"[Group {group['name']}] All jobs completed. Looping back to first job.")
        else:
            await update_group(group_id, {
                'current_index': next_idx,
                'last_triggered_at': now_iso
            })

    except Exception as e:
        logger.error(f"Error executing group job {group_id}: {e}")
    finally:
        _executing_groups.discard(group_id)

async def start_scheduler() -> None:
    """Start the APScheduler and load schedules from DB."""
    if not scheduler.running:
        scheduler.start()
        
    schedules = await list_schedules()
    now = datetime.now()
    for s in schedules:
        # Skip schedules that belong to a group — they are driven by the group trigger
        if s.get('group_ids'):
            continue
        if s.get('active'):
            try:
                trigger, is_one_time, next_time = parse_schedule_trigger(s['cron_expression'])
                if is_one_time and next_time and next_time < now:
                    # Past one-time schedule, deactivate
                    await update_schedule(s['id'], {'active': 0, 'next_run_at': None})
                    continue
                scheduler.add_job(
                    _run_scheduled_job,
                    trigger=trigger,
                    args=[s['id']],
                    id=s['id'],
                    replace_existing=True
                )
            except Exception as e:
                logger.error(f"Failed to load schedule {s['id']}: {e}")

    # Load schedule groups
    groups = await list_groups()
    for g in groups:
        if g.get('active'):
            try:
                interval_mins = int(g.get('interval_minutes', 5))
                start_dt = datetime.fromisoformat(g['start_time']) if g.get('start_time') else None
                scheduler.add_job(
                    _run_group_job,
                    trigger=IntervalTrigger(minutes=interval_mins, start_date=start_dt),
                    args=[g['id']],
                    id=f"group_{g['id']}",
                    replace_existing=True
                )
            except Exception as e:
                logger.error(f"Failed to load group {g['id']}: {e}")

async def shutdown_scheduler() -> None:
    """Gracefully shutdown the scheduler."""
    if scheduler.running:
        scheduler.shutdown()

async def create_schedule(schedule_dict: dict) -> str:
    """Create a new schedule."""
    sched_id = await insert_schedule(schedule_dict)
    
    # Only register with APScheduler if not part of a group
    if not schedule_dict.get('group_ids'):
        try:
            trigger, is_one_time, next_time = parse_schedule_trigger(schedule_dict['cron_expression'])
            
            await update_schedule(sched_id, {
                'next_run_at': next_time.isoformat() if next_time else None
            })
            
            scheduler.add_job(
                _run_scheduled_job,
                trigger=trigger,
                args=[sched_id],
                id=sched_id,
                replace_existing=True
            )
        except Exception as e:
            logger.error(f"Failed to add schedule to scheduler {sched_id}: {e}")
        
    return sched_id

async def update_schedule_job(schedule_id: str, updates: dict) -> None:
    """Update a schedule record and re-register in APScheduler."""
    if 'cron_expression' in updates:
        try:
            trigger, is_one_time, next_time = parse_schedule_trigger(updates['cron_expression'])
            updates['next_run_at'] = next_time.isoformat() if next_time else None
            if is_one_time and next_time and next_time > datetime.now():
                updates['active'] = 1
        except Exception:
            pass

    await update_schedule(schedule_id, updates)
    
    sched = await get_schedule(schedule_id)
    if not sched:
        return

    # Only manage individual APScheduler jobs for non-grouped schedules
    if sched.get('group_ids'):
        return
        
    if scheduler.get_job(schedule_id):
        try:
            scheduler.remove_job(schedule_id)
        except Exception:
            pass
            
    if sched.get('active'):
        try:
            trigger, is_one_time, next_time = parse_schedule_trigger(sched['cron_expression'])
            scheduler.add_job(
                _run_scheduled_job,
                trigger=trigger,
                args=[schedule_id],
                id=schedule_id,
                replace_existing=True
            )
        except Exception as e:
            logger.error(f"Failed to update APScheduler job {schedule_id}: {e}")

async def delete_schedule_job(schedule_id: str) -> None:
    """Delete a schedule."""
    if scheduler.get_job(schedule_id):
        scheduler.remove_job(schedule_id)
    await db_delete_schedule(schedule_id)

async def pause_schedule_job(schedule_id: str) -> None:
    """Pause a schedule."""
    if scheduler.get_job(schedule_id):
        scheduler.pause_job(schedule_id)
    await update_schedule(schedule_id, {'active': 0})

async def resume_schedule_job(schedule_id: str) -> None:
    """Resume a schedule."""
    if scheduler.get_job(schedule_id):
        scheduler.resume_job(schedule_id)
    else:
        sched = await get_schedule(schedule_id)
        if sched and not sched.get('group_ids'):
            trigger, is_one_time, next_time = parse_schedule_trigger(sched['cron_expression'])
            scheduler.add_job(
                _run_scheduled_job,
                trigger=trigger,
                args=[schedule_id],
                id=schedule_id,
                replace_existing=True
            )
    await update_schedule(schedule_id, {'active': 1})

# ── Group Scheduler Management ────────────────────────────────────────────────

async def create_group_schedule(group_dict: dict) -> str:
    """Create a new schedule group and register its interval in APScheduler."""
    # If no start_time is provided, ensure the group starts paused.
    if not group_dict.get('start_time'):
        group_dict['active'] = 0
    else:
        group_dict.setdefault('active', 1)
        
    group_id = await insert_group(group_dict)
    
    if group_dict.get('active'):
        try:
            interval_mins = int(group_dict.get('interval_minutes', 5))
            start_dt = datetime.fromisoformat(group_dict['start_time']) if group_dict.get('start_time') else None
            scheduler.add_job(
                _run_group_job,
                trigger=IntervalTrigger(minutes=interval_mins, start_date=start_dt),
                args=[group_id],
                id=f"group_{group_id}",
                replace_existing=True
            )
        except Exception as e:
            logger.error(f"Failed to register group {group_id} in APScheduler: {e}")
    return group_id

async def update_group_schedule(group_id: str, updates: dict) -> None:
    """Update a group and re-register its APScheduler job if interval changed."""
    # If start_time is being cleared, pause the group.
    if 'start_time' in updates:
        if not updates.get('start_time'):
            updates['active'] = 0

    await update_group(group_id, updates)
    group = await get_group(group_id)
    if not group:
        return

    job_id = f"group_{group_id}"
    if scheduler.get_job(job_id):
        try:
            scheduler.remove_job(job_id)
        except Exception:
            pass

    if group.get('active'):
        try:
            interval_mins = int(group.get('interval_minutes', 5))
            scheduler.add_job(
                _run_group_job,
                trigger=IntervalTrigger(minutes=interval_mins),
                args=[group_id],
                id=job_id,
                replace_existing=True
            )
        except Exception as e:
            logger.error(f"Failed to re-register group {group_id}: {e}")

async def delete_group_schedule(group_id: str) -> None:
    """Delete a group and remove its APScheduler job."""
    job_id = f"group_{group_id}"
    if scheduler.get_job(job_id):
        try:
            scheduler.remove_job(job_id)
        except Exception:
            pass
    await db_delete_group(group_id)

async def pause_group_schedule(group_id: str) -> None:
    """Pause a group's APScheduler job."""
    job_id = f"group_{group_id}"
    if scheduler.get_job(job_id):
        scheduler.pause_job(job_id)
    await update_group(group_id, {'active': 0})

async def resume_group_schedule(group_id: str) -> None:
    """Resume a group's APScheduler job. Runs immediately if start_time is not set."""
    group = await get_group(group_id)
    if not group:
        return

    job_id = f"group_{group_id}"
    interval_mins = int(group.get('interval_minutes', 5))
    has_start_time = bool(group.get('start_time'))
    start_dt = datetime.fromisoformat(group['start_time']) if group.get('start_time') else None

    scheduler.add_job(
        _run_group_job,
        trigger=IntervalTrigger(minutes=interval_mins, start_date=start_dt),
        args=[group_id],
        id=job_id,
        replace_existing=True
    )
    await update_group(group_id, {'active': 1, 'completed_at': None})

    if not has_start_time:
        asyncio.create_task(_run_group_job(group_id))

async def reset_group_schedule(group_id: str) -> None:
    """Reset the group's current_index back to 0."""
    await update_group(group_id, {'current_index': 0, 'completed_at': None})

def get_next_run_time(cron_expression: str) -> str | None:
    """Get next run time for a cron or one-time expression."""
    try:
        _, _, next_time = parse_schedule_trigger(cron_expression)
        return next_time.isoformat() if next_time else None
    except:
        return None

# Re-export DB helpers so callers can use them via scheduler module
__all__ = [
    'create_schedule', 'update_schedule_job', 'delete_schedule_job',
    'pause_schedule_job', 'resume_schedule_job',
    'create_group_schedule', 'update_group_schedule', 'delete_group_schedule',
    'pause_group_schedule', 'resume_group_schedule', 'reset_group_schedule',
    'start_scheduler', 'shutdown_scheduler', 'get_next_run_time',
    'bulk_assign_to_group', 'remove_from_group', 'reorder_group_schedules',
    'get_group_schedules',
]

