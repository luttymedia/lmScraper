"""Recurring job scheduling using APScheduler."""
import logging
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from backend.storage.db import list_schedules, get_schedule, update_schedule, insert_schedule, delete_schedule as db_delete_schedule, insert_job
from backend.jobs.manager import start_job
from backend.scraper.engine import ScraperConfig

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()

async def _run_scheduled_job(schedule_id: str) -> None:
    """Callback triggered by APScheduler to run a job."""
    sched = await get_schedule(schedule_id)
    if not sched or not sched.get('active'):
        return
        
    job_dict = {
        'url': sched['url'],
        'filters': sched.get('filters', {}),
        'schedule_id': schedule_id
    }
    
    job_id = await insert_job(job_dict)
    config = ScraperConfig(
        job_id=job_id,
        url=sched['url'],
        filters=sched.get('filters', {})
    )
    
    await start_job(job_id, config)
    
    # Update next run time
    trigger = CronTrigger.from_crontab(sched['cron_expression'])
    next_time = trigger.get_next_fire_time(None, datetime.now(trigger.timezone))
    
    await update_schedule(schedule_id, {
        'last_run_at': datetime.utcnow().isoformat(),
        'next_run_at': next_time.isoformat() if next_time else None
    })

async def start_scheduler() -> None:
    """Start the APScheduler and load schedules from DB."""
    if not scheduler.running:
        scheduler.start()
        
    schedules = await list_schedules()
    for s in schedules:
        if s.get('active'):
            try:
                trigger = CronTrigger.from_crontab(s['cron_expression'])
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
    
    trigger = CronTrigger.from_crontab(schedule_dict['cron_expression'])
    next_time = trigger.get_next_fire_time(None, datetime.now(trigger.timezone))
    
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
    
    return sched_id

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
            trigger = CronTrigger.from_crontab(sched['cron_expression'])
            scheduler.add_job(
                _run_scheduled_job,
                trigger=trigger,
                args=[schedule_id],
                id=schedule_id,
                replace_existing=True
            )
    await update_schedule(schedule_id, {'active': 1})

def get_next_run_time(cron_expression: str) -> str | None:
    """Get next run time for a cron expression."""
    try:
        trigger = CronTrigger.from_crontab(cron_expression)
        next_time = trigger.get_next_fire_time(None, datetime.now(trigger.timezone))
        return next_time.isoformat() if next_time else None
    except:
        return None
