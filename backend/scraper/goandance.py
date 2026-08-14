import re
import json
import urllib.request
import asyncio
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.async_api import Page

from backend.scraper.base import BaseScraper
from backend.scraper.extractors import extract_event_fields, extract_organizer, detect_hidden_contact, find_organizer_profile_url, find_event_detail_urls

class GoAndDanceScraper(BaseScraper):
    """Scraper implementation for GoAndDance."""
    
    async def process_listing_page(self, page: Page, html: str, url: str) -> list[str]:
        soup = BeautifulSoup(html, 'html.parser')
        return find_event_detail_urls(soup, url)
        
    async def prepare_detail_page(self, page: Page) -> None:
        try:
            contact_btn = page.locator('button[data-toggle="open-contact-modal"]')
            if await contact_btn.count() > 0:
                await contact_btn.first.click(timeout=3000)
                await asyncio.sleep(1.5)
        except:
            pass

    async def fetch_json(self, url: str) -> dict:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        return json.loads(urllib.request.urlopen(req, timeout=10).read().decode('utf-8'))

    async def extract_event_details(self, html: str, url: str) -> tuple[dict | None, str | None]:
        domain = "www.goandance.com"
        event = None
        profile_url = None
        
        uuid_match = re.search(r'data-uuid="([a-f0-9\-]{36})"', html)
        if not uuid_match:
            uuid_match = re.search(r'data-event-uuid="([a-f0-9\-]{36})"', html)
            
        if uuid_match:
            uuid = uuid_match.group(1)
            try:
                data = await asyncio.to_thread(
                    urllib.request.urlopen,
                    urllib.request.Request(f"https://www.goandance.com/api/event/{uuid}", headers={'User-Agent': 'Mozilla/5.0'})
                )
                data = json.loads(data.read().decode('utf-8'))
                
                if data:
                    org_data = data.get('organizer') or {}
                    org_contact = org_data.get('contact') or {}
                    event_contact = data.get('contact') or {}
                    
                    email = event_contact.get('email') or org_contact.get('email') or ''
                    phone = event_contact.get('phone') or event_contact.get('whatsapp') or org_contact.get('phone') or org_contact.get('whatsapp') or ''
                    has_direct_contact = bool(
                        email or phone or
                        event_contact.get('instagram') or org_contact.get('instagram') or
                        event_contact.get('facebook') or org_contact.get('facebook') or
                        event_contact.get('website') or org_contact.get('website')
                    )

                    event = {
                        'title': data.get('name', ''),
                        'description': data.get('shortDescription', ''),
                        'date_start': data.get('dateFrom', ''),
                        'date_end': data.get('dateTo', ''),
                        'price': str(data.get('cache', {}).get('currentPrice', 'Free') if data.get('cache') else 'Free'),
                        'category': data.get('type', {}).get('caption', ''),
                        'city': data.get('address', {}).get('genericLocation', '').split(',')[0] if data.get('address') else '',
                        'country': data.get('address', {}).get('country', {}).get('caption', '') if data.get('address') else '',
                        'venue': data.get('address', {}).get('name', '') if data.get('address') else '',
                        'event_url': url,
                        'source_domain': domain,
                        'image_url': data.get('poster', {}).get('url', ''),
                        'contact_hidden': 0 if has_direct_contact else 1,
                        'scraped_at': datetime.utcnow().isoformat(),
                    }
                    
                    org = {
                        'organizer_name': org_data.get('name', ''),
                        'organizer_email': email,
                        'organizer_phone': phone,
                        'organizer_instagram': event_contact.get('instagram') or org_contact.get('instagram', ''),
                        'organizer_facebook': event_contact.get('facebook') or org_contact.get('facebook', ''),
                        'organizer_tiktok': event_contact.get('tiktok') or org_contact.get('tiktok', ''),
                        'organizer_whatsapp': event_contact.get('whatsapp') or org_contact.get('whatsapp', ''),
                        'organizer_youtube': event_contact.get('youtube') or org_contact.get('youtube', ''),
                        'organizer_twitter': event_contact.get('twitter') or org_contact.get('twitter', ''),
                        'organizer_website': event_contact.get('website') or org_contact.get('website', ''),
                    }
                    event.update(org)
                    
                    profile_url = org_data.get('publicUrl')
            except Exception as e:
                print(f"Failed to fetch JSON API for GoAndDance: {e}")
                
        # Fallback to BeautifulSoup if JSON failed
        soup = BeautifulSoup(html, 'html.parser')
        if not event:
            event = extract_event_fields(soup, url, domain)
            org = extract_organizer(soup)
            event.update(org)
            event['contact_hidden'] = 1 if detect_hidden_contact(soup) else 0
            event['scraped_at'] = datetime.utcnow().isoformat()
            profile_url = find_organizer_profile_url(soup, url)
            
        return event, profile_url
