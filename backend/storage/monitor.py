"""Monitor module to check disk usage, caches and database limits."""
import os
import shutil
import zipfile
from pathlib import Path
from datetime import datetime, timedelta
from backend.storage.db import get_db_stats, delete_events_older_than, get_db

PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / 'data'
HTML_CACHE_DIR = DATA_DIR / 'html_cache'
EXPORTS_DIR = DATA_DIR / 'exports'

def get_dir_size(path: Path) -> int:
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

async def get_stats() -> dict:
    """Get complete storage stats and alerts."""
    db_stats = await get_db_stats()
    
    html_cache_bytes = get_dir_size(HTML_CACHE_DIR)
    exports_bytes = get_dir_size(EXPORTS_DIR)
    
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
            dir_size = get_dir_size(job_dir)
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
            
    return {"compressed_jobs": compressed_jobs, "freed_bytes": freed_bytes}

async def export_full_backup() -> str:
    """Export all data to XLSX and zip the entire data dir."""
    from backend.storage.exporter import export_to_xlsx
    
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Create DB export first
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    xlsx_path = EXPORTS_DIR / f"full_export_{timestamp}.xlsx"
    
    response = await export_to_xlsx({})
    with open(xlsx_path, 'wb') as f:
        async for chunk in response.body_iterator:
            f.write(chunk)
            
    # Zip the entire data dir
    backup_zip_path = EXPORTS_DIR / f"backup_{timestamp}.zip"
    with zipfile.ZipFile(backup_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(DATA_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                # Skip the backup zip we are creating and any other zips in exports
                if str(backup_zip_path) == file_path:
                    continue
                if file.endswith('.zip') and EXPORTS_DIR in Path(file_path).parents:
                    continue
                arcname = os.path.relpath(file_path, DATA_DIR)
                zipf.write(file_path, arcname)
                
    return str(backup_zip_path)

async def delete_job_cache(job_id: str) -> dict:
    """Delete cache folder for a specific job."""
    job_dir = HTML_CACHE_DIR / job_id
    freed_bytes = 0
    if job_dir.exists() and job_dir.is_dir():
        freed_bytes = get_dir_size(job_dir)
        shutil.rmtree(job_dir)
    return {"freed_bytes": freed_bytes}
