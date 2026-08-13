"""HTML caching for crash recovery."""
import hashlib
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent

def get_cache_dir(job_id: str) -> Path:
    """Get cache directory for a job, creating it if needed."""
    cache_dir = PROJECT_ROOT / 'data' / 'html_cache' / job_id
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir

def url_to_filename(url: str) -> str:
    """Convert URL to a safe filename using SHA-256."""
    return hashlib.sha256(url.encode('utf-8')).hexdigest()[:16] + '.html'

async def save_html(job_id: str, url: str, html: str) -> str:
    """Save HTML content to cache dir. Returns the file path."""
    cache_dir = get_cache_dir(job_id)
    filename = url_to_filename(url)
    filepath = cache_dir / filename
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
        
    return str(filepath)

async def load_html(job_id: str, url: str) -> str | None:
    """Load cached HTML if it exists."""
    cache_dir = get_cache_dir(job_id)
    filename = url_to_filename(url)
    filepath = cache_dir / filename
    
    if filepath.exists():
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    return None

def is_cached(job_id: str, url: str) -> bool:
    """Check if URL is cached for the job."""
    cache_dir = get_cache_dir(job_id)
    filename = url_to_filename(url)
    filepath = cache_dir / filename
    return filepath.exists()

async def get_cache_size(job_id: str) -> int:
    """Get total bytes in the job's cache dir."""
    cache_dir = get_cache_dir(job_id)
    total_size = 0
    if cache_dir.exists():
        for f in cache_dir.glob('*'):
            if f.is_file():
                total_size += f.stat().st_size
    return total_size

async def delete_cache(job_id: str) -> int:
    """Delete the job's cache dir, returns bytes freed."""
    cache_dir = get_cache_dir(job_id)
    freed = await get_cache_size(job_id)
    
    import shutil
    if cache_dir.exists():
        shutil.rmtree(cache_dir)
        
    return freed
