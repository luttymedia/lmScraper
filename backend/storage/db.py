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
                platform TEXT DEFAULT 'goandance',
                updated_by_jobs TEXT
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
                events_updated INTEGER DEFAULT 0,
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
                platform TEXT DEFAULT 'goandance',
                group_id TEXT,
                order_index INTEGER DEFAULT 0
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS schedule_groups (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                interval_minutes INTEGER NOT NULL DEFAULT 5,
                loop_mode TEXT NOT NULL DEFAULT 'loop',
                current_index INTEGER NOT NULL DEFAULT 0,
                active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                last_triggered_at TEXT,
                completed_at TEXT,
                start_time TEXT

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
        await db.execute('''
            CREATE TABLE IF NOT EXISTS schedule_group_memberships (
                group_id TEXT NOT NULL,
                schedule_id TEXT NOT NULL,
                order_index INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (group_id, schedule_id),
                FOREIGN KEY (group_id) REFERENCES schedule_groups(id) ON DELETE CASCADE,
                FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS job_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                level TEXT DEFAULT 'info',
                message TEXT NOT NULL,
                FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
            )
        ''')
        await db.execute('CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id)')
        await db.commit()
        
        # Migrations
        # Migrate legacy single-group assignments to join table
        await db.execute('''
            INSERT OR IGNORE INTO schedule_group_memberships (group_id, schedule_id, order_index)
            SELECT group_id, id, order_index 
            FROM schedules 
            WHERE group_id IS NOT NULL
            AND group_id IN (SELECT id FROM schedule_groups)
        ''')
        await db.commit()
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
            await db.execute('ALTER TABLE events ADD COLUMN updated_by_jobs TEXT')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        try:
            await db.execute('ALTER TABLE jobs ADD COLUMN nickname TEXT')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        try:
            await db.execute('ALTER TABLE jobs ADD COLUMN events_updated INTEGER DEFAULT 0')
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
            await db.execute('ALTER TABLE schedules ADD COLUMN group_id TEXT')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        try:
            await db.execute('ALTER TABLE schedules ADD COLUMN order_index INTEGER DEFAULT 0')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        try:
            await db.execute('ALTER TABLE schedule_groups ADD COLUMN start_time TEXT')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        try:
            await db.execute('ALTER TABLE events ADD COLUMN platform TEXT DEFAULT "goandance"')
            await db.commit()
        except aiosqlite.OperationalError:
            pass  # Column already exists

        try:
            await db.execute('ALTER TABLE events ADD COLUMN is_hidden INTEGER DEFAULT 0')
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

async def insert_event(event_dict: dict) -> tuple[int | None, str]:
    """Insert a new event. Returns (inserted_id, status_string) where status is 'new', 'duplicate_updated', or 'duplicate'."""
    keys = list(event_dict.keys())
    values = tuple(event_dict[k] for k in keys)
    placeholders = ', '.join(['?'] * len(keys))
    cols = ', '.join(keys)
    
    query = f"INSERT INTO events ({cols}) VALUES ({placeholders})"
    
    async with get_db() as db:
        try:
            cursor = await db.execute(query, values)
            await db.commit()
            return cursor.lastrowid, "new"
        except aiosqlite.IntegrityError:
            if 'dance_style' in event_dict and event_dict['dance_style']:
                new_style = event_dict['dance_style'].strip()
                if new_style:
                    content_hash = event_dict.get('content_hash')
                    if content_hash:
                        async with db.execute("SELECT dance_style, updated_by_jobs FROM events WHERE content_hash = ?", (content_hash,)) as cursor:
                            row = await cursor.fetchone()
                            if row:
                                existing_styles = []
                                if row[0]:
                                    existing_styles = [s.strip() for s in row[0].split(',') if s.strip()]
                                
                                existing_jobs = []
                                if row[1]:
                                    existing_jobs = [j.strip() for j in row[1].split(',') if j.strip()]
                                
                                existing_styles_lower = [s.lower() for s in existing_styles]
                                if new_style.lower() not in existing_styles_lower:
                                    existing_styles.append(new_style)
                                    merged_styles = ', '.join(existing_styles)
                                    
                                    current_job_id = event_dict.get('job_id')
                                    if current_job_id and current_job_id not in existing_jobs:
                                        existing_jobs.append(current_job_id)
                                    merged_jobs = ', '.join(existing_jobs) if existing_jobs else None
                                    
                                    await db.execute("UPDATE events SET dance_style = ?, updated_by_jobs = ? WHERE content_hash = ?", (merged_styles, merged_jobs, content_hash))
                                    await db.commit()
                                    return None, "duplicate_updated"
            return None, "duplicate"

async def query_events(filters: dict, page: int, per_page: int) -> tuple[list[dict], int]:
    """Query events with pagination and filters."""
    conditions = []
    params = []

    # show_hidden: 'all' shows everything, 'only' shows only hidden, default hides hidden
    show_hidden = filters.get('show_hidden', 'no')
    if show_hidden == 'only':
        conditions.append("is_hidden = 1")
    elif show_hidden == 'all':
        pass  # No filter — show everything
    else:
        conditions.append("is_hidden = 0")
    
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
        
    if filters.get('updated_by_job_id'):
        conditions.append("updated_by_jobs LIKE ?")
        params.append(f"%{filters['updated_by_job_id']}%")
        
    if filters.get('date_to'):
        conditions.append("date_start <= ?")
        params.append(filters['date_to'])
        
    if filters.get('city'):
        conditions.append("(city LIKE ? OR country LIKE ?)")
        params.extend([f"%{filters['city']}%", f"%{filters['city']}%"])
        
    if filters.get('keyword'):
        kw_cols = [
            "title", "description", "category", "dance_style",
            "city", "country", "venue", "organizer_name", "platform",
            "organizer_email", "organizer_phone", "organizer_instagram",
            "organizer_facebook", "organizer_tiktok", "organizer_whatsapp",
            "organizer_youtube", "organizer_twitter", "organizer_website",
            "event_url", "date_start", "date_end", "price"
        ]
        kw_cond = " OR ".join([f"{col} LIKE ?" for col in kw_cols])
        conditions.append(f"({kw_cond})")
        params.extend([f"%{filters['keyword']}%"] * len(kw_cols))
        
    if filters.get('contact_hidden') is not None:
        val = filters['contact_hidden']
        if isinstance(val, str):
            val = val.lower() in ('true', '1')
        conditions.append("contact_hidden = ?")
        params.append(1 if val else 0)
        
    contact_cols = [
        "organizer_email", "organizer_phone", "organizer_instagram",
        "organizer_facebook", "organizer_tiktok", "organizer_whatsapp",
        "organizer_youtube", "organizer_twitter", "organizer_website"
    ]

    if filters.get('has_contact') is not None:
        val = filters['has_contact']
        if isinstance(val, str):
            val = val.lower() in ('true', '1')
        if val:
            has_cond = " OR ".join([f"({col} IS NOT NULL AND {col} != '')" for col in contact_cols])
            conditions.append(f"({has_cond})")
        else:
            no_cond = " AND ".join([f"({col} IS NULL OR {col} = '')" for col in contact_cols])
            conditions.append(f"({no_cond})")

    if filters.get('has_email') is not None:
        val = filters['has_email']
        if isinstance(val, str):
            val = val.lower() in ('true', '1')
        if val:
            conditions.append("organizer_email IS NOT NULL AND organizer_email != ''")
        else:
            conditions.append("(organizer_email IS NULL OR organizer_email = '')")
        
    if filters.get('has_phone') is not None:
        val = filters['has_phone']
        if isinstance(val, str):
            val = val.lower() in ('true', '1')
        if val:
            conditions.append("organizer_phone IS NOT NULL AND organizer_phone != ''")
        else:
            conditions.append("(organizer_phone IS NULL OR organizer_phone = '')")
        
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    # Safe sorting
    sort_by = filters.get('sort_by')
    sort_dir = (filters.get('sort_dir') or 'desc').upper()
    if sort_dir not in ('ASC', 'DESC'):
        sort_dir = 'DESC'
        
    sort_mapping = {
        'title': 'title',
        'date': 'date_start',
        'date_start': 'date_start',
        'city': 'city',
        'price': 'price',
        'category': 'category',
        'organizer': 'organizer_name',
        'organizer_name': 'organizer_name',
        'scraped_at': 'scraped_at',
        'platform': 'platform',
        'dance_style': 'dance_style',
        'hidden_contact': 'contact_hidden',
        'contact_hidden': 'contact_hidden',
        'source': "COALESCE(NULLIF(event_url, ''), NULLIF(source_domain, ''))",
        'socials': "(CASE WHEN (organizer_email IS NOT NULL AND organizer_email != '') OR (organizer_phone IS NOT NULL AND organizer_phone != '') OR (organizer_whatsapp IS NOT NULL AND organizer_whatsapp != '') OR (organizer_instagram IS NOT NULL AND organizer_instagram != '') OR (organizer_facebook IS NOT NULL AND organizer_facebook != '') OR (organizer_website IS NOT NULL AND organizer_website != '') THEN 1 ELSE 0 END)",
    }
    order_col = sort_mapping.get(sort_by, 'scraped_at')
    
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
    """Delete a job, its associated events, and logs."""
    async with get_db() as db:
        await db.execute("DELETE FROM job_logs WHERE job_id = ?", (job_id,))
        await db.execute("DELETE FROM events WHERE job_id = ?", (job_id,))
        await db.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
        await db.commit()

async def insert_job_log(job_id: str, level: str, message: str) -> None:
    """Insert a log line for a job."""
    async with get_db() as db:
        await db.execute(
            "INSERT INTO job_logs (job_id, timestamp, level, message) VALUES (?, ?, ?, ?)",
            (job_id, datetime.utcnow().isoformat(), level or 'info', message)
        )
        await db.commit()

async def get_job_logs(job_id: str) -> list[dict]:
    """Get all log lines for a job ordered chronologically."""
    query = "SELECT timestamp, level, message FROM job_logs WHERE job_id = ? ORDER BY id ASC"
    async with get_db() as db:
        async with db.execute(query, (job_id,)) as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]

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
    """Get a schedule by ID, including its assigned group IDs."""
    async with get_db() as db:
        query = """
            SELECT s.*, GROUP_CONCAT(m.group_id) as group_ids
            FROM schedules s
            LEFT JOIN schedule_group_memberships m ON s.id = m.schedule_id
            WHERE s.id = ?
            GROUP BY s.id
        """
        async with db.execute(query, (sched_id,)) as cursor:
            row = await cursor.fetchone()
            if row:
                d = dict(row)
                d['group_ids'] = d['group_ids'].split(',') if d.get('group_ids') else []
                d.pop('group_id', None)
                if d.get('filters'):
                    try:
                        d['filters'] = json.loads(d['filters'])
                    except:
                        pass
                return d
            return None

async def list_schedules() -> list[dict]:
    """List all schedules, including their assigned group IDs."""
    async with get_db() as db:
        query = """
            SELECT s.*, GROUP_CONCAT(m.group_id) as group_ids
            FROM schedules s
            LEFT JOIN schedule_group_memberships m ON s.id = m.schedule_id
            GROUP BY s.id
            ORDER BY s.created_at DESC
        """
        async with db.execute(query) as cursor:
            rows = await cursor.fetchall()
            schedules = []
            for r in rows:
                d = dict(r)
                # Parse group_ids from comma-separated string to list
                d['group_ids'] = d['group_ids'].split(',') if d.get('group_ids') else []
                # Remove legacy group_id so frontend stops using it
                d.pop('group_id', None)
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
        await db.execute("DELETE FROM schedule_group_memberships WHERE schedule_id = ?", (sched_id,))
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

# ── Schedule Groups ──────────────────────────────────────────────────────────

async def insert_group(group_dict: dict) -> str:
    """Insert a new schedule group."""
    group_id = str(uuid.uuid4())
    group_dict['id'] = group_id
    group_dict['created_at'] = datetime.utcnow().isoformat()
    group_dict.setdefault('current_index', 0)
    group_dict.setdefault('active', 1)
    group_dict.setdefault('loop_mode', 'loop')

    keys = list(group_dict.keys())
    values = tuple(group_dict[k] for k in keys)
    placeholders = ', '.join(['?'] * len(keys))
    cols = ', '.join(keys)
    async with get_db() as db:
        await db.execute(f"INSERT INTO schedule_groups ({cols}) VALUES ({placeholders})", values)
        await db.commit()
    return group_id

async def get_group(group_id: str) -> dict | None:
    """Get a schedule group by ID."""
    async with get_db() as db:
        async with db.execute("SELECT * FROM schedule_groups WHERE id = ?", (group_id,)) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

async def list_groups() -> list[dict]:
    """List all schedule groups."""
    async with get_db() as db:
        async with db.execute("SELECT * FROM schedule_groups ORDER BY created_at DESC") as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]

async def update_group(group_id: str, updates: dict) -> None:
    """Update a schedule group."""
    if not updates:
        return
    set_clauses = [f"{k} = ?" for k in updates]
    values = list(updates.values()) + [group_id]
    async with get_db() as db:
        await db.execute(f"UPDATE schedule_groups SET {', '.join(set_clauses)} WHERE id = ?", values)
        await db.commit()

async def delete_group(group_id: str) -> None:
    """Delete a group and unlink all its schedules."""
    async with get_db() as db:
        await db.execute("DELETE FROM schedule_group_memberships WHERE group_id = ?", (group_id,))
        await db.execute("DELETE FROM schedule_groups WHERE id = ?", (group_id,))
        await db.commit()

async def get_group_schedules(group_id: str) -> list[dict]:
    """Get all schedules belonging to a group, ordered by order_index."""
    async with get_db() as db:
        query = """
            SELECT s.*, m.order_index 
            FROM schedules s 
            JOIN schedule_group_memberships m ON s.id = m.schedule_id 
            WHERE m.group_id = ? 
            ORDER BY m.order_index ASC, s.created_at ASC
        """
        async with db.execute(query, (group_id,)) as cursor:
            rows = await cursor.fetchall()
            result = []
            for r in rows:
                d = dict(r)
                if d.get('filters'):
                    try:
                        d['filters'] = json.loads(d['filters'])
                    except:
                        pass
                result.append(d)
            return result

async def bulk_assign_to_group(group_id: str, schedule_ids: list[str]) -> None:
    """Assign a list of schedules to a group, preserving existing members at the end."""
    async with get_db() as db:
        # Get current max order_index in the group
        async with db.execute(
            "SELECT COALESCE(MAX(order_index), -1) FROM schedule_group_memberships WHERE group_id = ?",
            (group_id,)
        ) as cursor:
            row = await cursor.fetchone()
            base_index = (row[0] if row else -1) + 1

        for i, sched_id in enumerate(schedule_ids):
            await db.execute(
                "INSERT OR IGNORE INTO schedule_group_memberships (group_id, schedule_id, order_index) VALUES (?, ?, ?)",
                (group_id, sched_id, base_index + i)
            )
        await db.commit()

async def remove_from_group(group_id: str, schedule_id: str) -> None:
    """Remove a schedule from a group."""
    async with get_db() as db:
        await db.execute(
            "DELETE FROM schedule_group_memberships WHERE group_id = ? AND schedule_id = ?",
            (group_id, schedule_id)
        )
        await db.commit()

async def reorder_group_schedules(group_id: str, ordered_ids: list[str]) -> None:
    """Update order_index for schedules in a group based on the given ordered list."""
    async with get_db() as db:
        for i, sched_id in enumerate(ordered_ids):
            await db.execute(
                "UPDATE schedule_group_memberships SET order_index = ? WHERE group_id = ? AND schedule_id = ?",
                (i, group_id, sched_id)
            )
        await db.commit()

# ---------------------------------------------------------------------------
# Import/Export sync helpers
# ---------------------------------------------------------------------------

IMPORT_EDITABLE_FIELDS = [
    'title', 'date_start', 'date_end', 'city', 'country', 'venue', 'price',
    'category', 'event_url', 'organizer_name', 'organizer_email',
    'organizer_phone', 'organizer_instagram', 'organizer_facebook',
    'organizer_tiktok', 'organizer_whatsapp', 'organizer_youtube',
    'organizer_twitter', 'organizer_website', 'contact_hidden',
    'dance_style', 'platform', 'is_hidden',
]

async def get_events_by_ids(ids: list[int]) -> dict[int, dict]:
    """Fetch events by their integer IDs. Returns a dict keyed by id."""
    if not ids:
        return {}
    placeholders = ', '.join(['?'] * len(ids))
    query = f"SELECT * FROM events WHERE id IN ({placeholders})"
    async with get_db() as db:
        async with db.execute(query, ids) as cursor:
            rows = await cursor.fetchall()
    return {row['id']: dict(row) for row in rows}

async def get_all_event_ids() -> set[int]:
    """Return the set of all event IDs currently in the database."""
    async with get_db() as db:
        async with db.execute("SELECT id FROM events") as cursor:
            rows = await cursor.fetchall()
    return {row[0] for row in rows}

async def bulk_update_events(updates: list[dict]) -> int:
    """Update multiple events in a single transaction.

    Each dict in *updates* must contain 'id' (the event's integer primary key)
    plus any subset of IMPORT_EDITABLE_FIELDS.  Returns the number of rows
    actually updated.
    """
    if not updates:
        return 0
    updated = 0
    async with get_db() as db:
        for row in updates:
            event_id = row.get('id')
            if event_id is None:
                continue
            fields = {k: v for k, v in row.items() if k != 'id' and k in IMPORT_EDITABLE_FIELDS}
            if not fields:
                continue
            set_clauses = ', '.join(f"{k} = ?" for k in fields)
            values = list(fields.values()) + [event_id]
            await db.execute(f"UPDATE events SET {set_clauses} WHERE id = ?", values)
            updated += 1
        await db.commit()
    return updated

