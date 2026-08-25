import json
import uuid
from datetime import datetime
from backend.storage.db import get_db

async def list_organizers(filters=None):
    async with get_db() as db:
        query = "SELECT * FROM organizers"
        params = []
        conditions = []
        
        if filters:
            if filters.get('stage'):
                conditions.append("pipeline_stage = ?")
                params.append(filters['stage'])
            if filters.get('is_archived') is not None:
                conditions.append("is_archived = ?")
                params.append(1 if filters['is_archived'] else 0)
            
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
            
        query += " ORDER BY updated_at DESC"
        
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            orgs = [dict(row) for row in rows]
            
        # Attach event names for text search
        try:
            async with db.execute("SELECT id, title FROM events WHERE title IS NOT NULL AND title != ''") as cursor:
                event_rows = await cursor.fetchall()
                event_map = {r['id']: r['title'] for r in event_rows}
                
            for org in orgs:
                try:
                    source_ids = json.loads(org.get('source_event_ids') or '[]')
                    org['event_names'] = [event_map[eid] for eid in source_ids if eid in event_map]
                except Exception:
                    org['event_names'] = []
        except Exception:
            for org in orgs:
                org['event_names'] = []
                
        return orgs

async def get_organizer(org_id):
    async with get_db() as db:
        async with db.execute("SELECT * FROM organizers WHERE id = ?", (org_id,)) as cursor:
            row = await cursor.fetchone()
            return dict(row) if row else None

async def upsert_organizer(org_data):
    org_id = org_data.get('id') or str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    async with get_db() as db:
        # Check if exists
        async with db.execute("SELECT id FROM organizers WHERE id = ?", (org_id,)) as cursor:
            exists = await cursor.fetchone()
            
        if exists:
            # Update
            fields = []
            params = []
            for k, v in org_data.items():
                if k not in ('id', 'created_at', 'updated_at'):
                    fields.append(f"{k} = ?")
                    # handle lists/dicts
                    if isinstance(v, (list, dict)):
                        params.append(json.dumps(v))
                    else:
                        params.append(v)
                        
            fields.append("updated_at = ?")
            params.append(now)
            params.append(org_id)
            
            query = f"UPDATE organizers SET {', '.join(fields)} WHERE id = ?"
            await db.execute(query, params)
        else:
            # Insert
            cols = ['id', 'created_at', 'updated_at']
            vals = [org_id, now, now]
            
            for k, v in org_data.items():
                if k not in ('id', 'created_at', 'updated_at'):
                    cols.append(k)
                    if isinstance(v, (list, dict)):
                        vals.append(json.dumps(v))
                    else:
                        vals.append(v)
                        
            placeholders = ", ".join(["?"] * len(vals))
            query = f"INSERT INTO organizers ({', '.join(cols)}) VALUES ({placeholders})"
            await db.execute(query, vals)
            
        await db.commit()
    return org_id

async def archive_organizer(org_id):
    async with get_db() as db:
        await db.execute("UPDATE organizers SET is_archived = 1 WHERE id = ?", (org_id,))
        await db.commit()

async def unarchive_organizer(org_id):
    async with get_db() as db:
        await db.execute("UPDATE organizers SET is_archived = 0 WHERE id = ?", (org_id,))
        await db.commit()

async def delete_organizer(org_id):
    async with get_db() as db:
        await db.execute("DELETE FROM organizers WHERE id = ?", (org_id,))
        await db.commit()

async def bulk_archive_organizers(org_ids):
    if not org_ids: return
    async with get_db() as db:
        placeholders = ",".join(["?"] * len(org_ids))
        await db.execute(f"UPDATE organizers SET is_archived = 1 WHERE id IN ({placeholders})", org_ids)
        await db.commit()

async def bulk_delete_organizers(org_ids):
    if not org_ids: return
    async with get_db() as db:
        placeholders = ",".join(["?"] * len(org_ids))
        await db.execute(f"DELETE FROM organizers WHERE id IN ({placeholders})", org_ids)
        await db.commit()

async def bulk_update_organizers_stage(org_ids, new_stage):
    if not org_ids: return
    now = datetime.utcnow().isoformat()
    async with get_db() as db:
        placeholders = ",".join(["?"] * len(org_ids))
        await db.execute(f"UPDATE organizers SET pipeline_stage = ?, updated_at = ? WHERE id IN ({placeholders})", [new_stage, now] + org_ids)
        await db.commit()

async def list_interactions(org_id):
    async with get_db() as db:
        async with db.execute("SELECT * FROM crm_interactions WHERE organizer_id = ? ORDER BY timestamp DESC", (org_id,)) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def add_interaction(org_id, interaction_type, channel=None, from_stage=None, to_stage=None, body=None, created_by='user'):
    now = datetime.utcnow().isoformat()
    async with get_db() as db:
        await db.execute('''
            INSERT INTO crm_interactions 
            (organizer_id, timestamp, type, channel, from_stage, to_stage, body, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (org_id, now, interaction_type, channel, from_stage, to_stage, body, created_by))
        await db.commit()

async def delete_interaction(interaction_id):
    async with get_db() as db:
        await db.execute("DELETE FROM crm_interactions WHERE id = ?", (interaction_id,))
        await db.commit()

async def update_interaction(interaction_id, body):
    async with get_db() as db:
        await db.execute("UPDATE crm_interactions SET body = ? WHERE id = ?", (body, interaction_id))
        await db.commit()

async def list_templates():
    async with get_db() as db:
        async with db.execute("SELECT * FROM crm_templates ORDER BY name ASC") as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def upsert_template(template_data):
    now = datetime.utcnow().isoformat()
    async with get_db() as db:
        if template_data.get('id'):
            await db.execute('''
                UPDATE crm_templates 
                SET name=?, channel=?, language=?, trigger_stage=?, subject=?, body=?
                WHERE id=?
            ''', (
                template_data['name'], template_data['channel'], template_data.get('language', 'EN'),
                template_data.get('trigger_stage'), template_data.get('subject'), 
                template_data['body'], template_data['id']
            ))
        else:
            await db.execute('''
                INSERT INTO crm_templates 
                (name, channel, language, trigger_stage, subject, body, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                template_data['name'], template_data['channel'], template_data.get('language', 'EN'),
                template_data.get('trigger_stage'), template_data.get('subject'), 
                template_data['body'], now
            ))
        await db.commit()

async def delete_template(template_id):
    async with get_db() as db:
        await db.execute("DELETE FROM crm_templates WHERE id = ?", (template_id,))
        await db.commit()

async def get_setting(key, default=None):
    async with get_db() as db:
        async with db.execute("SELECT value FROM app_settings WHERE key = ?", (key,)) as cursor:
            row = await cursor.fetchone()
            return row['value'] if row else default

async def set_setting(key, value):
    async with get_db() as db:
        await db.execute('''
            INSERT INTO app_settings (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value=excluded.value
        ''', (key, value))
        await db.commit()

async def merge_organizers(primary_id, secondary_id):
    async with get_db() as db:
        async with db.execute("SELECT * FROM organizers WHERE id = ?", (primary_id,)) as cursor:
            primary = await cursor.fetchone()
        async with db.execute("SELECT * FROM organizers WHERE id = ?", (secondary_id,)) as cursor:
            secondary = await cursor.fetchone()
            
        if not primary or not secondary:
            return False
            
        p_dict = dict(primary)
        s_dict = dict(secondary)
        
        # Merge contact fields (append if different for contact methods)
        for field in ['email', 'phone', 'instagram', 'facebook', 'whatsapp', 'tiktok', 'youtube', 'twitter', 'website']:
            s_val = (s_dict.get(field) or '').strip()
            p_val = (p_dict.get(field) or '').strip()
            if not p_val and s_val:
                p_dict[field] = s_val
            elif p_val and s_val:
                p_parts = [p.strip().lower() for p in p_val.split(',')]
                if s_val.lower() not in p_parts:
                    p_dict[field] = f"{p_val}, {s_val}"

        for field in ['city', 'country']:
            if not p_dict.get(field) and s_dict.get(field):
                p_dict[field] = s_dict[field]
                
        # Merge source_event_ids
        try:
            p_events = json.loads(p_dict.get('source_event_ids') or '[]')
        except:
            p_events = []
        try:
            s_events = json.loads(s_dict.get('source_event_ids') or '[]')
        except:
            s_events = []
            
        merged_events = list(set(p_events + s_events))
        p_dict['source_event_ids'] = json.dumps(merged_events)
        p_dict['event_count'] = len(merged_events)
        
        # Merge notes if secondary has notes
        if s_dict.get('notes'):
            if p_dict.get('notes'):
                p_dict['notes'] += f"\n\n[Merged from {s_dict.get('name', 'Duplicate')}]:\n" + s_dict['notes']
            else:
                p_dict['notes'] = s_dict['notes']
                
        # Reassign interactions to primary
        await db.execute("UPDATE crm_interactions SET organizer_id = ? WHERE organizer_id = ?", (primary_id, secondary_id))
        
        # Log merge interaction
        now = datetime.utcnow().isoformat()
        await db.execute('''
            INSERT INTO crm_interactions (organizer_id, timestamp, type, body, created_by)
            VALUES (?, ?, 'note', ?, 'system')
        ''', (primary_id, now, f"Merged with duplicate organizer '{s_dict.get('name')}' ({secondary_id})"))
        
        # Delete secondary
        await db.execute("DELETE FROM organizers WHERE id = ?", (secondary_id,))
        await db.commit()
        
    await upsert_organizer(p_dict)
    return True

