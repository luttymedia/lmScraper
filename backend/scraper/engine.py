"""The universal 3-level async scraping engine."""
import asyncio
import logging
import re
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from playwright.async_api import async_playwright, Page, BrowserContext
from datetime import datetime

from backend.scraper.stealth import apply_stealth_page, get_stealth_launch_args, random_delay, inject_cookies
from backend.scraper.html_cache import save_html, load_html, is_cached
from backend.storage.db import insert_event, update_job
from backend.scraper.base import BaseScraper
from backend.scraper.goandance import GoAndDanceScraper
from backend.scraper.extractors import content_hash

def get_scraper(platform: str) -> BaseScraper:
    if platform == 'goandance':
        return GoAndDanceScraper()
    # Fallback to GoAndDance for now if none specified
    return GoAndDanceScraper()

logger = logging.getLogger(__name__)

def prepare_scrape_url(url: str, filters: dict, platform: str) -> str:
    """Augment start URL with platform-specific filter query parameters."""
    if not filters:
        return url
    try:
        parsed = urlparse(url)
        params = parse_qs(parsed.query, keep_blank_values=True)

        if platform == 'goandance':
            # Location filter: ?address=Dinamarca
            city = (filters.get('city') or '').strip()
            if city and 'address' not in params:
                params['address'] = [city]

            # Dance style filter: ?styles=bachata
            dance_style = (filters.get('dance_style') or '').strip()
            if dance_style and 'styles' not in params:
                params['styles'] = [dance_style.lower().replace(' ', '-')]

            # Date range filter: ?period=custom&from=2026-10-01&to=2026-10-31
            date_from = (filters.get('date_from') or '').strip()
            date_to = (filters.get('date_to') or '').strip()
            if (date_from or date_to) and 'period' not in params:
                params['period'] = ['custom']
                if date_from:
                    params['from'] = [date_from]
                if date_to:
                    params['to'] = [date_to]

        new_query = urlencode(params, doseq=True)
        return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))
    except Exception as e:
        logger.warning(f"Failed to augment start URL: {e}")
        return url

def event_matches_filters(event: dict, filters: dict) -> tuple[bool, str]:
    """Check if an event matches the configured job filters."""
    if not filters:
        return True, ""
        
    date_from = filters.get('date_from')
    if date_from:
        start = (event.get('date_start') or '').strip()
        if start:
            start_date = start[:10]
            if start_date < date_from:
                return False, f"Date ({start_date}) is before Date From ({date_from})"
                
    date_to = filters.get('date_to')
    if date_to:
        start = (event.get('date_start') or '').strip()
        if start:
            start_date = start[:10]
            if start_date > date_to:
                return False, f"Date ({start_date}) is after Date To ({date_to})"
                
    city = filters.get('city')
    if city:
        city_lower = city.lower().strip()
        event_city = (event.get('city') or '').lower()
        event_venue = (event.get('venue') or '').lower()
        event_country = (event.get('country') or '').lower()
        if city_lower not in event_city and city_lower not in event_venue and city_lower not in event_country:
            return False, f"Location '{event.get('city', '')}, {event.get('country', '')}' does not match city filter '{city}'"
            
    keyword = filters.get('keyword')
    if keyword:
        kw_lower = keyword.lower().strip()
        event_title = (event.get('title') or '').lower()
        event_desc = (event.get('description') or '').lower()
        event_cat = (event.get('category') or '').lower()
        if kw_lower not in event_title and kw_lower not in event_desc and kw_lower not in event_cat:
            return False, f"Event title/description does not contain keyword '{keyword}'"
            
    return True, ""

@dataclass
class ScraperConfig:
    job_id: str
    url: str
    filters: dict
    concurrency: int = 2
    min_delay: float = 1.5
    max_delay: float = 4.0
    proxy: str | None = None
    session_cookies: list[dict] | None = None
    dance_style: str | None = None
    platform: str = 'goandance'
    schedule_id: str | None = None

async def emit(queue: asyncio.Queue, event: dict) -> None:
    """Emit an event to the progress queue."""
    if queue:
        await queue.put(event)

async def _parse_showing_counter(page: Page) -> tuple[int, int]:
    """Parse 'Showing X of Y' / 'Mostrando X de Y' counter text.
    Targets the confirmed GoAndDance DOM: div.list-show-more > div.counter
    Falls back to a full-body text scan.
    Returns (shown, total). Both are 0 if not found."""
    try:
        # Primary: read the exact counter element GoAndDance uses
        counter_el = page.locator('.list-show-more .counter')
        if await counter_el.count() > 0:
            text = await counter_el.first.inner_text()
            m = re.search(r'(\d+)\s+(?:of|de)\s+(\d+)', text, re.I)
            if m:
                return int(m.group(1)), int(m.group(2))
    except Exception:
        pass
    try:
        # Fallback: scan body text for the pattern
        text = await page.evaluate(r"""
            () => {
                const all = document.querySelectorAll('*');
                for (const el of all) {
                    if (el.children.length === 0) continue;
                    const t = el.innerText || '';
                    if (/showing\s+\d+\s+of\s+\d+/i.test(t) || /mostrando\s+\d+\s+de\s+\d+/i.test(t)) {
                        return t;
                    }
                }
                return '';
            }
        """)
        m = re.search(r'(?:showing|mostrando)\s+(\d+)\s+(?:of|de)\s+(\d+)', text, re.I)
        if m:
            return int(m.group(1)), int(m.group(2))
    except Exception:
        pass
    return 0, 0

async def auto_scroll(page: Page, check_state=None, emit_log=None) -> None:
    """Scroll down and repeatedly click the GoAndDance 'Load more' button
    (button.button-gradient.button-lg inside div.list-show-more) until all
    events are loaded. Uses the div.counter text ('Showing X of Y') to know
    when to stop."""

    async def _log(msg: str):
        logger.info(msg)
        if emit_log:
            await emit_log(msg)

    # Dismiss cookie banner if present so it doesn't obstruct clicks.
    # GoAndDance confirmed cookie modal (inspected via DevTools):
    #   <div role="dialog" aria-modal="true" class="fade notranslate dark-modal modal show">
    #     <div class="modal-footer">
    #       <button class="button-gradient button-md">  ← Accept  (button-md distinguishes from Load More which uses button-lg)
    #       <button class="link-gradient button-md">    ← Settings
    #     </div>
    #   </div>
    try:
        cookie_btn = page.locator(
            '[role="dialog"][aria-modal="true"] .modal-footer button.button-gradient, '
            '#onetrust-accept-btn-handler, .cookie-accept'
        )
        if await cookie_btn.count() > 0 and await cookie_btn.first.is_visible():
            await cookie_btn.first.click(timeout=3000)
            await asyncio.sleep(0.5)
    except Exception:
        pass

    # GoAndDance confirmed DOM structure (inspected via DevTools):
    #   <div class="list-show-more">          ← container (also has js-load-more on outer wrapper)
    #     <div class="counter">Showing 17 of 43</div>
    #     <div class="show-more-area with-bar">
    #       <button class="button-gradient button-lg">
    #         <span class="button-content">Load more</span>   ← EN
    #         (or "Cargar más" on ES pages — same classes, same structure)
    #       </button>
    #     </div>
    #   </div>
    #
    # We target the button by its container (.list-show-more button) so the
    # selector works for both English and Spanish without text matching.
    BUTTON_SEL = '.list-show-more button'

    clicks = 0
    no_button_retries = 0
    MAX_NO_BUTTON_RETRIES = 6   # give it 6 scroll+wait cycles before giving up
    SAFETY_CAP = 500            # absolute maximum clicks to avoid infinite loops

    # --- First pass: read total via the exact counter element ---
    shown, total = await _parse_showing_counter(page)
    if total > 0:
        await _log(f"Load-more loop started: showing {shown} of {total} events.")
    else:
        await _log("Load-more loop started (no counter found, will run until button disappears).")

    while clicks < SAFETY_CAP:
        if check_state:
            await check_state()

        # Scroll to the very bottom so the load-more section enters the viewport
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(1.2)

        # Re-read counter — exit as soon as all events are shown
        shown, total = await _parse_showing_counter(page)
        if total > 0 and shown >= total:
            await _log(f"All {total} events loaded. Stopping load-more loop.")
            break

        if check_state:
            await check_state()

        # Locate the button using the confirmed class hierarchy
        btn = page.locator(BUTTON_SEL)
        try:
            btn_count = await btn.count()
        except Exception:
            btn_count = 0

        if btn_count > 0:
            try:
                # Scroll it into view then click
                await btn.first.scroll_into_view_if_needed(timeout=3000)
                await asyncio.sleep(0.3)
                await btn.first.click(timeout=5000)
                clicks += 1
                no_button_retries = 0
                # Wait for new batch of events to render
                await asyncio.sleep(2.0)
                shown_after, total_after = await _parse_showing_counter(page)
                label = f"{shown_after} of {total_after}" if total_after > 0 else "?"
                await _log(f"Load more clicked ({clicks}x) – showing {label} events")
            except Exception as e:
                logger.warning(f"Load more click failed: {e}")
                no_button_retries += 1
                if no_button_retries >= MAX_NO_BUTTON_RETRIES:
                    await _log("Load more button present but unclickable after retries. Stopping.")
                    break
                await asyncio.sleep(1.0)
        else:
            # Button not in DOM — either all events loaded, or page not ready yet
            no_button_retries += 1
            if no_button_retries >= MAX_NO_BUTTON_RETRIES:
                await _log("Load more button not found after retries. Assuming all events loaded.")
                break
            await _log(f"Load more button not in DOM yet, retrying ({no_button_retries}/{MAX_NO_BUTTON_RETRIES})...")
            await asyncio.sleep(1.5)

async def process_listing_page(page: Page, config: ScraperConfig, scraper: BaseScraper) -> list[str]:
    """Process a single listing page and extract detail URLs."""
    html = await page.content()
    await save_html(config.job_id, page.url, html)
    return await scraper.process_listing_page(page, html, page.url)

async def scrape_detail_page(context: BrowserContext, url: str, config: ScraperConfig, sem: asyncio.Semaphore, scraper: BaseScraper, check_state=None) -> tuple[dict | None, str | None]:
    """Scrape a single event detail page."""
    async with sem:
        if check_state: await check_state()
        cached = await load_html(config.job_id, url)
        
        if cached:
            html = cached
        else:
            page = await context.new_page()
            await apply_stealth_page(page)
            try:
                if check_state: await check_state()
                await page.goto(url, wait_until='domcontentloaded', timeout=45000)
                await random_delay(config.min_delay, config.max_delay)
                if check_state: await check_state()
                
                await scraper.prepare_detail_page(page)
                    
                html = await page.content()
                await save_html(config.job_id, url, html)
            except Exception as e:
                logger.error(f"Failed to load {url}: {e}")
                await page.close()
                return None, None
            finally:
                if not page.is_closed():
                    await page.close()
                    
        event, profile_url = await scraper.extract_event_details(html, url)
        
        if event:
            # Inject manual tags
            if getattr(config, 'dance_style', None):
                event['dance_style'] = config.dance_style
                
            event['job_id'] = config.job_id
            event['platform'] = getattr(config, 'platform', 'goandance')
            
            # Compute deduplication hash
            event['content_hash'] = content_hash(
                event.get('title', ''),
                event.get('date_start', ''),
                event.get('event_url', '')
            )
            
        return event, profile_url

async def run_scrape(config: ScraperConfig, progress_queue: asyncio.Queue, pause_event: asyncio.Event, cancel_event: asyncio.Event) -> dict:
    """Main scraping engine function."""
    stats = {"events_found": 0, "events_new": 0, "events_skipped": 0}
    
    async def check_state():
        while not pause_event.is_set():
            await asyncio.sleep(0.5)
        if cancel_event.is_set():
            raise asyncio.CancelledError()
            
    try:
        await emit(progress_queue, {"type": "phase", "phase": 1, "label": "Starting browser"})
        
        launch_kwargs = {
            "args": get_stealth_launch_args(),
            "headless": True
        }
        if config.proxy:
            launch_kwargs["proxy"] = {"server": config.proxy}
            
        async with async_playwright() as p:
            browser = await p.chromium.launch(**launch_kwargs)
            context = await browser.new_context()
            
            if config.session_cookies:
                await context.add_cookies(config.session_cookies)
                
            page = await context.new_page()
            await apply_stealth_page(page)
            
            # Phase 1: Listing
            # Merge dance_style into filters so prepare_scrape_url can use it
            effective_filters = {**(config.filters or {}), 'dance_style': config.dance_style}
            start_url = prepare_scrape_url(config.url, effective_filters, config.platform)
            await check_state()
            await emit(progress_queue, {"type": "phase", "phase": 1, "label": f"Scanning {start_url}"})
            await emit(progress_queue, {"type": "log", "level": "info", "message": f"Phase 1: Navigating to {start_url}..."})
            
            try:
                await page.goto(start_url, wait_until='networkidle', timeout=60000)
            except Exception as e:
                await emit(progress_queue, {"type": "error", "message": f"Failed to load start URL: {e}"})
                return stats
                
            # Attempt to find pagination or scroll
            detail_urls = set()

            async def _emit_log(msg: str):
                await emit(progress_queue, {"type": "log", "level": "info", "message": msg})

            await emit(progress_queue, {"type": "log", "level": "info", "message": "Scrolling page and loading all events (clicking Load More until done)..."})
            await auto_scroll(page, check_state=check_state, emit_log=_emit_log)
            
            scraper = get_scraper(config.platform)
            urls = await process_listing_page(page, config, scraper)
            detail_urls.update(urls)
            
            detail_urls_list = list(detail_urls)
            total = len(detail_urls_list)
            
            await emit(progress_queue, {"type": "log", "level": "info", "message": f"Found {total} event links on listing page."})
            
            await update_job(config.job_id, {"resume_cursor": start_url})
            await page.close()
            
            # Phase 2: Details
            await check_state()
            await emit(progress_queue, {"type": "phase", "phase": 2, "label": f"Scraping {total} events"})
            await emit(progress_queue, {"type": "log", "level": "info", "message": f"Phase 2: Crawling {total} event detail pages (concurrency: {config.concurrency})..."})
            
            sem = asyncio.Semaphore(config.concurrency)
            profile_urls = set()
            
            for i, url in enumerate(detail_urls_list, 1):
                await check_state()
                
                event, prof = await scrape_detail_page(context, url, config, sem, scraper, check_state=check_state)
                if event:
                    matches, reason = event_matches_filters(event, config.filters)
                    if not matches:
                        title = event.get('title') or url
                        await emit(progress_queue, {"type": "log", "level": "info", "message": f"[{i}/{total}] Skipped: {title[:35]} ({reason})"})
                        continue
                        
                    stats["events_found"] += 1
                    inserted_id, insert_status = await insert_event(event)
                    if insert_status == "new":
                        stats["events_new"] += 1
                        status_label = "new"
                        if prof:
                            profile_urls.add(prof)
                            await emit(progress_queue, {"type": "log", "level": "info", "message": f"   └─ Found organizer profile: {prof}"})
                    elif insert_status == "duplicate_updated":
                        stats["events_skipped"] += 1
                        status_label = "duplicate, updated tags"
                    else:
                        stats["events_skipped"] += 1
                        status_label = "duplicate"
                    title = event.get('title') or url
                    await emit(progress_queue, {"type": "log", "level": "info", "message": f"[{i}/{total}] Scraped: {title[:40]} ({status_label})"})
                        
                    await emit(progress_queue, {
                        "type": "progress", "phase": 2, 
                        "processed": i, "total": total,
                        "new": stats["events_new"], "skipped": stats["events_skipped"]
                    })
                    
                    await update_job(config.job_id, {
                        "events_found": stats["events_found"],
                        "events_new": stats["events_new"],
                        "resume_cursor": url
                    })
                else:
                    await emit(progress_queue, {"type": "log", "level": "warning", "message": f"[{i}/{total}] No event details parsed from {url}"})
                
            # Phase 3: Profiles (Simplified: just saving HTML for now)
            if profile_urls:
                await check_state()
                await emit(progress_queue, {"type": "phase", "phase": 3, "label": f"Scanning {len(profile_urls)} profiles"})
                await emit(progress_queue, {"type": "log", "level": "info", "message": f"Phase 3: Scanning {len(profile_urls)} organizer profiles..."})
                for i, url in enumerate(profile_urls, 1):
                    await check_state()
                    async with sem:
                        if not is_cached(config.job_id, url):
                            p = await context.new_page()
                            await apply_stealth_page(p)
                            try:
                                await p.goto(url, wait_until='domcontentloaded', timeout=30000)
                                await random_delay(config.min_delay, config.max_delay)
                                html = await p.content()
                                await save_html(config.job_id, url, html)
                            except:
                                pass
                            finally:
                                if not p.is_closed():
                                    await p.close()
                    await emit(progress_queue, {
                        "type": "progress", "phase": 3,
                        "processed": i, "total": len(profile_urls),
                        "new": stats["events_new"], "skipped": stats["events_skipped"]
                    })
                    
            await browser.close()
            
        await emit(progress_queue, {"type": "log", "level": "success", "message": f"Scraping complete! Found {stats['events_found']} events ({stats['events_new']} new)."})
        await emit(progress_queue, {"type": "done", "events_found": stats["events_found"], "events_new": stats["events_new"]})
        
    except asyncio.CancelledError:
        await emit(progress_queue, {"type": "log", "level": "warning", "message": "Job cancelled by user"})
        await emit(progress_queue, {"type": "cancelled"})
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logger.error(f"Scraper error: {e}\n{tb}")
        await emit(progress_queue, {"type": "error", "message": f"{type(e).__name__}: {str(e)}\n{tb}"})
        
    return stats
