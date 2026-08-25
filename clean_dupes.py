import sqlite3
import re
import hashlib
from urllib.parse import urlparse

def normalize_date(date_str: str) -> str:
    if not date_str: return ''
    s = date_str.strip()
    m = re.match(r'(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})', s)
    if m: return m.group(1) + ' ' + m.group(2)
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})\s+(\d{2}:\d{2})', s)
    if m: return m.group(3) + '-' + m.group(2) + '-' + m.group(1) + ' ' + m.group(4)
    m = re.match(r'(\d{4}-\d{2}-\d{2})$', s)
    if m: return s
    return s.lower()

def normalize_event_url(url: str) -> str:
    if not url: return ''
    try:
        parsed = urlparse(url.strip())
        domain = parsed.netloc.lower()
        if 'goandance.com' in domain:
            match = re.search(r'/(?:es|en)?/(?:evento|event)/(\d+)', parsed.path, re.I)
            if not match: match = re.search(r'/(?:evento|event)/(\d+)', parsed.path, re.I)
            if match: return f'https://www.goandance.com/event/{match.group(1)}'
        return f'{parsed.scheme}://{domain}{parsed.path.rstrip("/")}'.lower()
    except Exception: return url.strip().lower()

def get_hash(t, d, u):
    s = f'{(t or "").strip()}{normalize_date(d or "")}{normalize_event_url(u)}'.lower().strip()
    return hashlib.sha256(s.encode()).hexdigest()

c = sqlite3.connect('data/lmscraper.db')
res = c.execute('SELECT id, title, date_start, event_url FROM events').fetchall()

hashes = {}
dupes = []
for row in res:
    id, title, date, url = row
    h = get_hash(title, date, url)
    if h in hashes:
        dupes.append(id)
    else:
        hashes[h] = id

print('Total events:', len(res))
print('Duplicates to remove:', len(dupes))

if dupes:
    # Delete them
    q = f"DELETE FROM events WHERE id IN ({','.join('?'*len(dupes))})"
    c.execute(q, dupes)
    c.commit()
    print('Deleted', len(dupes), 'duplicates')
