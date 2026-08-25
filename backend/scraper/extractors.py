"""Field extraction helpers for HTML parsing."""
import re
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import hashlib
from datetime import datetime

EMAIL_RE = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')
PHONE_RE = re.compile(r'(?:\+|00)[1-9][\d\s\-\.\(\)]{7,20}')

SOCIAL_PATTERNS = {
    'instagram': r'instagram\.com/([\w.]+)',
    'facebook': r'facebook\.com/([\w.\-]+)',
    'tiktok': r'tiktok\.com/@([\w.]+)',
    'whatsapp': r'(?:wa\.me|whatsapp\.com)/([\d]+)',
    'youtube': r'youtube\.com/(?:channel/|@|user/)([\w.\-]+)',
    'twitter': r'(?:twitter\.com|x\.com)/([\w]+)',
}

def extract_emails(text: str) -> list[str]:
    """Find and filter email addresses."""
    if not text:
        return []
    emails = EMAIL_RE.findall(text)
    # Filter common non-emails
    exclude = ['noreply', 'no-reply', 'example.com', 'test.com', 'sentry.io']
    valid_emails = []
    for e in set(emails):
        e_lower = e.lower()
        if not any(x in e_lower for x in exclude):
            valid_emails.append(e)
    return valid_emails

def extract_phones(text: str) -> list[str]:
    """Find phone numbers."""
    if not text:
        return []
    phones = PHONE_RE.findall(text)
    return list(set(p.strip() for p in phones))

def extract_social_links(soup: BeautifulSoup) -> dict:
    """Extract social media profiles from links."""
    socials = {k: '' for k in SOCIAL_PATTERNS}
    for a in soup.find_all('a', href=True):
        href = a['href']
        for platform, pattern in SOCIAL_PATTERNS.items():
            if not socials[platform] and re.search(pattern, href):
                socials[platform] = href
    return socials

def detect_hidden_contact(soup: BeautifulSoup) -> bool:
    """Check if contact info is likely behind a modal/button."""
    patterns = ['contactar', 'contact organizer', 'envoyer un message', 'send message']
    
    # If we already found an email in the HTML, it's not hidden
    if extract_emails(soup.get_text()):
        return False
        
    for tag in soup.find_all(['button', 'a']):
        text = tag.get_text().lower()
        if any(p in text for p in patterns):
            return True
            
    return False

def normalize_event_url(url: str) -> str:
    """Normalize event URL to be language and query-param agnostic for deduplication."""
    if not url:
        return ""
    try:
        parsed = urlparse(url.strip())
        domain = parsed.netloc.lower()
        if 'goandance.com' in domain:
            # Go&Dance event detail links: /es/evento/8817/... or /en/event/8817/...
            match = re.search(r'/(?:es|en)?/(?:evento|event)/(\d+)', parsed.path, re.I)
            if not match:
                match = re.search(r'/(?:evento|event)/(\d+)', parsed.path, re.I)
            if match:
                event_id = match.group(1)
                return f"https://www.goandance.com/event/{event_id}"
        clean_path = parsed.path.rstrip('/')
        return f"{parsed.scheme}://{domain}{clean_path}".lower()
    except Exception:
        return url.strip().lower()

def normalize_date(date_str: str) -> str:
    """Normalize a date string to 'YYYY-MM-DD HH:MM' for consistent hashing.

    Handles the two formats GoAndDance produces:
      - HTML / old scraper:  '25/09/2026 16:00'
      - JSON API / new:      '2026-09-25T16:00:00.000+02:00'
    Both normalize to '2026-09-25 16:00'.
    Falls back to the raw string (lowercased) if neither pattern matches.
    """
    if not date_str:
        return ""
    s = date_str.strip()
    # ISO 8601: 2026-09-25T16:00... (timezone suffix ignored for hashing)
    m = re.match(r'(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})', s)
    if m:
        return m.group(1) + " " + m.group(2)
    # DD/MM/YYYY HH:MM
    m = re.match(r'(\d{2})/(\d{2})/(\d{4})\s+(\d{2}:\d{2})', s)
    if m:
        return m.group(3) + "-" + m.group(2) + "-" + m.group(1) + " " + m.group(4)
    # YYYY-MM-DD (date only, no time)
    m = re.match(r'(\d{4}-\d{2}-\d{2})$', s)
    if m:
        return s
    # Fallback: return lowercased as-is
    return s.lower()

def content_hash(title: str, date: str, url: str) -> str:
    """Compute deduplication hash using normalized URL and normalized date.

    Both the event URL and the date_start string are normalized before hashing
    so that format differences (e.g. ISO-8601 vs DD/MM/YYYY) across scraper
    versions do not cause the same real-world event to be treated as new.
    """
    norm_url = normalize_event_url(url)
    norm_date = normalize_date(date or '')
    s = f"{(title or '').strip()}{norm_date}{norm_url}".lower().strip()
    return hashlib.sha256(s.encode('utf-8')).hexdigest()

def extract_event_fields(soup: BeautifulSoup, url: str, source_domain: str) -> dict:
    """Extract all event fields from a detail page."""
    
    # Remove footer and header from soup to avoid generic social links and text
    for tag in soup.find_all(['footer', 'header', 'nav']):
        tag.decompose()
        
    for tag in soup.find_all('div', class_=re.compile(r'footer', re.I)):
        tag.decompose()
        
    fields = {
        'title': '', 'description': '', 'image_url': '',
        'date_start': '', 'date_end': '', 'price': '',
        'category': '', 'venue': '', 'city': '', 'country': '',
        'event_url': url, 'source_domain': source_domain
    }
    
    # Title
    og_title = soup.find('meta', property='og:title')
    if og_title:
        fields['title'] = og_title.get('content', '')
    elif soup.h1:
        fields['title'] = soup.h1.get_text(strip=True)
    elif soup.title:
        fields['title'] = soup.title.get_text(strip=True)
        
    if fields['title'].endswith('| go&dance'):
        fields['title'] = fields['title'].replace('| go&dance', '').strip()
        
    # Description
    og_desc = soup.find('meta', property='og:description')
    if og_desc:
        fields['description'] = og_desc.get('content', '')
    else:
        ps = soup.find_all('p')
        if ps:
            longest_p = max(ps, key=lambda x: len(x.get_text()))
            fields['description'] = longest_p.get_text(strip=True)
            
    # Image
    og_image = soup.find('meta', property='og:image')
    if og_image:
        fields['image_url'] = og_image.get('content', '')
    else:
        img = soup.find('img')
        if img and img.get('src'):
            fields['image_url'] = urljoin(url, img['src'])
            
    # Date (basic heuristic & GoAndDance specific)
    time_tag = soup.find('time')
    if time_tag and time_tag.get('datetime'):
        fields['date_start'] = time_tag['datetime']
    else:
        # GoAndDance date format
        cal_icon = soup.find('img', alt='icon calendar')
        if cal_icon and cal_icon.parent:
            cal_item = cal_icon.find_parent('div', class_='profile-details-properties-item')
            if cal_item:
                heading = cal_item.find(class_='heading')
                if heading:
                    fields['date_start'] = heading.get_text(strip=True)
                    
    if fields['date_start']:
        fields['date_start'] = normalize_date(fields['date_start'])
        
    # Price
    text = soup.get_text().lower()
    if 'free' in text or 'gratuito' in text or 'gratis' in text:
        fields['price'] = 'Free'
    else:
        price_match = re.search(r'([€$£]\s*\d+(?:[.,]\d{2})?)', soup.get_text())
        if price_match:
            fields['price'] = price_match.group(1)
            
    # Category
    meta_kw = soup.find('meta', attrs={'name': 'keywords'})
    if meta_kw:
        fields['category'] = meta_kw.get('content', '')
        
    # Venue / Location
    loc_icon = soup.find('img', alt='icon location')
    if loc_icon and loc_icon.parent:
        loc_item = loc_icon.find_parent('div', class_='profile-details-properties-item')
        if loc_item:
            heading = loc_item.find(class_='heading')
            if heading:
                loc_parts = heading.get_text(strip=True).split(',')
                fields['city'] = loc_parts[0].strip() if len(loc_parts) > 0 else ''
                fields['country'] = loc_parts[1].strip() if len(loc_parts) > 1 else ''
            p = loc_item.find('p')
            if p:
                fields['venue'] = p.get_text(strip=True)
    else:
        venue_elem = soup.find(class_=re.compile(r'venue|location', re.I))
        if venue_elem:
            fields['venue'] = venue_elem.get_text(strip=True)
        
    return fields

def extract_organizer(soup: BeautifulSoup) -> dict:
    """Extract organizer contact details."""
    org = {
        'organizer_name': '',
        'organizer_email': '',
        'organizer_phone': '',
    }
    
    # Try finding name (GoAndDance specific first)
    card_org = soup.find(class_='card-organizer')
    if card_org:
        h3 = card_org.find('h3')
        if h3:
            org['organizer_name'] = h3.get_text(strip=True)
            
    # Fallback name search
    if not org['organizer_name']:
        name_elem = soup.find(class_=re.compile(r'organizer|promotor|organiser', re.I))
        if name_elem:
            org['organizer_name'] = name_elem.get_text(strip=True)
        
    text = soup.get_text()
    
    # Emails
    emails = extract_emails(text)
    if emails:
        org['organizer_email'] = emails[0]
        
    # Phones
    phones = extract_phones(text)
    if phones:
        org['organizer_phone'] = phones[0]
        
    # Socials
    socials = extract_social_links(soup)
    for k, v in socials.items():
        org[f'organizer_{k}'] = v
        
    return org

def find_organizer_profile_url(soup: BeautifulSoup, base_url: str) -> str | None:
    """Find a link to the organizer's profile page."""
    for a in soup.find_all('a', href=True):
        href = a['href']
        if re.search(r'/(organizer|promotor|user|profile|artist|organizador)/', href, re.I):
            return urljoin(base_url, href)
    return None

def find_event_detail_urls(soup: BeautifulSoup, base_url: str) -> list[str]:
    """Extract likely event detail URLs from a listing page."""
    urls = set()
    domain = urlparse(base_url).netloc
    
    for a in soup.find_all('a', href=True):
        href = a['href']
        
        if 'goandance.com' in domain and not re.search(r'/(evento|event)/', href):
            continue
            
        # Skip obvious non-event links
        if re.search(r'/(login|signup|cart|checkout|about|contact|terms|privacy)', href, re.I):
            continue
        if href.startswith(('javascript:', 'mailto:', 'tel:', '#')):
            continue
            
        full_url = urljoin(base_url, href)
        parsed = urlparse(full_url)
        
        # Only same domain
        if parsed.netloc == domain:
            urls.add(full_url)
            
    return list(urls)
