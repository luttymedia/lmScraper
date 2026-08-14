"""Database module for lmScraper."""
import aiosqlite
import json
import uuid
from pathlib import Path
from datetime import datetime
from contextlib import asynccontextmanager

PROJECT_ROOT = Path(__file__).parent.parent.parent
DB_PATH = PROJECT_ROOT / 'data' / 'lmscraper.db'

@asynccontextmanager
async def get_db():
    """Async context manager for SQLite database connection."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = await aiosqlite.connect(str(DB_PATH), timeout=30.0)
    conn.row_factory = aiosqlite.Row
    await conn.execute("PRAGMA busy_timeout = 10000;")
    await conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
    finally:
        await conn.close()

async def init_db() -> None:
    """Initialize the database schema."""
    async with get_db() as db:
        await db.execute("PRAGMA journal_mode=WAL;")
        await db.execute("PRAGMA synchronous=NORMAL;")
        await db.execute('''
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id TEXT NOT NULL,
                scraped_at TEXT NOT NULL,
                content_hash TEXT UNIQUE NOT NULL,
                title TEXT,
                date_start TEXT,
                date_end TEXT,
                venue TEXT,
                city TEXT,
                country TEXT,
                price TEXT,
                description TEXT,
                category TEXT,
                image_url TEXT,
                event_url TEXT,
                organizer_name TEXT,
                organizer_email TEXT,
                organizer_phone TEXT,
                organizer_instagram TEXT,
                organizer_facebook TEXT,
                organizer_tiktok TEXT,
                organizer_whatsapp TEXT,
                organizer_youtube TEXT,
                organizer_twitter TEXT,
                organizer_website TEXT,
                contact_hidden INTEGER DEFAULT 0,
                source_domain TEXT,
                html_cache_path TEXT,
                dance_style TEXT,
                platform TEXT DEFAULT 'goandance'
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                url TEXT NOT NULL,
                filters TEXT,
                status TEXT DEFAULT 'pending',
                concurrency INTEGER DEFAULT 2,
                created_at TEXT NOT NULL,
                started_at TEXT,
                finished_at TEXT,
                events_found INTEGER DEFAULT 0,
                events_new INTEGER DEFAULT 0,
                error_message TEXT,
                resume_cursor TEXT,
                schedule_id TEXT,
                dance_style TEXT,
                platform TEXT DEFAULT 'goandance',
                nickname TEXT
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS schedules (
                id TEXT PRIMARY KEY,
                url TEXT NOT NULL,
                filters TEXT,
                cron_expression TEXT NOT NULL,
                next_run_at TEXT,
                last_run_at TEXT,
                active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                label TEXT,
                platform TEXT DEFAULT 'goandance'
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                site_domain TEXT NOT NULL,
                label TEXT NOT NULL,
                cookies_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        ''')
        await db.commit()
        
        # Migrations
        try:
            await db.execute("ALTER TABLE events ADD COLUMN dance_style TEXT")
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists
            
        try:
            await db.execute('ALTER TABLE jobs ADD COLUMN dance_style TEXT')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        try:
            await db.execute('ALTER TABLE jobs ADD COLUMN platform TEXT DEFAULT "goandance"')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        try:
            await db.execute('ALTER TABLE jobs ADD COLUMN nickname TEXT')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        try:
            await db.execute('ALTER TABLE schedules ADD COLUMN platform TEXT DEFAULT "goandance"')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        try:
            await db.execute('ALTER TABLE schedules ADD COLUMN dance_style TEXT')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        try:
            await db.execute('ALTER TABLE events ADD COLUMN platform TEXT DEFAULT "goandance"')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        # Clean up any orphaned events whose job_id was deleted
        try:
            await db.execute("DELETE FROM events WHERE job_id NOT IN (SELECT id FROM jobs)")
            await db.commit()
        except Exception:
            pass

        # Update historical content hashes to language-agnostic normalized hashes
        try:
            from backend.scraper.extractors import content_hash
            async with db.execute("SELECT id, title, date_start, event_url, content_hash FROM events") as cursor:
                rows = await cursor.fetchall()
                for row in rows:
                    eid, title, date_start, event_url, current_hash = row[0], row[1], row[2], row[3], row[4]
                    if event_url:
                        correct_hash = content_hash(title, date_start, event_url)
                        if current_hash != correct_hash:
                            try:
                                await db.execute("UPDATE events SET content_hash = ? WHERE id = ?", (correct_hash, eid))
                            except Exception:
                                # Duplicate collision with another already normalized record
                                await db.execute("DELETE FROM events WHERE id = ?", (eid,))
            await db.commit()
        except Exception:
            pass

async def insert_event(event_dict: dict) -> int | None:
    """Insert a new event. Returns the inserted ID or None if duplicate hash."""
    keys = list(event_dict.keys())
    values = tuple(event_dict[k] for k in keys)
    placeholders = ', '.join(['?'] * len(keys))
    cols = ', '.join(keys)
    
    query = f"INSERT INTO events ({cols}) VALUES ({placeholders})"
    
    async with get_db() as db:
        try:
            cursor = await db.execute(query, values)
            await db.commit()
            return cursor.lastrowid
        except aiosqlite.IntegrityError:
            return None

async def query_events(filters: dict, page: int, per_page: int) -> tuple[list[dict], int]:
    """Query events with pagination and filters."""
    conditions = []
    params = []
    
    job_ids_raw = filters.get('job_ids') or filters.get('job_id')
    if job_ids_raw:
        if isinstance(job_ids_raw, list):
            ids = [str(j).strip() for j in job_ids_raw if str(j).strip()]
        else:
            ids = [jid.strip() for jid in str(job_ids_raw).split(',') if jid.strip()]
        if len(ids) == 1:
            conditions.append("job_id = ?")
            params.append(ids[0])
        elif len(ids) > 1:
            placeholders = ', '.join(['?'] * len(ids))
            conditions.append(f"job_id IN ({placeholders})")
            params.extend(ids)
    
    if filters.get('date_from'):
        conditions.append("date_start >= ?")
        params.append(filters['date_from'])
        
    if filters.get('date_to'):
        conditions.append("date_start <= ?")
        params.append(filters['date_to'])
        
    if filters.get('city'):
        conditions.append("city LIKE ?")
        params.append(f"%{filters['city']}%")
        
    if filters.get('keyword'):
        conditions.append("(title LIKE ? OR description LIKE ? OR category LIKE ?)")
        params.extend([f"%{filters['keyword']}%"] * 3)
        
    if filters.get('contact_hidden') is not None:
        conditions.append("contact_hidden = ?")
        params.append(1 if filters['contact_hidden'] else 0)
        
    if filters.get('has_email'):
        conditions.append("organizer_email IS NOT NULL AND organizer_email != ''")
        
    if filters.get('has_phone'):
        conditions.append("organizer_phone IS NOT NULL AND organizer_phone != ''")
        
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    # Safe sorting
    sort_by = filters.get('sort_by')
    sort_dir = (filters.get('sort_dir') or 'desc').upper()
    if sort_dir not in ('ASC', 'DESC'):
        sort_dir = 'DESC'
        
    allowed_sort_cols = {
        'title', 'date_start', 'city', 'price', 'category', 'organizer_name', 'scraped_at', 'platform', 'dance_style'
    }
    order_col = sort_by if sort_by in allowed_sort_cols else 'scraped_at'
    
    count_query = f"SELECT COUNT(*) FROM events WHERE {where_clause}"
    query = f"SELECT * FROM events WHERE {where_clause} ORDER BY {order_col} {sort_dir} LIMIT ? OFFSET ?"
    
    pagination_params = params + [per_page, (page - 1) * per_page]
    
    async with get_db() as db:
        async with db.execute(count_query, params) as cursor:
            row = await cursor.fetchone()
            total = row[0] if row else 0
            
        async with db.execute(query, pagination_params) as cursor:
            rows = await cursor.fetchall()
            events = [dict(row) for row in rows]
            
    return events, total

async def delete_events(filters: dict) -> int:
    """Delete events matching filters."""
    conditions = []
    params = []
    
    job_ids_raw = filters.get('job_ids') or filters.get('job_id')
    if job_ids_raw:
        if isinstance(job_ids_raw, list):
            ids = [str(j).strip() for j in job_ids_raw if str(j).strip()]
        else:
            ids = [jid.strip() for jid in str(job_ids_raw).split(',') if jid.strip()]
        if len(ids) == 1:
            conditions.append("job_id = ?")
            params.append(ids[0])
        elif len(ids) > 1:
            placeholders = ', '.join(['?'] * len(ids))
            conditions.append(f"job_id IN ({placeholders})")
            params.extend(ids)
    
    where_clause = " AND ".join(conditions) if conditions else "1=0" # Fail safe
    if where_clause == "1=0":
        return 0
        
    query = f"DELETE FROM events WHERE {where_clause}"
    
    async with get_db() as db:
        cursor = await db.execute(query, params)
        await db.commit()
        return cursor.rowcount

async def delete_events_older_than(days: int) -> int:
    """Delete events older than specified days."""
    query = "DELETE FROM events WHERE date(scraped_at) <= date('now', ?)"
    param = f"-{days} days"
    
    async with get_db() as db:
        cursor = await db.execute(query, (param,))
        await db.commit()
        return cursor.rowcount

async def insert_job(job_dict: dict) -> str:
    """Insert a new job record."""
    job_id = str(uuid.uuid4())
    job_dict['id'] = job_id
    job_dict['created_at'] = datetime.utcnow().isoformat()
    if 'filters' in job_dict and isinstance(job_dict['filters'], dict):
        job_dict['filters'] = json.dumps(job_dict['filters'])
        
    keys = list(job_dict.keys())
    values = tuple(job_dict[k] for k in keys)
    placeholders = ', '.join(['?'] * len(keys))
    cols = ', '.join(keys)
    
    query = f"INSERT INTO jobs ({cols}) VALUES ({placeholders})"
    
    async with get_db() as db:
        await db.execute(query, values)
        await db.commit()
        
    return job_id

async def update_job(job_id: str, updates: dict) -> None:
    """Update an existing job."""
    if not updates:
        return
        
    set_clauses = []
    values = []
    for k, v in updates.items():
        set_clauses.append(f"{k} = ?")
        if k == 'filters' and isinstance(v, dict):
            values.append(json.dumps(v))
        else:
            values.append(v)
            
    values.append(job_id)
    query = f"UPDATE jobs SET {', '.join(set_clauses)} WHERE id = ?"
    
    async with get_db() as db:
        await db.execute(query, values)
        await db.commit()

async def get_job(job_id: str) -> dict | None:
    """Get a job by ID."""
    query = """
        SELECT j.*, s.label as schedule_label, s.cron_expression as schedule_cron
        FROM jobs j
        LEFT JOIN schedules s ON j.schedule_id = s.id
        WHERE j.id = ?
    """
    async with get_db() as db:
        async with db.execute(query, (job_id,)) as cursor:
            row = await cursor.fetchone()
            if row:
                d = dict(row)
                if d.get('filters'):
                    try:
                        d['filters'] = json.loads(d['filters'])
                    except:
                        pass
                return d
            return None

async def list_jobs(page: int, per_page: int) -> tuple[list[dict], int]:
    """List jobs with pagination."""
    count_query = "SELECT COUNT(*) FROM jobs"
    query = """
        SELECT j.*, s.label as schedule_label, s.cron_expression as schedule_cron
        FROM jobs j
        LEFT JOIN schedules s ON j.schedule_id = s.id
        ORDER BY j.created_at DESC LIMIT ? OFFSET ?
    """
    
    async with get_db() as db:
        async with db.execute(count_query) as cursor:
            row = await cursor.fetchone()
            total = row[0] if row else 0
            
        async with db.execute(query, (per_page, (page - 1) * per_page)) as cursor:
            rows = await cursor.fetchall()
            jobs = []
            for r in rows:
                d = dict(r)
                if d.get('filters'):
                    try:
                        d['filters'] = json.loads(d['filters'])
                    except:
                        pass
                jobs.append(d)
                
    return jobs, total

async def delete_job(job_id: str) -> None:
    """Delete a job and its associated events."""
    async with get_db() as db:
        await db.execute("DELETE FROM events WHERE job_id = ?", (job_id,))
        await db.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
        await db.commit()

async def insert_schedule(sched_dict: dict) -> str:
    """Insert a new schedule."""
    sched_id = str(uuid.uuid4())
    sched_dict['id'] = sched_id
    sched_dict['created_at'] = datetime.utcnow().isoformat()
    if 'filters' in sched_dict and isinstance(sched_dict['filters'], dict):
        sched_dict['filters'] = json.dumps(sched_dict['filters'])
        
    keys = list(sched_dict.keys())
    values = tuple(sched_dict[k] for k in keys)
    placeholders = ', '.join(['?'] * len(keys))
    cols = ', '.join(keys)
    
    query = f"INSERT INTO schedules ({cols}) VALUES ({placeholders})"
    
    async with get_db() as db:
        await db.execute(query, values)
        await db.commit()
        
    return sched_id

async def update_schedule(sched_id: str, updates: dict) -> None:
    """Update a schedule."""
    if not updates:
        return
        
    set_clauses = []
    values = []
    for k, v in updates.items():
        set_clauses.append(f"{k} = ?")
        if k == 'filters' and isinstance(v, dict):
            values.append(json.dumps(v))
        else:
            values.append(v)
            
    values.append(sched_id)
    query = f"UPDATE schedules SET {', '.join(set_clauses)} WHERE id = ?"
    
    async with get_db() as db:
        await db.execute(query, values)
        await db.commit()

async def get_schedule(sched_id: str) -> dict | None:
    """Get a schedule by ID."""
    async with get_db() as db:
        async with db.execute("SELECT * FROM schedules WHERE id = ?", (sched_id,)) as cursor:
            row = await cursor.fetchone()
            if row:
                d = dict(row)
                if d.get('filters'):
                    try:
                        d['filters'] = json.loads(d['filters'])
                    except:
                        pass
                return d
            return None

async def list_schedules() -> list[dict]:
    """List all schedules."""
    async with get_db() as db:
        async with db.execute("SELECT * FROM schedules ORDER BY created_at DESC") as cursor:
            rows = await cursor.fetchall()
            schedules = []
            for r in rows:
                d = dict(r)
                if d.get('filters'):
                    try:
                        d['filters'] = json.loads(d['filters'])
                    except:
                        pass
                schedules.append(d)
            return schedules

async def delete_schedule(sched_id: str) -> None:
    """Delete a schedule."""
    async with get_db() as db:
        await db.execute("DELETE FROM schedules WHERE id = ?", (sched_id,))
        await db.commit()

async def insert_session(sess_dict: dict) -> str:
    """Insert a new session."""
    sess_id = str(uuid.uuid4())
    sess_dict['id'] = sess_id
    sess_dict['created_at'] = datetime.utcnow().isoformat()
    if 'cookies_json' in sess_dict and isinstance(sess_dict['cookies_json'], (list, dict)):
        sess_dict['cookies_json'] = json.dumps(sess_dict['cookies_json'])
        
    keys = list(sess_dict.keys())
    values = tuple(sess_dict[k] for k in keys)
    placeholders = ', '.join(['?'] * len(keys))
    cols = ', '.join(keys)
    
    query = f"INSERT INTO sessions ({cols}) VALUES ({placeholders})"
    
    async with get_db() as db:
        await db.execute(query, values)
        await db.commit()
        
    return sess_id

async def list_sessions() -> list[dict]:
    """List all sessions."""
    async with get_db() as db:
        async with db.execute("SELECT * FROM sessions ORDER BY created_at DESC") as cursor:
            rows = await cursor.fetchall()
            sessions = []
            for r in rows:
                d = dict(r)
                if d.get('cookies_json'):
                    try:
                        d['cookies_json'] = json.loads(d['cookies_json'])
                    except:
                        pass
                sessions.append(d)
            return sessions

async def delete_session(sess_id: str) -> None:
    """Delete a session."""
    async with get_db() as db:
        await db.execute("DELETE FROM sessions WHERE id = ?", (sess_id,))
        await db.commit()

async def get_session_for_domain(domain: str) -> dict | None:
    """Get latest session for a domain."""
    async with get_db() as db:
        async with db.execute("SELECT * FROM sessions WHERE site_domain = ? ORDER BY created_at DESC LIMIT 1", (domain,)) as cursor:
            row = await cursor.fetchone()
            if row:
                d = dict(row)
                if d.get('cookies_json'):
                    try:
                        d['cookies_json'] = json.loads(d['cookies_json'])
                    except:
                        pass
                return d
            return None

async def get_db_stats() -> dict:
    """Get database statistics."""
    stats = {
        "event_count": 0,
        "job_count": 0,
        "db_size_bytes": 0
    }
    
    async with get_db() as db:
        async with db.execute("SELECT COUNT(*) FROM events") as cursor:
            row = await cursor.fetchone()
            if row: stats["event_count"] = row[0]
            
        async with db.execute("SELECT COUNT(*) FROM jobs") as cursor:
            row = await cursor.fetchone()
            if row: stats["job_count"] = row[0]
            
    if DB_PATH.exists():
        stats["db_size_bytes"] = DB_PATH.stat().st_size
        
    return stats
