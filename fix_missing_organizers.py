import sqlite3
import os
from pathlib import Path
from bs4 import BeautifulSoup

# Ensure we can import the backend modules
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.scraper.extractors import extract_organizer

def fix_missing_organizers():
    db_path = Path('data') / 'lmscraper.db'
    if not db_path.exists():
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Find events with missing organizer name
    c.execute("""
        SELECT id, event_url, html_cache_path 
        FROM events 
        WHERE organizer_name IS NULL 
           OR organizer_name = '' 
           OR organizer_name = 'None'
    """)
    events = c.fetchall()
    
    if not events:
        print("No events found with missing organizer name.")
        return

    print(f"Found {len(events)} events missing an organizer name. Attempting to fix...")
    
    updated_count = 0
    for event in events:
        event_id = event['id']
        cache_path = event['html_cache_path']
        
        if not cache_path or not os.path.exists(cache_path):
            print(f"Skipping event ID {event_id} - HTML cache missing.")
            continue
            
        with open(cache_path, 'r', encoding='utf-8') as f:
            html = f.read()
            
        soup = BeautifulSoup(html, 'html.parser')
        org_data = extract_organizer(soup)
        
        if org_data.get('organizer_name'):
            # Update the database with the extracted info
            # We'll update name, email, phone, and all social fields that were extracted
            update_fields = []
            params = []
            for key, value in org_data.items():
                if value:  # Only update fields we actually found
                    update_fields.append(f"{key} = ?")
                    params.append(value)
                    
            if update_fields:
                params.append(event_id)
                query = f"UPDATE events SET {', '.join(update_fields)} WHERE id = ?"
                
                c.execute(query, params)
                updated_count += 1
                print(f"Fixed event ID {event_id}: Found organizer '{org_data['organizer_name']}'")
        else:
            print(f"Failed to extract organizer for event ID {event_id} from cached HTML.")
            
    conn.commit()
    conn.close()
    
    print(f"\nDone! Successfully updated {updated_count} out of {len(events)} events.")

if __name__ == "__main__":
    fix_missing_organizers()
