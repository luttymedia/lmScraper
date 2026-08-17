import re
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.async_api import Page

from backend.scraper.base import BaseScraper
from backend.scraper.extractors import detect_hidden_contact

class SalseroScraper(BaseScraper):
    """Scraper implementation for Salsero."""
    
    async def process_listing_page(self, page: Page, html: str, url: str) -> list[str]:
        soup = BeautifulSoup(html, 'html.parser')
        urls = set()
        
        # Salsero event links are typically inside <div class="fbox-media"> <a>...
        for fbox in soup.find_all('div', class_='fbox-media'):
            a_tag = fbox.find('a', href=True)
            if a_tag and '/events/' in a_tag['href']:
                href = a_tag['href']
                
                # Extract event type (Festival/Party) from the card header
                parent_card = fbox.find_parent('div', class_='feature-box')
                if parent_card:
                    label = parent_card.find('span', class_='img-label')
                    if label:
                        cat = label.get_text(strip=True)
                        if cat:
                            # Append as fragment so it can be picked up by extract_event_details
                            href = f"{href}#event_type={cat}"
                            
                urls.add(href)
                
        return list(urls)
        
    async def prepare_detail_page(self, page: Page) -> None:
        pass

    async def extract_event_details(self, html: str, url: str) -> tuple[dict | None, str | None]:
        domain = "salsero.es"
        soup = BeautifulSoup(html, 'html.parser')
        
        event = {
            'title': '', 'description': '', 'image_url': '',
            'date_start': '', 'date_end': '', 'price': '',
            'category': '', 'dance_style': '', 'venue': '', 'city': '', 'country': '',
            'event_url': url, 'source_domain': domain,
            'contact_hidden': 0, 'scraped_at': datetime.utcnow().isoformat()
        }
        
        # Parse category from fragment injected by process_listing_page
        if '#event_type=' in url:
            clean_url, cat = url.split('#event_type=', 1)
            event['category'] = cat
            event['event_url'] = clean_url
            url = clean_url
        
        # 1. Title & Dance Styles
        h2 = soup.find('h2')
        if h2:
            tagcloud = h2.find('div', class_='tagcloud')
            if tagcloud:
                tags = [a.get_text(strip=True) for a in tagcloud.find_all('a')]
                event['dance_style'] = ', '.join(tags)
                tagcloud.decompose() # Remove so it doesn't pollute title
                
            event['title'] = h2.get_text(strip=True)
            
        # 2 & 3. Date, Location & City
        # We look for structural nodes that contain text "Date:" or "Location:"
        for el in soup.find_all(['p', 'div', 'li']):
            # Skip massive wrappers by ensuring they don't contain other large structural blocks
            if el.find(['ul', 'section', 'article', 'aside']):
                continue
                
            lines = [line.strip() for line in el.get_text(separator='\n', strip=True).split('\n') if line.strip()]
            
            # Check Date
            date_idx = next((i for i, line in enumerate(lines) if 'Date:' in line), -1)
            if date_idx != -1 and not event['date_start']:
                date_val = lines[date_idx].split('Date:', 1)[1].strip()
                if not date_val and date_idx + 1 < len(lines):
                    date_val = lines[date_idx + 1]
                
                # Parse the raw date_val (e.g., "From 09/10/2026 a 15:00 to 10/10/2026 a 06:00") into ISO formats
                dates = re.findall(r'\d{2}/\d{2}/\d{4}', date_val)
                times = re.findall(r'\d{2}:\d{2}', date_val)
                
                if dates:
                    try:
                        start_time = times[0] if len(times) > 0 else "00:00"
                        dt_start = datetime.strptime(f"{dates[0]} {start_time}", "%d/%m/%Y %H:%M")
                        event['date_start'] = dt_start.strftime("%Y-%m-%dT%H:%M:00")
                        
                        if len(dates) > 1:
                            end_time = times[1] if len(times) > 1 else "00:00"
                            dt_end = datetime.strptime(f"{dates[1]} {end_time}", "%d/%m/%Y %H:%M")
                            event['date_end'] = dt_end.strftime("%Y-%m-%dT%H:%M:00")
                    except Exception as e:
                        event['date_start'] = date_val # Fallback if parsing fails
                else:
                    event['date_start'] = date_val
                
            # Check Location
            loc_idx = next((i for i, line in enumerate(lines) if 'Location:' in line), -1)
            if loc_idx != -1 and not event['venue']:
                first_part = lines[loc_idx].split('Location:', 1)[1].strip()
                venue_lines = []
                
                if first_part:
                    venue_lines.append(first_part)
                
                # If there are more lines, the last line is the city/country, and everything in between is venue/address
                if loc_idx + 1 < len(lines):
                    city_line = lines[-1]
                    
                    for i in range(loc_idx + 1, len(lines) - 1):
                        venue_lines.append(lines[i])
                        
                    event['venue'] = " ".join(venue_lines).strip()
                    
                    if 'Organizer' not in city_line and 'Related' not in city_line:
                        parts = [x.strip() for x in city_line.split(',')]
                        if len(parts) >= 1:
                            event['city'] = parts[0]
                        if len(parts) >= 3:
                            event['country'] = parts[-1]
                        elif len(parts) == 2:
                            event['country'] = parts[-1]
                else:
                    event['venue'] = first_part
                            
        # 4. Price
        price_texts = soup.find_all(lambda tag: tag.name == 'strong' and '€' in tag.get_text())
        if price_texts:
            event['price'] = price_texts[0].get_text(strip=True)
            
        # 5. Organizer Info
        org = {
            'organizer_name': '', 'organizer_email': '', 'organizer_phone': '',
            'organizer_instagram': '', 'organizer_facebook': '', 'organizer_tiktok': '',
            'organizer_whatsapp': '', 'organizer_youtube': '', 'organizer_twitter': '',
            'organizer_website': '',
        }
        
        org_widget = soup.find(lambda tag: tag.name == 'h3' and 'Organizer' in tag.get_text(strip=True))
        profile_url = None
        
        if org_widget:
            widget_container = org_widget.find_parent('div', class_='widget')
            if widget_container:
                name_h4 = widget_container.find('h4', style=lambda s: s and 'font-size:20px' in s)
                if not name_h4:
                    name_h4 = widget_container.find('h4', text=lambda t: t and 'Contact the organizer' not in t)
                    
                if name_h4:
                    a_tag = name_h4.find('a')
                    if a_tag:
                        org['organizer_name'] = a_tag.get_text(strip=True)
                        profile_url = a_tag.get('href')
                
                email_tag = widget_container.find('a', href=lambda href: href and 'mailto:' in href)
                if email_tag:
                    org['organizer_email'] = email_tag.get('href').replace('mailto:', '').strip()
                    
                phone_icon = widget_container.find('i', class_='fa-phone')
                if phone_icon and phone_icon.parent:
                    org['organizer_phone'] = phone_icon.parent.get_text(strip=True).strip()
                    
                globe_icon = widget_container.find('i', class_='fa-globe')
                if globe_icon:
                    web_a = globe_icon.find_next_sibling('a')
                    if web_a:
                        org['organizer_website'] = web_a.get('href')
                        
                for a in widget_container.find_all('a', class_=lambda c: c and 'social-icon' in c):
                    href = a.get('href', '')
                    if 'facebook.com' in href:
                        org['organizer_facebook'] = href
                    elif 'instagram.com' in href:
                        org['organizer_instagram'] = href
                    elif 'youtube.com' in href:
                        org['organizer_youtube'] = href
                    elif 'tiktok.com' in href:
                        org['organizer_tiktok'] = href
                    elif 'twitter.com' in href or 'x.com' in href:
                        org['organizer_twitter'] = href
                        
        event.update(org)
        event['contact_hidden'] = 1 if detect_hidden_contact(soup) else 0
        
        return event, profile_url
