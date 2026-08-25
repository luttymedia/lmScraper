import sqlite3
import re

def normalize_date(date_str: str) -> str:
    if not date_str: return ''
    s = date_str.strip()
    m = re.match(r'(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})', s)
    if m: return m.group(1) + ' ' + m.group(2)
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})\s+(\d{2}:\d{2})', s)
    if m: return m.group(3) + '-' + m.group(2) + '-' + m.group(1) + ' ' + m.group(4)
    m = re.match(r'(\d{4}-\d{2}-\d{2})$', s)
    if m: return s
    return s

c = sqlite3.connect('data/lmscraper.db')
res = c.execute('SELECT id, date_start FROM events').fetchall()

updated = 0
for row in res:
    id, date = row
    norm = normalize_date(date)
    if norm != date:
        c.execute('UPDATE events SET date_start = ? WHERE id = ?', (norm, id))
        updated += 1

c.commit()
print('Updated dates for', updated, 'events')

# Also delete ALL CRM organizers to let a fresh CRM sync happen
c.execute('DELETE FROM organizers')
c.execute('DELETE FROM crm_interactions')
c.commit()
print('Cleared CRM tables for fresh sync')
