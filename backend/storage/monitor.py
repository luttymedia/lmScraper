"""Monitor module to check disk usage, caches and database limits."""
import os
import shutil
import zipfile
import asyncio
import aiosqlite
from pathlib import Path
from datetime import datetime, timedelta
from backend.storage.db import get_db_stats, delete_events_older_than, get_db

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / 'data'
HTML_CACHE_DIR = DATA_DIR / 'html_cache'
EXPORTS_DIR = DATA_DIR / 'exports'

def _get_dir_size_sync(path: Path) -> int:
    """Calculate total size of directory in bytes."""
    total_size = 0
    if not path.exists():
        return 0
    for dirpath, _, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if not os.path.islink(fp):
                total_size += os.path.getsize(fp)
    return total_size

async def get_dir_size(path: Path) -> int:
    import asyncio
    return await asyncio.to_thread(_get_dir_size_sync, path)

async def get_stats() -> dict:
    """Get complete storage stats and alerts."""
    db_stats = await get_db_stats()
    
    html_cache_bytes = await get_dir_size(HTML_CACHE_DIR)
    exports_bytes = await get_dir_size(EXPORTS_DIR)
    
    stats = {
        "event_count": db_stats["event_count"],
        "job_count": db_stats["job_count"],
        "db_size_bytes": db_stats["db_size_bytes"],
        "db_size_mb": db_stats["db_size_bytes"] / (1024 * 1024),
        "html_cache_size_bytes": html_cache_bytes,
        "html_cache_size_mb": html_cache_bytes / (1024 * 1024),
        "exports_size_bytes": exports_bytes,
        "alerts": [],
        "has_alerts": False
    }
    
    if stats["db_size_mb"] > 500:
        stats["alerts"].append(f"Database file is very large ({stats['db_size_mb']:.1f} MB)")
    if stats["event_count"] > 50000:
        stats["alerts"].append(f"Event count is high ({stats['event_count']})")
    if stats["html_cache_size_mb"] > 2048:
        stats["alerts"].append(f"HTML cache is very large ({stats['html_cache_size_mb']:.1f} MB)")
        
    stats["has_alerts"] = len(stats["alerts"]) > 0
    return stats

async def cleanup_html_cache_older_than(days: int) -> dict:
    """Delete html_cache subdirs where ALL files are older than N days."""
    deleted_jobs = 0
    freed_bytes = 0
    
    if not HTML_CACHE_DIR.exists():
        return {"deleted_jobs": 0, "freed_bytes": 0}
        
    cutoff_time = datetime.utcnow() - timedelta(days=days)
    cutoff_timestamp = cutoff_time.timestamp()
    
    for job_dir in HTML_CACHE_DIR.iterdir():
        if job_dir.is_dir():
            all_older = True
            dir_size = 0
            for f in job_dir.glob('*'):
                if f.is_file():
                    stat = f.stat()
                    dir_size += stat.st_size
                    if stat.st_mtime >= cutoff_timestamp:
                        all_older = False
                        break
            
            if all_older:
                shutil.rmtree(job_dir)
                deleted_jobs += 1
                freed_bytes += dir_size
                
    return {"deleted_jobs": deleted_jobs, "freed_bytes": freed_bytes}

async def cleanup_html_cache_larger_than(size_mb: float) -> dict:
    """Delete job cache folders exceeding size_mb."""
    deleted_jobs = 0
    freed_bytes = 0
    max_bytes = size_mb * 1024 * 1024
    
    if not HTML_CACHE_DIR.exists():
        return {"deleted_jobs": 0, "freed_bytes": 0}
        
    for job_dir in HTML_CACHE_DIR.iterdir():
        if job_dir.is_dir():
            dir_size = get_dir_size(job_dir)
            if dir_size > max_bytes:
                shutil.rmtree(job_dir)
                deleted_jobs += 1
                freed_bytes += dir_size
                
    return {"deleted_jobs": deleted_jobs, "freed_bytes": freed_bytes}

async def cleanup_events_older_than(days: int) -> dict:
    """Delete old events and clean up orphaned jobs."""
    deleted = await delete_events_older_than(days)
    
    # Delete jobs with no events
    async with get_db() as db:
        await db.execute('''
            DELETE FROM jobs 
            WHERE id NOT IN (SELECT DISTINCT job_id FROM events)
        ''')
        await db.commit()
        
    return {"deleted_events": deleted}

async def compress_html_caches() -> dict:
    """Zip each job cache folder and delete the original folder."""
    compressed_jobs = 0
    freed_bytes = 0
    
    if not HTML_CACHE_DIR.exists():
        return {"compressed_jobs": 0, "freed_bytes": 0}
        
    for job_dir in HTML_CACHE_DIR.iterdir():
        if job_dir.is_dir():
            dir_size = await get_dir_size(job_dir)
            zip_path = f"{job_dir}.zip"
            
            # Create zip
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, _, files in os.walk(job_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, job_dir)
                        zipf.write(file_path, arcname)
                        
            # Remove original dir
            shutil.rmtree(job_dir)
            
            zip_size = os.path.getsize(zip_path)
            compressed_jobs += 1
            freed_bytes += (dir_size - zip_size)
            await asyncio.sleep(0.01)
            
    return {"compressed_jobs": compressed_jobs, "freed_bytes": freed_bytes}

async def compress_single_job_cache(job_id: str) -> dict:
    """Zip a single job cache folder and remove original directory."""
    job_dir = HTML_CACHE_DIR / job_id
    if not job_dir.exists() or not job_dir.is_dir():
        return {"compressed": False, "freed_bytes": 0}
    dir_size = await get_dir_size(job_dir)
    zip_path = f"{job_dir}.zip"
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(job_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, job_dir)
                zipf.write(file_path, arcname)
    shutil.rmtree(job_dir)
    zip_size = os.path.getsize(zip_path)
    return {"compressed": True, "freed_bytes": max(0, dir_size - zip_size)}

async def prune_auto_backups(target: str = "full", max_keep: int = 5) -> int:
    """Keep only the most recent N auto backups; delete older ones. Never touches manual backups."""
    target_dir = PROJECT_ROOT / 'backups' / target
    if not target_dir.exists():
        return 0
    auto_backups = sorted(
        [p for p in target_dir.glob(f"backup_{target}_auto_*.zip")],
        key=lambda p: p.stat().st_mtime
    )
    deleted_count = 0
    while len(auto_backups) > max_keep:
        oldest = auto_backups.pop(0)
        try:
            oldest.unlink()
            deleted_count += 1
        except OSError:
            pass
    return deleted_count

async def has_auto_backup_today() -> bool:
    """Check if an automated backup was already created today."""
    target_dir = PROJECT_ROOT / 'backups' / 'full'
    if not target_dir.exists():
        return False
    today_str = datetime.utcnow().strftime("%Y%m%d")
    for p in target_dir.glob(f"backup_full_auto_{today_str}_*.zip"):
        return True
    return False

async def run_automated_maintenance() -> dict:
    """Run routine background maintenance on HTML caches & automated backups (once per calendar day max):
    1. Check if maintenance ran today. If so, skip.
    2. Compress any uncompressed job HTML cache folders.
    3. Purge caches older than 7 days.
    4. Cap total HTML cache size at 100 MB.
    5. Create an automated full system backup for today.
    6. Prune old automated full backups (keep latest 5).
    """
    if await has_auto_backup_today():
        return {"skipped": True, "reason": "Automated maintenance already executed today"}

    res_compress = await compress_html_caches()
    res_age = await cleanup_html_cache_older_than(days=7)
    res_size = await cleanup_html_cache_larger_than(size_mb=100.0)
    
    # Automated full system backup (once a day)
    auto_backup_path = await export_backup(target="full", is_auto=True)
    deleted_old_autos = await prune_auto_backups(target="full", max_keep=5)
    
    return {
        "skipped": False,
        "compress": res_compress,
        "age_cleanup": res_age,
        "size_cleanup": res_size,
        "auto_backup": auto_backup_path,
        "pruned_auto_backups": deleted_old_autos
    }

async def export_backup(target: str = "full", is_auto: bool = False) -> str:
    """Export data depending on target (full, results, schedules)."""
    import shutil
    import tempfile
    
    target_dir = PROJECT_ROOT / 'backups' / target
    target_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    tag = "auto" if is_auto else "manual"
    backup_zip_path = target_dir / f"backup_{target}_{tag}_{timestamp}.zip"
    
    if target == "full":
        # Zip the entire data dir
        with zipfile.ZipFile(backup_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(DATA_DIR):
                for file in files:
                    file_path = os.path.join(root, file)
                    if str(backup_zip_path) == file_path:
                        continue
                    if EXPORTS_DIR in Path(file_path).parents:
                        continue
                    if file.endswith('.zip') and (PROJECT_ROOT / 'backups') in Path(file_path).parents:
                        continue
                    arcname = os.path.relpath(file_path, DATA_DIR)
                    zipf.write(file_path, arcname)
    else:
        # Partial backups
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_db = Path(tmpdir) / 'lmscraper.db'
            db_source = DATA_DIR / 'lmscraper.db'
            await asyncio.to_thread(shutil.copy2, str(db_source), str(tmp_db))
            
            async with aiosqlite.connect(str(tmp_db)) as db:
                if target == "results":
                    await db.execute("DELETE FROM schedules")
                    await db.execute("DELETE FROM schedule_groups")
                    await db.execute("DELETE FROM schedule_group_memberships")
                elif target == "schedules":
                    await db.execute("DELETE FROM events")
                    await db.execute("DELETE FROM jobs")
                    await db.execute("DELETE FROM job_logs")
                await db.commit()
                await db.execute("VACUUM")
                
            with zipfile.ZipFile(backup_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(tmp_db, 'lmscraper.db')
                if target == "results" and HTML_CACHE_DIR.exists():
                    for root, _, files in os.walk(HTML_CACHE_DIR):
                        for file in files:
                            file_path = os.path.join(root, file)
                            arcname = os.path.relpath(file_path, DATA_DIR)
                            zipf.write(file_path, arcname)
                            
    return str(backup_zip_path)

async def delete_job_cache(job_id: str) -> dict:
    """Delete cache folder for a specific job."""
    job_dir = HTML_CACHE_DIR / job_id
    freed_bytes = 0
    if job_dir.exists() and job_dir.is_dir():
        freed_bytes = await get_dir_size(job_dir)
        shutil.rmtree(job_dir)
    return {"freed_bytes": freed_bytes}

IMPORT_BACKUPS_DIR = DATA_DIR / 'exports' / 'import_backups'
MAX_IMPORT_BACKUPS = 10

async def backup_db_for_import() -> str:
    """Snapshot the live SQLite DB to the import_backups folder."""
    import asyncio

    IMPORT_BACKUPS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    backup_path = IMPORT_BACKUPS_DIR / f"backup_{timestamp}.db"
    db_source = DATA_DIR / 'lmscraper.db'
    await asyncio.to_thread(shutil.copy2, str(db_source), str(backup_path))

    existing = sorted(IMPORT_BACKUPS_DIR.glob('backup_*.db'), key=lambda p: p.stat().st_mtime)
    while len(existing) > MAX_IMPORT_BACKUPS:
        oldest = existing.pop(0)
        try:
            oldest.unlink()
        except OSError:
            pass

    return str(backup_path)

async def purge_data(target: str = "full", skip_locked: bool = True) -> dict:
    """Delete targeted data from the DB and caches.
    
    If skip_locked is True (default), events with is_locked = 1 are preserved.
    If skip_locked is False, ALL events are deleted regardless of lock status.
    """
    freed_bytes = 0
    deleted_jobs = 0
    deleted_events = 0
    deleted_schedules = 0
    deleted_groups = 0
    
    async with get_db() as db:
        if target in ("full", "results"):
            if skip_locked:
                cursor = await db.execute("DELETE FROM events WHERE is_locked = 0")
            else:
                cursor = await db.execute("DELETE FROM events")
            deleted_events = cursor.rowcount
            if skip_locked:
                cursor = await db.execute(
                    "DELETE FROM jobs WHERE id NOT IN (SELECT DISTINCT job_id FROM events WHERE is_locked = 1)"
                )
            else:
                cursor = await db.execute("DELETE FROM jobs")
            deleted_jobs = cursor.rowcount
            await db.execute(
                "DELETE FROM job_logs WHERE job_id NOT IN (SELECT id FROM jobs)"
            )
            
        if target in ("full", "schedules"):
            cursor = await db.execute("DELETE FROM schedules")
            deleted_schedules = cursor.rowcount
            cursor = await db.execute("DELETE FROM schedule_groups")
            deleted_groups = cursor.rowcount
            await db.execute("DELETE FROM schedule_group_memberships")
            
        await db.commit()
        await db.execute("VACUUM")
        
    if target in ("full", "results") and not skip_locked:
        if HTML_CACHE_DIR.exists():
            freed_bytes = await get_dir_size(HTML_CACHE_DIR)
            shutil.rmtree(HTML_CACHE_DIR)
            HTML_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    elif target in ("full", "results") and skip_locked:
        # Still wipe the cache dir since it's just HTML snapshots
        if HTML_CACHE_DIR.exists():
            freed_bytes = await get_dir_size(HTML_CACHE_DIR)
            shutil.rmtree(HTML_CACHE_DIR)
            HTML_CACHE_DIR.mkdir(parents=True, exist_ok=True)
            
    return {
        "deleted_events": deleted_events,
        "deleted_jobs": deleted_jobs,
        "deleted_schedules": deleted_schedules,
        "deleted_groups": deleted_groups,
        "freed_bytes": freed_bytes
    }
