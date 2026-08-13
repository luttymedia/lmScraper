"""Recurring and one-time job scheduling using APScheduler."""
import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from backend.storage.db import list_schedules, get_schedule, update_schedule, insert_schedule, delete_schedule as db_delete_schedule, insert_job
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

_executing_schedules: set[str] = set()

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

        job_dict = {
            'url': sched['url'],
            'platform': sched.get('platform', 'goandance'),
            'filters': sched.get('filters', {}),
            'schedule_id': schedule_id
        }
        
        job_id = await insert_job(job_dict)
        config = ScraperConfig(
            job_id=job_id,
            url=sched['url'],
            platform=sched.get('platform', 'goandance'),
            filters=sched.get('filters', {}),
            schedule_id=schedule_id
        )
        
        await start_job(job_id, config)
    except Exception as e:
        logger.error(f"Error executing scheduled job {schedule_id}: {e}")
    finally:
        _executing_schedules.discard(schedule_id)

async def start_scheduler() -> None:
    """Start the APScheduler and load schedules from DB."""
    if not scheduler.running:
        scheduler.start()
        
    schedules = await list_schedules()
    now = datetime.now()
    for s in schedules:
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

async def shutdown_scheduler() -> None:
    """Gracefully shutdown the scheduler."""
    if scheduler.running:
        scheduler.shutdown()

async def create_schedule(schedule_dict: dict) -> str:
    """Create a new schedule."""
    sched_id = await insert_schedule(schedule_dict)
    
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
        if sched:
            trigger, is_one_time, next_time = parse_schedule_trigger(sched['cron_expression'])
            scheduler.add_job(
                _run_scheduled_job,
                trigger=trigger,
                args=[schedule_id],
                id=schedule_id,
                replace_existing=True
            )
    await update_schedule(schedule_id, {'active': 1})

def get_next_run_time(cron_expression: str) -> str | None:
    """Get next run time for a cron or one-time expression."""
    try:
        _, _, next_time = parse_schedule_trigger(cron_expression)
        return next_time.isoformat() if next_time else None
    except:
        return None
