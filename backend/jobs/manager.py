"""Async job manager with WebSocket broadcast support."""
import asyncio
from datetime import datetime
from backend.scraper.engine import ScraperConfig, run_scrape
from backend.storage.db import update_job, get_job

active_jobs: dict[str, dict] = {}

async def _broadcast_loop(job_id: str):
    """Read from progress_queue and broadcast to all subscriber queues."""
    job_state = active_jobs.get(job_id)
    if not job_state:
        return
        
    queue = job_state['progress_queue']
    try:
        while True:
            event = await queue.get()
            
            # Broadcast to all subscribers
            for sub in list(job_state['subscribers']):
                try:
                    await sub.put(event)
                except:
                    pass
                    
            if event.get('type') in ('done', 'error', 'cancelled'):
                # Update DB and cleanup
                if event['type'] == 'cancelled':
                    status = 'cancelled'
                else:
                    status = 'done' if event['type'] == 'done' else 'failed'
                updates = {
                    'status': status,
                    'finished_at': datetime.utcnow().isoformat()
                }
                if event['type'] == 'error':
                    updates['error_message'] = event.get('message', 'Unknown error')
                    
                await update_job(job_id, updates)
                break
                
    except asyncio.CancelledError:
        pass
    finally:
        if job_id in active_jobs:
            del active_jobs[job_id]

async def start_job(job_id: str, config: ScraperConfig) -> None:
    """Start a new scraping job."""
    pause_event = asyncio.Event()
    pause_event.set()  # running
    
    cancel_event = asyncio.Event()
    progress_queue = asyncio.Queue()
    
    # Update DB
    await update_job(job_id, {
        'status': 'running',
        'started_at': datetime.utcnow().isoformat()
    })
    
    task = asyncio.create_task(run_scrape(config, progress_queue, pause_event, cancel_event))
    
    active_jobs[job_id] = {
        'task': task,
        'schedule_id': getattr(config, 'schedule_id', None),
        'pause_event': pause_event,
        'cancel_event': cancel_event,
        'progress_queue': progress_queue,
        'subscribers': set()
    }
    
    asyncio.create_task(_broadcast_loop(job_id))

async def pause_job(job_id: str) -> bool:
    """Pause a running job."""
    if job_id in active_jobs:
        active_jobs[job_id]['pause_event'].clear()
        await update_job(job_id, {'status': 'paused'})
        return True
    return False

async def resume_job_control(job_id: str) -> bool:
    """Resume a paused job."""
    if job_id in active_jobs:
        active_jobs[job_id]['pause_event'].set()
        await update_job(job_id, {'status': 'running'})
        return True
    return False

async def cancel_job(job_id: str) -> bool:
    """Cancel a running job."""
    if job_id in active_jobs:
        active_jobs[job_id]['cancel_event'].set()
        await update_job(job_id, {
            'status': 'cancelled',
            'finished_at': datetime.utcnow().isoformat()
        })
        return True
    return False

async def subscribe(job_id: str) -> asyncio.Queue | None:
    """Subscribe to job progress."""
    if job_id not in active_jobs:
        return None
    q = asyncio.Queue()
    active_jobs[job_id]['subscribers'].add(q)
    return q

async def unsubscribe(job_id: str, queue: asyncio.Queue) -> None:
    """Unsubscribe from job progress."""
    if job_id in active_jobs:
        active_jobs[job_id]['subscribers'].discard(queue)

async def resume_from_db(job_id: str) -> None:
    """Resume a job from DB state."""
    job_data = await get_job(job_id)
    if not job_data:
        return
        
    config = ScraperConfig(
        job_id=job_id,
        url=job_data['url'],
        filters=job_data.get('filters', {}),
        concurrency=job_data.get('concurrency', 2)
    )
    
    await start_job(job_id, config)

def get_active_job_ids() -> list[str]:
    """Get list of active job IDs."""
    return list(active_jobs.keys())

def is_schedule_running(schedule_id: str) -> bool:
    """Check if any active scraping job belongs to this schedule."""
    if not schedule_id:
        return False
    return any(job.get('schedule_id') == schedule_id for job in active_jobs.values())
