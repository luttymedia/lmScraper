"""FastAPI main application entry point."""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio, uuid, json
from pathlib import Path
from urllib.parse import urlparse

from backend.storage.db import (
    init_db, list_jobs, get_job, delete_job, insert_job,
    query_events, delete_events as db_delete_events,
    list_schedules, get_schedule, insert_session, list_sessions,
    delete_session, get_session_for_domain
)
from backend.storage.exporter import export_to_csv, export_to_xlsx
from backend.storage.monitor import (
    get_stats, cleanup_html_cache_older_than, cleanup_html_cache_larger_than,
    cleanup_events_older_than, compress_html_caches, export_full_backup,
    delete_job_cache
)
from backend.jobs.manager import (
    start_job, pause_job, resume_job_control, cancel_job,
    subscribe, unsubscribe, resume_from_db, get_active_job_ids
)
from backend.jobs.scheduler import (
    start_scheduler, shutdown_scheduler, create_schedule,
    pause_schedule_job, resume_schedule_job, delete_schedule_job
)
from backend.scraper.engine import ScraperConfig

PROJECT_ROOT = Path(__file__).parent.parent
FRONTEND_DIR = PROJECT_ROOT / 'frontend'

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for FastAPI."""
    await init_db()
    await start_scheduler()
    yield
    await shutdown_scheduler()

app = FastAPI(title="LMScraper", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes - Jobs
@app.post("/api/jobs")
async def create_job_route(body: dict = Body(...)):
    url = body.get('url')
    if not url:
        raise HTTPException(400, "URL is required")
        
    filters = body.get('filters', {})
    concurrency = body.get('concurrency', 2)
    session_cookies = None
    
    if body.get('session_id'):
        domain = urlparse(url).netloc
        session = await get_session_for_domain(domain)
        if session and session.get('cookies_json'):
            session_cookies = session['cookies_json']
            
    job_dict = {
        'url': url,
        'filters': filters,
        'concurrency': concurrency
    }
    job_id = await insert_job(job_dict)
    
    config = ScraperConfig(
        job_id=job_id,
        url=url,
        filters=filters,
        concurrency=concurrency,
        min_delay=body.get('min_delay', 1.5),
        max_delay=body.get('max_delay', 4.0),
        proxy=body.get('proxy'),
        session_cookies=session_cookies
    )
    
    await start_job(job_id, config)
    return await get_job(job_id)

@app.get("/api/jobs")
async def list_jobs_route(page: int = 1, per_page: int = 20):
    jobs, total = await list_jobs(page, per_page)
    return {"jobs": jobs, "total": total}

@app.get("/api/jobs/{job_id}")
async def get_job_route(job_id: str):
    job = await get_job(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    job['is_active'] = job_id in get_active_job_ids()
    return job

@app.post("/api/jobs/{job_id}/pause")
async def pause_job_route(job_id: str):
    if await pause_job(job_id):
        return {"status": "paused"}
    raise HTTPException(400, "Job is not running")

@app.post("/api/jobs/{job_id}/resume")
async def resume_job_route(job_id: str):
    if await resume_job_control(job_id):
        return {"status": "running"}
    
    # Try resuming from db
    job = await get_job(job_id)
    if job and job['status'] in ('paused', 'failed', 'pending'):
        await resume_from_db(job_id)
        return {"status": "running"}
    raise HTTPException(400, "Job cannot be resumed")

@app.post("/api/jobs/{job_id}/cancel")
async def cancel_job_route(job_id: str):
    if await cancel_job(job_id):
        return {"status": "cancelled"}
    raise HTTPException(400, "Job is not active")

@app.delete("/api/jobs/{job_id}")
async def delete_job_route(job_id: str):
    await cancel_job(job_id)
    await delete_job(job_id)
    await delete_job_cache(job_id)
    return {"deleted": True}

# API Routes - Events
def parse_event_filters(
    job_id: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    city: str | None = None,
    keyword: str | None = None,
    contact_hidden: bool | None = None,
    has_email: bool | None = None,
    has_phone: bool | None = None
) -> dict:
    return {
        "job_id": job_id, "date_from": date_from, "date_to": date_to,
        "city": city, "keyword": keyword, "contact_hidden": contact_hidden,
        "has_email": has_email, "has_phone": has_phone
    }

@app.get("/api/events")
async def get_events_route(
    page: int = 1, per_page: int = 20,
    job_id: str | None = None, date_from: str | None = None,
    date_to: str | None = None, city: str | None = None,
    keyword: str | None = None, contact_hidden: bool | None = None,
    has_email: bool | None = None, has_phone: bool | None = None
):
    filters = parse_event_filters(job_id, date_from, date_to, city, keyword, contact_hidden, has_email, has_phone)
    events, total = await query_events(filters, page, per_page)
    return {"events": events, "total": total, "page": page, "per_page": per_page}

@app.delete("/api/events")
async def delete_events_route(body: dict = Body(...)):
    deleted = await db_delete_events(body)
    return {"deleted": deleted}

@app.get("/api/events/export/csv")
async def export_csv_route(
    job_id: str | None = None, date_from: str | None = None,
    date_to: str | None = None, city: str | None = None,
    keyword: str | None = None, contact_hidden: bool | None = None,
    has_email: bool | None = None, has_phone: bool | None = None
):
    filters = parse_event_filters(job_id, date_from, date_to, city, keyword, contact_hidden, has_email, has_phone)
    return await export_to_csv(filters)

@app.get("/api/events/export/xlsx")
async def export_xlsx_route(
    job_id: str | None = None, date_from: str | None = None,
    date_to: str | None = None, city: str | None = None,
    keyword: str | None = None, contact_hidden: bool | None = None,
    has_email: bool | None = None, has_phone: bool | None = None
):
    filters = parse_event_filters(job_id, date_from, date_to, city, keyword, contact_hidden, has_email, has_phone)
    return await export_to_xlsx(filters)

# API Routes - Schedules
@app.post("/api/schedule")
async def create_schedule_route(body: dict = Body(...)):
    sched_id = await create_schedule(body)
    return await get_schedule(sched_id)

@app.get("/api/schedule")
async def list_schedules_route():
    schedules = await list_schedules()
    return {"schedules": schedules}

@app.post("/api/schedule/{id}/pause")
async def pause_schedule_route(id: str):
    await pause_schedule_job(id)
    return {"status": "paused"}

@app.post("/api/schedule/{id}/resume")
async def resume_schedule_route(id: str):
    await resume_schedule_job(id)
    return {"status": "active"}

@app.delete("/api/schedule/{id}")
async def delete_schedule_route(id: str):
    await delete_schedule_job(id)
    return {"deleted": True}

# API Routes - Sessions
@app.get("/api/sessions")
async def list_sessions_route():
    sessions = await list_sessions()
    return {"sessions": sessions}

@app.post("/api/sessions")
async def create_session_route(body: dict = Body(...)):
    sess_id = await insert_session(body)
    return {"id": sess_id, **body}

@app.delete("/api/sessions/{id}")
async def delete_session_route(id: str):
    await delete_session(id)
    return {"deleted": True}

# API Routes - Monitor
@app.get("/api/monitor")
async def get_monitor_route():
    return await get_stats()

@app.post("/api/monitor/cleanup/cache-older-than")
async def cleanup_cache_older_route(body: dict = Body(...)):
    return await cleanup_html_cache_older_than(body.get('days', 30))

@app.post("/api/monitor/cleanup/cache-larger-than")
async def cleanup_cache_larger_route(body: dict = Body(...)):
    return await cleanup_html_cache_larger_than(body.get('size_mb', 100.0))

@app.post("/api/monitor/cleanup/events-older-than")
async def cleanup_events_older_route(body: dict = Body(...)):
    return await cleanup_events_older_than(body.get('days', 90))

@app.post("/api/monitor/cleanup/compress")
async def compress_caches_route():
    return await compress_html_caches()

@app.get("/api/monitor/backup")
async def backup_route():
    path = await export_full_backup()
    return {"path": path}

@app.delete("/api/monitor/cleanup/job/{job_id}")
async def delete_job_cache_route(job_id: str):
    return await delete_job_cache(job_id)

# WebSockets
@app.websocket("/ws/jobs/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await websocket.accept()
    
    # Send initial state
    job = await get_job(job_id)
    if job:
        await websocket.send_json({"type": "init", "status": job['status']})
        
    queue = await subscribe(job_id)
    if not queue:
        # Job not running, close cleanly
        await websocket.close()
        return
        
    try:
        while True:
            try:
                message = await asyncio.wait_for(queue.get(), timeout=30.0)
                await websocket.send_json(message)
                # If job is done, close the connection cleanly
                if message.get('type') in ('done', 'error'):
                    await unsubscribe(job_id, queue)
                    break
            except asyncio.TimeoutError:
                # Send a heartbeat ping to keep connection alive
                try:
                    await websocket.send_json({"type": "heartbeat"})
                except Exception:
                    break
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        await unsubscribe(job_id, queue)

# Static files — serve CSS, JS, and other assets from the frontend directory
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")
    # Also mount at root level so index.html can reference ./style.css and ./app.js directly
    app.mount("/frontend", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend")

@app.get("/style.css")
async def serve_css():
    return FileResponse(FRONTEND_DIR / "style.css", media_type="text/css")

@app.get("/app.js")
async def serve_js():
    return FileResponse(FRONTEND_DIR / "app.js", media_type="application/javascript")

@app.get("/")
async def root():
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {"message": "Frontend not found. Make sure the frontend/ directory exists."}
