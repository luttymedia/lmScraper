from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from backend.storage.crm_db import (
    list_organizers, get_organizer, upsert_organizer, delete_organizer,
    archive_organizer, unarchive_organizer, bulk_archive_organizers,
    bulk_delete_organizers, bulk_update_organizers_stage,
    list_interactions, add_interaction, update_interaction, delete_interaction, 
    list_templates, upsert_template,
    delete_template, get_setting, set_setting, merge_organizers
)
from backend.storage.db import get_db
import json
import uuid
import urllib.parse
from datetime import datetime

router = APIRouter(prefix="/api/crm", tags=["crm"])

# --- Models ---
class OrganizerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    whatsapp: Optional[str] = None
    tiktok: Optional[str] = None
    youtube: Optional[str] = None
    twitter: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    pipeline_stage: Optional[str] = None
    notes: Optional[str] = None

class InteractionCreate(BaseModel):
    type: str
    channel: Optional[str] = None
    from_stage: Optional[str] = None
    to_stage: Optional[str] = None
    body: Optional[str] = None

class TemplateCreate(BaseModel):
    id: Optional[int] = None
    name: str
    channel: str
    language: Optional[str] = 'EN'
    trigger_stage: Optional[str] = None
    subject: Optional[str] = None
    body: str

class SettingUpdate(BaseModel):
    value: str

# --- Settings ---
@router.get("/settings/{key}")
async def get_crm_setting(key: str):
    val = await get_setting(key)
    return {"value": val}

@router.put("/settings/{key}")
async def set_crm_setting(key: str, payload: SettingUpdate):
    await set_setting(key, payload.value)
    return {"status": "ok"}

# --- Organizers ---
@router.get("/organizers")
async def get_organizers(stage: Optional[str] = None):
    filters = {}
    if stage:
        filters['stage'] = stage
    orgs = await list_organizers(filters)
    return orgs

@router.get("/organizers/{org_id}")
async def get_organizer_by_id(org_id: str):
    org = await get_organizer(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organizer not found")
    
    # Also fetch associated events (just a lightweight query)
    async with get_db() as db:
        try:
            source_ids = json.loads(org.get('source_event_ids') or '[]')
        except:
            source_ids = []
            
        events = []
        if source_ids:
            placeholders = ",".join(["?"] * len(source_ids))
            query = f"SELECT id, title, date_start, venue, city, event_url FROM events WHERE id IN ({placeholders})"
            async with db.execute(query, source_ids) as cursor:
                rows = await cursor.fetchall()
                events = [dict(row) for row in rows]
                
    org['events'] = events
    org['event_names'] = [e['title'] for e in events if e.get('title')]
    return org

@router.post("/organizers")
async def create_organizer(payload: OrganizerUpdate):
    if not payload.name:
        raise HTTPException(status_code=400, detail="Name is required")
        
    new_id = str(uuid.uuid4())
    insert_data = {k: v for k, v in payload.dict().items() if v is not None}
    insert_data['id'] = new_id
    
    if 'pipeline_stage' not in insert_data:
        insert_data['pipeline_stage'] = 'identified'
        
    insert_data['source_event_ids'] = '[]'
    insert_data['event_count'] = 0
    insert_data['is_archived'] = 0
    
    await upsert_organizer(insert_data)
    return {"status": "ok", "id": new_id}

@router.patch("/organizers/{org_id}")
async def update_organizer(org_id: str, payload: OrganizerUpdate):
    org = await get_organizer(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organizer not found")
        
    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    
    # Check if stage changed
    old_stage = org.get('pipeline_stage')
    new_stage = update_data.get('pipeline_stage')
    
    if new_stage and old_stage != new_stage:
        await add_interaction(
            org_id=org_id,
            interaction_type='stage_change',
            from_stage=old_stage,
            to_stage=new_stage,
            created_by='system'
        )
        
    update_data['id'] = org_id
    await upsert_organizer(update_data)
    return {"status": "ok"}

@router.delete("/organizers/{org_id}")
async def delete_organizer_route(org_id: str):
    await delete_organizer(org_id)
    return {"status": "ok"}

@router.post("/organizers/{org_id}/archive")
async def archive_organizer_route(org_id: str):
    import backend.storage.crm_db as crm_db
    await crm_db.archive_organizer(org_id)
    return {"status": "ok"}

@router.post("/organizers/{org_id}/unarchive")
async def unarchive_organizer_route(org_id: str):
    import backend.storage.crm_db as crm_db
    await crm_db.unarchive_organizer(org_id)
    return {"status": "ok"}

class BulkAction(BaseModel):
    action: str
    ids: List[str]
    value: Optional[str] = None

@router.post("/organizers/bulk-action")
async def bulk_action_organizers(payload: BulkAction):
    if payload.action == 'delete':
        await bulk_delete_organizers(payload.ids)
    elif payload.action == 'archive':
        import backend.storage.crm_db as crm_db
        await crm_db.bulk_archive_organizers(payload.ids)
    elif payload.action == 'unarchive':
        import backend.storage.crm_db as crm_db
        for org_id in payload.ids:
            await crm_db.unarchive_organizer(org_id)
    elif payload.action == 'update_stage':
        await bulk_update_organizers_stage(payload.ids, payload.value)
    return {"status": "ok"}


# --- Interactions ---
@router.get("/interactions/{org_id}")
async def get_org_interactions(org_id: str):
    return await list_interactions(org_id)

@router.post("/interactions/{org_id}")
async def create_interaction(org_id: str, payload: InteractionCreate):
    await add_interaction(
        org_id=org_id,
        interaction_type=payload.type,
        channel=payload.channel,
        from_stage=payload.from_stage,
        to_stage=payload.to_stage,
        body=payload.body
    )
    
    # Update last_contact info on organizer if it's a contact_attempt
    if payload.type == 'contact_attempt':
        now = datetime.utcnow().isoformat()
        await upsert_organizer({
            'id': org_id,
            'last_contact_date': now,
            'last_contact_channel': payload.channel
        })
        
    return {"status": "ok"}

class InteractionUpdate(BaseModel):
    body: str

@router.patch("/interactions/{interaction_id}")
async def update_org_interaction(interaction_id: int, payload: InteractionUpdate):
    await update_interaction(interaction_id, payload.body)
    return {"status": "ok"}

@router.delete("/interactions/{interaction_id}")
async def delete_org_interaction(interaction_id: int):
    await delete_interaction(interaction_id)
    return {"status": "ok"}

# --- Templates ---
@router.get("/templates")
async def get_templates():
    return await list_templates()

@router.post("/templates")
async def save_template(payload: TemplateCreate):
    await upsert_template(payload.dict())
    return {"status": "ok"}

@router.delete("/templates/{template_id}")
async def del_template(template_id: int):
    await delete_template(template_id)
    return {"status": "ok"}

@router.post("/render-template")
async def render_template(payload: dict):
    # payload: {template_id, org_id}
    template_id = payload.get('template_id')
    org_id = payload.get('org_id')
    
    org = await get_organizer(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organizer not found")
        
    templates = await list_templates()
    template = next((t for t in templates if t['id'] == template_id), None)
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    your_name = await get_setting('crm_your_name', 'Your Name')
    
    # Try to get first event name
    event_name = ""
    async with get_db() as db:
        try:
            source_ids = json.loads(org.get('source_event_ids') or '[]')
            if source_ids:
                async with db.execute("SELECT title FROM events WHERE id = ?", (source_ids[0],)) as cursor:
                    row = await cursor.fetchone()
                    if row:
                        event_name = row['title']
        except:
            pass
            
    body = template['body']
    body = body.replace('{{organizer_name}}', org.get('name') or 'Organizer')
    body = body.replace('{{dance_style}}', org.get('dance_styles') or 'dance')
    body = body.replace('{{city}}', org.get('city') or '')
    body = body.replace('{{country}}', org.get('country') or '')
    body = body.replace('{{event_name}}', event_name)
    body = body.replace('{{your_name}}', your_name)
    
    subject = template.get('subject') or ''
    if subject:
        subject = subject.replace('{{organizer_name}}', org.get('name') or 'Organizer')
        subject = subject.replace('{{event_name}}', event_name)
    
    return {"subject": subject, "body": body}

# --- Sync & Deduplication ---
def extract_ig_handle(url: str) -> str:
    if not url:
        return ""
    try:
        parsed = urllib.parse.urlparse(url)
        path = parsed.path.strip('/')
        if path:
            return path.split('/')[0]
    except:
        pass
    return ""

@router.post("/sync")
async def sync_organizers():
    """
    Finds all unique organizers from events table and deduplicates them:
    1. By Name
    2. By Email
    3. By IG Handle
    """
    async with get_db() as db:
        async with db.execute("SELECT * FROM events WHERE organizer_name IS NOT NULL OR organizer_email IS NOT NULL") as cursor:
            events = await cursor.fetchall()
            
        # Get existing organizers to merge with
        async with db.execute("SELECT * FROM organizers") as cursor:
            existing_orgs = [dict(row) for row in await cursor.fetchall()]
            
    org_map = {org['id']: org for org in existing_orgs}
    
    def find_match(event):
        e_name = (event['organizer_name'] or '').strip().lower()
        e_email = (event['organizer_email'] or '').strip().lower()
        e_ig = extract_ig_handle(event['organizer_instagram'] or '').lower()
        
        # Pass 1: Already linked by event ID?
        for org_id, org in org_map.items():
            try:
                sources = json.loads(org.get('source_event_ids') or '[]')
                if event['id'] in sources:
                    return org_id
            except:
                pass
                
        # Pass 2: Field matches
        for org_id, org in org_map.items():
            # 1. Name match (allow exact match on comma-separated names if we ever support that, but usually name is single)
            o_name = (org['name'] or '').strip().lower()
            if e_name and o_name and e_name == o_name:
                return org_id
            
            # 2. Email match (check comma separated)
            o_email_raw = (org['email'] or '').lower()
            if e_email and o_email_raw:
                o_emails = [e.strip() for e in o_email_raw.split(',')]
                if e_email in o_emails:
                    return org_id
                
            # 3. IG match (check comma separated)
            o_ig_raw = (org['instagram'] or '').lower()
            if e_ig and o_ig_raw:
                o_igs = [extract_ig_handle(i.strip()) for i in o_ig_raw.split(',')]
                if e_ig in o_igs:
                    return org_id
                
        return None

    new_orgs_count = 0
    updated_orgs_count = 0
    
    for row in events:
        event = dict(row)
        match_id = find_match(event)
        
        if match_id:
            # Merge fields
            org = org_map[match_id]
            updated = False
            
            # Helper to merge
            def merge_field(key, e_key, allow_multiple=False):
                nonlocal updated
                e_val = (event.get(e_key) or '').strip()
                if not e_val: return
                
                c_val = (org.get(key) or '').strip()
                if not c_val:
                    org[key] = e_val
                    updated = True
                elif allow_multiple:
                    # check if the new value is already in the string (comma separated)
                    c_parts = [p.strip().lower() for p in c_val.split(',')]
                    if e_val.lower() not in c_parts:
                        org[key] = f"{c_val}, {e_val}"
                        updated = True
                    
            merge_field('name', 'organizer_name')
            merge_field('email', 'organizer_email', allow_multiple=True)
            merge_field('phone', 'organizer_phone', allow_multiple=True)
            merge_field('instagram', 'organizer_instagram', allow_multiple=True)
            merge_field('facebook', 'organizer_facebook', allow_multiple=True)
            merge_field('tiktok', 'organizer_tiktok', allow_multiple=True)
            merge_field('whatsapp', 'organizer_whatsapp', allow_multiple=True)
            merge_field('youtube', 'organizer_youtube', allow_multiple=True)
            merge_field('twitter', 'organizer_twitter', allow_multiple=True)
            merge_field('website', 'organizer_website', allow_multiple=True)
            
            # Add to source events
            try:
                sources = json.loads(org.get('source_event_ids') or '[]')
            except:
                sources = []
            if event['id'] not in sources:
                sources.append(event['id'])
                org['source_event_ids'] = json.dumps(sources)
                org['event_count'] = len(sources)
                updated = True
                
            if not org.get('city') and event.get('city'):
                org['city'] = event['city']
                updated = True
            if not org.get('country') and event.get('country'):
                org['country'] = event['country']
                updated = True
                
            if updated:
                org['is_archived'] = 0  # Auto-unarchive if new data is added
                await upsert_organizer(org)
                updated_orgs_count += 1
        else:
            # Create new
            new_id = str(uuid.uuid4())
            new_org = {
                'id': new_id,
                'name': event.get('organizer_name'),
                'email': event.get('organizer_email'),
                'phone': event.get('organizer_phone'),
                'instagram': event.get('organizer_instagram'),
                'facebook': event.get('organizer_facebook'),
                'whatsapp': event.get('organizer_whatsapp'),
                'tiktok': event.get('organizer_tiktok'),
                'youtube': event.get('organizer_youtube'),
                'twitter': event.get('organizer_twitter'),
                'website': event.get('organizer_website'),
                'city': event.get('city'),
                'country': event.get('country'),
                'pipeline_stage': 'identified',
                'source_event_ids': json.dumps([event['id']]),
                'event_count': 1
            }
            org_map[new_id] = new_org
            await upsert_organizer(new_org)
            new_orgs_count += 1
            
    return {
        "status": "ok",
        "total_events": len(events),
        "new": new_orgs_count,
        "updated": updated_orgs_count,
        "total_organizers": len(org_map)
    }

@router.get("/alerts")
async def get_crm_alerts():
    """Find potential duplicate organizers for manual review."""
    async with get_db() as db:
        await db.execute('''CREATE TABLE IF NOT EXISTS ignored_alerts (
            id1 TEXT, id2 TEXT, PRIMARY KEY (id1, id2)
        )''')
        query = '''
            SELECT a.id as id1, a.name as name1, a.email as email1, 
                   b.id as id2, b.name as name2, b.email as email2,
                   CASE 
                       WHEN a.email = b.email AND a.email != '' THEN 'Shared Email'
                       WHEN a.phone = b.phone AND a.phone != '' THEN 'Shared Phone'
                       WHEN a.whatsapp = b.whatsapp AND a.whatsapp != '' THEN 'Shared WhatsApp'
                       WHEN a.instagram = b.instagram AND a.instagram != '' THEN 'Shared Instagram'
                       ELSE 'Similar Name'
                   END as reason
            FROM organizers a
            JOIN organizers b ON a.id < b.id 
            LEFT JOIN ignored_alerts ign ON ign.id1 = a.id AND ign.id2 = b.id
            WHERE ign.id1 IS NULL AND (
               (a.email = b.email AND a.email IS NOT NULL AND a.email != '')
               OR (LOWER(a.name) = LOWER(b.name) AND a.name IS NOT NULL AND a.name != '')
               OR (a.phone = b.phone AND a.phone IS NOT NULL AND a.phone != '')
               OR (a.whatsapp = b.whatsapp AND a.whatsapp IS NOT NULL AND a.whatsapp != '')
               OR (a.instagram = b.instagram AND a.instagram IS NOT NULL AND a.instagram != '')
               OR (LENGTH(a.name) >= 6 AND LENGTH(b.name) >= 6 AND (INSTR(LOWER(b.name), LOWER(a.name)) > 0 OR INSTR(LOWER(a.name), LOWER(b.name)) > 0))
            )
        '''
        async with db.execute(query) as cursor:
            rows = await cursor.fetchall()
            alerts = []
            for row in rows:
                alerts.append({
                    "type": "duplicate_organizers",
                    "title": f"Potential Duplicate ({row['reason']})",
                    "details": f"Reason: {row['reason']}. '{row['name1']}' and '{row['name2']}' may be the same person.",
                    "data": dict(row)
                })
            return alerts

class DismissAlert(BaseModel):
    id1: str
    id2: str

@router.post("/alerts/dismiss")
async def dismiss_crm_alert(payload: DismissAlert):
    async with get_db() as db:
        await db.execute('''CREATE TABLE IF NOT EXISTS ignored_alerts (
            id1 TEXT, id2 TEXT, PRIMARY KEY (id1, id2)
        )''')
        await db.execute("INSERT OR IGNORE INTO ignored_alerts VALUES (?, ?)", (payload.id1, payload.id2))
        await db.execute("INSERT OR IGNORE INTO ignored_alerts VALUES (?, ?)", (payload.id2, payload.id1))
        await db.commit()
    return {"status": "ok"}

class MergeRequest(BaseModel):
    primary_id: str
    secondary_id: str

@router.post("/merge")
async def merge_organizers_route(payload: MergeRequest):
    success = await merge_organizers(payload.primary_id, payload.secondary_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to merge organizers")
    return {"status": "ok"}

