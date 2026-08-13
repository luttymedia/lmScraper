"""Hash-based deduplication module."""
from backend.storage.db import get_db
from backend.scraper.extractors import content_hash

async def is_duplicate(title: str, date: str, url: str) -> bool:
    """Check if an event exists in the database by hash."""
    h = content_hash(title, date, url)
    async with get_db() as db:
        async with db.execute("SELECT id FROM events WHERE content_hash = ?", (h,)) as cursor:
            row = await cursor.fetchone()
            return row is not None

async def filter_new_events(events: list[dict]) -> list[dict]:
    """Filter out events that already exist in the database."""
    if not events:
        return []
        
    # Pre-compute hashes
    for e in events:
        e['content_hash'] = content_hash(
            e.get('title', ''), 
            e.get('date_start', ''), 
            e.get('event_url', '')
        )
        
    hashes = [e['content_hash'] for e in events]
    placeholders = ','.join(['?'] * len(hashes))
    
    existing_hashes = set()
    async with get_db() as db:
        query = f"SELECT content_hash FROM events WHERE content_hash IN ({placeholders})"
        async with db.execute(query, hashes) as cursor:
            rows = await cursor.fetchall()
            for r in rows:
                existing_hashes.add(r[0])
                
    return [e for e in events if e['content_hash'] not in existing_hashes]
