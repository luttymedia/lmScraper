"""FastAPI main application entry point."""
import asyncio
import sys
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query, Body, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio, uuid, json
from pathlib import Path
from urllib.parse import urlparse, quote as urlquote
import urllib.request as urllib_request

from backend.storage.db import (
    init_db, list_jobs, get_job, delete_job, insert_job, get_job_logs,
    query_events, delete_events as db_delete_events,
    list_schedules, get_schedule, insert_session, list_sessions,
    delete_session, get_session_for_domain,
    list_groups, get_group, get_group_schedules
)
from backend.storage.exporter import (
    export_to_csv, export_to_xlsx,
    parse_import_file, compute_import_diff, apply_import as apply_import_diff,
)
from backend.storage.monitor import (
    get_stats, cleanup_html_cache_older_than, cleanup_html_cache_larger_than,
    cleanup_events_older_than, compress_html_caches, export_backup, purge_data,
    delete_job_cache, backup_db_for_import
)
from backend.jobs.manager import (
    start_job, pause_job, resume_job_control, cancel_job,
    subscribe, unsubscribe, resume_from_db, get_active_job_ids,
    is_schedule_running, active_jobs
)
from backend.jobs.scheduler import (
    start_scheduler, shutdown_scheduler, create_schedule,
    pause_schedule_job, resume_schedule_job, delete_schedule_job,
    update_schedule_job,
    create_group_schedule, update_group_schedule, delete_group_schedule,
    pause_group_schedule, resume_group_schedule, reset_group_schedule,
    bulk_assign_to_group, remove_from_group, reorder_group_schedules
)
from backend.scraper.engine import ScraperConfig
from backend.version import VERSION, RELEASE_DATE, CHANGELOG
from backend.tunnel import tunnel_manager

PROJECT_ROOT = Path(__file__).parent.parent
FRONTEND_DIR = PROJECT_ROOT / 'frontend'

async def periodic_maintenance_loop():
    """Periodically run background maintenance on HTML caches (compression, 7-day retention, 100MB cap)."""
    # Delay initial maintenance by 15s so dashboard loads instantly on startup
    await asyncio.sleep(15)
    while True:
        try:
            from backend.storage.monitor import run_automated_maintenance
            await run_automated_maintenance()
        except asyncio.CancelledError:
            break
        except Exception:
            pass
        await asyncio.sleep(4 * 3600)  # Every 4 hours

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for FastAPI."""
    await init_db()
    await start_scheduler()
    maint_task = asyncio.create_task(periodic_maintenance_loop())
    yield
    await tunnel_manager.stop()
    maint_task.cancel()
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
            
    nickname = (body.get('nickname') or '').strip()
    if not nickname:
        style = body.get('dance_style')
        city = (body.get('filters') or {}).get('city')
        platform = body.get('platform', 'goandance')
        platform_name = 'Go&Dance' if platform == 'goandance' else platform.capitalize()
        now_str = datetime.utcnow().strftime('%b %d, %H:%M')
        if style and city:
            nickname = f"{style} in {city} · {now_str}"
        elif style:
            nickname = f"{style} · {now_str}"
        elif city:
            nickname = f"{platform_name} {city} · {now_str}"
        else:
            nickname = f"{platform_name} · {now_str}"

    job_dict = {
        'url': url,
        'filters': filters,
        'concurrency': concurrency,
        'dance_style': body.get('dance_style'),
        'platform': body.get('platform', 'goandance'),
        'nickname': nickname
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
        session_cookies=session_cookies,
        dance_style=body.get('dance_style'),
        platform=body.get('platform', 'goandance')
    )
    
    await start_job(job_id, config)
    return await get_job(job_id)

@app.get("/api/jobs/active")
async def get_active_jobs_status():
    active_ids = get_active_job_ids()
    active_sched_ids = [j.get('schedule_id') for j in active_jobs.values() if j.get('schedule_id')]
    return {
        "has_active_jobs": len(active_ids) > 0,
        "active_job_ids": active_ids,
        "active_schedule_ids": active_sched_ids,
        "count": len(active_ids)
    }

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

@app.get("/api/jobs/{job_id}/logs")
async def get_job_logs_route(job_id: str):
    logs = await get_job_logs(job_id)
    return {"job_id": job_id, "logs": logs}

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
    job_ids: str | None = None,
    updated_by_job_id: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    city: str | None = None,
    keyword: str | None = None,
    contact_hidden: bool | None = None,
    has_contact: bool | None = None,
    has_email: bool | None = None,
    has_phone: bool | None = None,
    sort_by: str | None = None,
    sort_dir: str | None = None,
    show_hidden: str | None = None,
) -> dict:
    return {
        "job_ids": job_ids or job_id, "updated_by_job_id": updated_by_job_id, "date_from": date_from, "date_to": date_to,
        "city": city, "keyword": keyword, "contact_hidden": contact_hidden, "has_contact": has_contact,
        "has_email": has_email, "has_phone": has_phone,
        "sort_by": sort_by, "sort_dir": sort_dir,
        "show_hidden": show_hidden or 'no',
    }

@app.get("/api/events")
async def get_events_route(
    page: int = 1, per_page: int = 20,
    job_id: str | None = None, job_ids: str | None = None,
    updated_by_job_id: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None, city: str | None = None,
    keyword: str | None = None, contact_hidden: bool | None = None,
    has_contact: bool | None = None,
    has_email: bool | None = None, has_phone: bool | None = None,
    sort_by: str | None = None, sort_dir: str | None = None,
    show_hidden: str | None = None,
):
    filters = parse_event_filters(job_id, job_ids, updated_by_job_id, date_from, date_to, city, keyword, contact_hidden, has_contact, has_email, has_phone, sort_by, sort_dir, show_hidden)
    events, total = await query_events(filters, page, per_page)
    return {"events": events, "total": total, "page": page, "per_page": per_page}

@app.delete("/api/events")
async def delete_events_route(body: dict = Body(...)):
    deleted = await db_delete_events(body)
    return {"deleted": deleted}

@app.get("/api/events/export/csv")
async def export_csv_route(
    job_id: str | None = None, job_ids: str | None = None,
    updated_by_job_id: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None, city: str | None = None,
    keyword: str | None = None, contact_hidden: bool | None = None,
    has_contact: bool | None = None,
    has_email: bool | None = None, has_phone: bool | None = None,
    sort_by: str | None = None, sort_dir: str | None = None,
    show_hidden: str | None = None
):
    filters = parse_event_filters(job_id, job_ids, updated_by_job_id, date_from, date_to, city, keyword, contact_hidden, has_contact, has_email, has_phone, sort_by, sort_dir, show_hidden)
    return await export_to_csv(filters)

@app.get("/api/events/export/xlsx")
async def export_xlsx_route(
    job_id: str | None = None, job_ids: str | None = None,
    updated_by_job_id: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None, city: str | None = None,
    keyword: str | None = None, contact_hidden: bool | None = None,
    has_contact: bool | None = None,
    has_email: bool | None = None, has_phone: bool | None = None,
    sort_by: str | None = None, sort_dir: str | None = None,
    show_hidden: str | None = None
):
    filters = parse_event_filters(job_id, job_ids, updated_by_job_id, date_from, date_to, city, keyword, contact_hidden, has_contact, has_email, has_phone, sort_by, sort_dir, show_hidden)
    return await export_to_xlsx(filters)

# API Routes - Import
@app.post("/api/events/import/preview")
async def import_preview_route(
    file: UploadFile = File(...),
    mode: str = Form('partial'),
):
    """Parse the uploaded file and return a diff preview without committing anything."""
    if mode not in ('partial', 'full'):
        raise HTTPException(400, "mode must be 'partial' or 'full'")
    file_bytes = await file.read()
    try:
        df = parse_import_file(file_bytes, file.filename or 'upload.csv')
    except ValueError as exc:
        raise HTTPException(400, str(exc))

    diff = await compute_import_diff(df, mode)
    # Strip internal data before sending to client
    return {
        'mode': diff['mode'],
        'summary': diff['summary'],
        'rows': diff['rows'],
    }

@app.post("/api/events/import/apply")
async def import_apply_route(
    file: UploadFile = File(...),
    mode: str = Form('partial'),
):
    """Re-parse the file, take a DB backup, then apply the diff."""
    if mode not in ('partial', 'full'):
        raise HTTPException(400, "mode must be 'partial' or 'full'")
    file_bytes = await file.read()
    try:
        df = parse_import_file(file_bytes, file.filename or 'upload.csv')
    except ValueError as exc:
        raise HTTPException(400, str(exc))

    backup_path = await backup_db_for_import()
    diff = await compute_import_diff(df, mode)
    applied = await apply_import_diff(diff)
    return {
        'backup_path': backup_path,
        'applied': applied,
    }

# API Routes - Schedules
@app.post("/api/schedule")
async def create_schedule_route(body: dict = Body(...)):
    sched_dict = {
        **body,
        'platform': body.get('platform', 'goandance')
    }
    sched_id = await create_schedule(sched_dict)
    return await get_schedule(sched_id)

@app.get("/api/schedule")
async def list_schedules_route():
    schedules = await list_schedules()
    enriched = []
    for s in schedules:
        is_running = is_schedule_running(s['id'])
        is_active = bool(s.get('active'))
        is_completed = (not is_active and bool(s.get('last_run_at')) and not bool(s.get('next_run_at')))
        
        if is_running:
            status = 'running'
        elif is_active:
            status = 'active'
        elif is_completed:
            status = 'completed'
        else:
            status = 'disabled'
            
        enriched.append({
            **s,
            'is_running': is_running,
            'computed_status': status
        })
    return {"schedules": enriched}

@app.get("/api/schedule/{id}")
async def get_schedule_route(id: str):
    sched = await get_schedule(id)
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return sched

@app.put("/api/schedule/{id}")
async def update_schedule_route(id: str, body: dict = Body(...)):
    await update_schedule_job(id, body)
    return await get_schedule(id)

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

# API Routes - Schedule Groups
@app.post("/api/schedule-groups")
async def create_group_route(body: dict = Body(...)):
    """Create a new schedule group."""
    if not body.get('name'):
        raise HTTPException(400, "Group name is required")
    interval = int(body.get('interval_minutes', 5))
    if interval < 0:
        raise HTTPException(400, "interval_minutes must be >= 0")
    group_dict = {
        'name': body['name'],
        'interval_minutes': interval,
        'loop_mode': body.get('loop_mode', 'once'),
        'start_time': body.get('start_time'),
        'active': 0  # created paused by default if no start_time (handled by create_group_schedule)
    }
    group_id = await create_group_schedule(group_dict)
    return await get_group(group_id)

@app.get("/api/schedule-groups")
async def list_groups_route():
    """List all schedule groups with enriched info."""
    groups = await list_groups()
    enriched = []
    for g in groups:
        schedules = await get_group_schedules(g['id'])
        total = len(schedules)
        current_idx = g.get('current_index', 0)
        is_active = bool(g.get('active'))
        completed = bool(g.get('completed_at'))
        if is_active:
            status = 'active'
        elif completed:
            status = 'completed'
        else:
            status = 'paused'
        enriched.append({
            **g,
            'total_schedules': total,
            'current_schedule_label': schedules[current_idx % total]['label'] if total > 0 else None,
            'status': status
        })
    return {"groups": enriched}

@app.get("/api/schedule-groups/{id}")
async def get_group_route(id: str):
    """Get a single schedule group."""
    group = await get_group(id)
    if not group:
        raise HTTPException(404, "Group not found")
    schedules = await get_group_schedules(id)
    return {**group, 'schedules': schedules, 'total_schedules': len(schedules)}

@app.put("/api/schedule-groups/{id}")
async def update_group_route(id: str, body: dict = Body(...)):
    """Update a schedule group."""
    group = await get_group(id)
    if not group:
        raise HTTPException(404, "Group not found")
    allowed = {'name', 'interval_minutes', 'loop_mode', 'start_time'}
    updates = {k: v for k, v in body.items() if k in allowed}
    if 'interval_minutes' in updates:
        updates['interval_minutes'] = int(updates['interval_minutes'])
    await update_group_schedule(id, updates)
    return await get_group(id)

@app.delete("/api/schedule-groups/{id}")
async def delete_group_route(id: str):
    """Delete a schedule group (schedules are unlinked, not deleted)."""
    await delete_group_schedule(id)
    return {"deleted": True}

@app.post("/api/schedule-groups/{id}/pause")
async def pause_group_route(id: str):
    await pause_group_schedule(id)
    return {"status": "paused"}

@app.post("/api/schedule-groups/{id}/resume")
async def resume_group_route(id: str):
    await resume_group_schedule(id)
    return {"status": "active"}

@app.post("/api/schedule-groups/{id}/reset")
async def reset_group_route(id: str):
    """Reset the group's current_index to 0."""
    await reset_group_schedule(id)
    return {"status": "reset"}

@app.post("/api/schedule-groups/{id}/bulk-assign")
async def bulk_assign_route(id: str, body: dict = Body(...)):
    """Assign a list of schedule IDs to this group."""
    group = await get_group(id)
    if not group:
        raise HTTPException(404, "Group not found")
    schedule_ids = body.get('schedule_ids', [])
    if not isinstance(schedule_ids, list):
        raise HTTPException(400, "schedule_ids must be a list")
    await bulk_assign_to_group(id, schedule_ids)
    return {"assigned": len(schedule_ids)}

@app.post("/api/schedule-groups/{id}/remove-schedule")
async def remove_from_group_route(id: str, body: dict = Body(...)):
    """Remove a single schedule from the group."""
    sched_id = body.get('schedule_id')
    if not sched_id:
        raise HTTPException(400, "schedule_id is required")
    await remove_from_group(id, sched_id)
    return {"removed": True}

@app.post("/api/schedule-groups/{id}/reorder")
async def reorder_group_route(id: str, body: dict = Body(...)):
    """Reorder schedules in a group. Body: {ordered_ids: [...]}."""
    ordered_ids = body.get('ordered_ids', [])
    if not isinstance(ordered_ids, list):
        raise HTTPException(400, "ordered_ids must be a list")
    await reorder_group_schedules(id, ordered_ids)
    return {"reordered": True}

# API Routes - Sessions
@app.get("/api/sessions")
async def list_sessions_route():
    return await list_sessions()

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

@app.post("/api/monitor/cleanup/purge")
async def purge_data_route(payload: dict = Body(...)):
    from backend.storage.monitor import purge_data
    target = payload.get("target", "full")
    res = await purge_data(target)
    mb = res['freed_bytes'] / (1024 * 1024)
    return {"message": f"Purged targeted data. Freed {mb:.2f} MB of cache."}

@app.get("/api/monitor/backup")
async def backup_route(target: str = "full"):
    from backend.storage.monitor import export_backup
    path = await export_backup(target)
    return {"path": path}

@app.get("/api/download")
async def download_file_route(path: str):
    import os
    from fastapi.responses import FileResponse
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, filename=os.path.basename(path))

@app.post("/api/monitor/restore")
async def restore_backup_route(target: str = Form("full"), file: UploadFile = File(...)):
    import zipfile
    import tempfile
    import os
    import shutil
    import aiosqlite
    from backend.storage.monitor import DATA_DIR, HTML_CACHE_DIR

    with tempfile.NamedTemporaryFile(delete=False, suffix=".zip") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
        
    try:
        with zipfile.ZipFile(tmp_path, 'r') as zipf:
            if target == "full":
                zipf.extractall(DATA_DIR)
            else:
                with tempfile.TemporaryDirectory() as tmpdir:
                    zipf.extract('lmscraper.db', path=tmpdir)
                    extracted_db = os.path.join(tmpdir, 'lmscraper.db')
                    
                    db_target = DATA_DIR / 'lmscraper.db'
                    async with aiosqlite.connect(str(db_target)) as db:
                        await db.execute(f"ATTACH DATABASE '{extracted_db}' AS backupdb")
                        
                        if target == "results":
                            await db.execute("DELETE FROM main.events")
                            await db.execute("INSERT INTO main.events SELECT * FROM backupdb.events")
                            await db.execute("DELETE FROM main.jobs")
                            await db.execute("INSERT INTO main.jobs SELECT * FROM backupdb.jobs")
                            await db.execute("DELETE FROM main.job_logs")
                            await db.execute("INSERT INTO main.job_logs SELECT * FROM backupdb.job_logs")
                        elif target == "schedules":
                            await db.execute("DELETE FROM main.schedules")
                            await db.execute("INSERT INTO main.schedules SELECT * FROM backupdb.schedules")
                            await db.execute("DELETE FROM main.schedule_groups")
                            await db.execute("INSERT INTO main.schedule_groups SELECT * FROM backupdb.schedule_groups")
                            await db.execute("DELETE FROM main.schedule_group_memberships")
                            await db.execute("INSERT INTO main.schedule_group_memberships SELECT * FROM backupdb.schedule_group_memberships")
                            
                        await db.commit()
                        await db.execute("DETACH DATABASE backupdb")
                        
                if target == "results":
                    if HTML_CACHE_DIR.exists():
                        shutil.rmtree(HTML_CACHE_DIR)
                    HTML_CACHE_DIR.mkdir(parents=True, exist_ok=True)
                    cache_files = [f for f in zipf.namelist() if f.startswith('html_cache')]
                    zipf.extractall(path=DATA_DIR, members=cache_files)
                    
        return {"message": f"Backup ({target}) restored successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to restore backup: {str(e)}")
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass

@app.delete("/api/monitor/cleanup/job/{job_id}")
async def delete_job_cache_route(job_id: str):
    return await delete_job_cache(job_id)

# API Routes - Version & Changelog
@app.get("/api/version")
async def get_version_route():
    import importlib
    import backend.version
    importlib.reload(backend.version)
    return {
        "version": backend.version.VERSION,
        "release_date": backend.version.RELEASE_DATE,
        "changelog": backend.version.CHANGELOG
    }

# API Routes - Mobile Access Tunnel
@app.get("/api/tunnel/status")
async def get_tunnel_status_route():
    return tunnel_manager.status_dict

@app.post("/api/tunnel/start")
async def start_tunnel_route():
    return await tunnel_manager.start()

@app.post("/api/tunnel/stop")
async def stop_tunnel_route():
    return await tunnel_manager.stop()

# API Routes - Location Autocomplete
@app.get("/api/location-suggest")
async def location_suggest_route(q: str = ""):
    """Proxy Nominatim (OpenStreetMap) to provide location autocomplete suggestions."""
    if not q or len(q.strip()) < 2:
        return []
    def _fetch():
        url = f"https://nominatim.openstreetmap.org/search?q={urlquote(q)}&format=json&limit=7&addressdetails=1&accept-language=es"
        req = urllib_request.Request(url, headers={
            "User-Agent": "LMScraper/1.0 (contact: lmscraper@localhost)",
            "Accept": "application/json"
        })
        data = json.loads(urllib_request.urlopen(req, timeout=6).read())
        results = []
        seen = set()
        for item in data:
            addr = item.get("address", {})
            country_code = addr.get("country_code", "").upper()
            country_name = addr.get("country", "")
            place_type = item.get("type", "")
            display = item.get("display_name", "")
            # Build a short human-readable label
            parts = [p.strip() for p in display.split(",")]
            short_label = ", ".join(parts[:3]) if len(parts) >= 3 else display
            # Derive the primary name (city, town, county, or country)
            primary = (
                addr.get("city") or addr.get("town") or addr.get("village") or
                addr.get("municipality") or addr.get("county") or
                addr.get("state") or addr.get("country") or parts[0]
            )
            key = (primary, country_code)
            if key not in seen:
                seen.add(key)
                results.append({
                    "label": short_label,
                    "primary": primary,
                    "country": country_name,
                    "country_code": country_code,
                    "type": place_type,
                })
        return results
    try:
        return await asyncio.to_thread(_fetch)
    except Exception:
        return []

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
        # Job not running, close cleanly, but send final state if possible
        if job and job['status'] == 'failed':
            await websocket.send_json({"type": "error", "message": job.get('error_message', 'Job failed immediately')})
        elif job and job['status'] == 'done':
            await websocket.send_json({"type": "done", "events_found": job.get('events_found'), "events_new": job.get('events_new')})
        elif job and job['status'] == 'cancelled':
            await websocket.send_json({"type": "cancelled"})
            
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

NO_CACHE_HEADERS = {
    "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0"
}

# Static files — serve CSS, JS, and other assets from the frontend directory
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")
    app.mount("/frontend", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend")

@app.get("/style.css")
async def serve_css():
    return FileResponse(FRONTEND_DIR / "style.css", media_type="text/css", headers=NO_CACHE_HEADERS)

@app.get("/app.js")
async def serve_js():
    return FileResponse(FRONTEND_DIR / "app.js", media_type="application/javascript", headers=NO_CACHE_HEADERS)

@app.get("/favicon-192.png")
@app.get("/favicon.ico")
async def serve_favicon():
    fav = FRONTEND_DIR / "favicon-192.png"
    if fav.exists():
        return FileResponse(fav, media_type="image/png", headers=NO_CACHE_HEADERS)
    return {"error": "Favicon not found"}

@app.get("/icon-512.png")
async def serve_icon_512():
    icon = FRONTEND_DIR / "icon-512.png"
    if icon.exists():
        return FileResponse(icon, media_type="image/png", headers=NO_CACHE_HEADERS)
    return {"error": "Icon not found"}

@app.get("/")
async def root():
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path, headers=NO_CACHE_HEADERS)
    return {"message": "Frontend not found. Make sure the frontend/ directory exists."}
