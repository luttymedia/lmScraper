"""The universal 3-level async scraping engine."""
import asyncio
import logging
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Page, BrowserContext
from datetime import datetime

from backend.scraper.stealth import apply_stealth_page, get_stealth_launch_args, random_delay, inject_cookies
from backend.scraper.extractors import (
    find_event_detail_urls, extract_event_fields, extract_organizer, 
    detect_hidden_contact, find_organizer_profile_url, content_hash
)
from backend.scraper.html_cache import save_html, load_html, is_cached
from backend.storage.db import insert_event, update_job

logger = logging.getLogger(__name__)

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

async def emit(queue: asyncio.Queue, event: dict) -> None:
    """Emit an event to the progress queue."""
    if queue:
        await queue.put(event)

async def auto_scroll(page: Page, max_scrolls: int = 50) -> None:
    """Scroll down to load dynamic content."""
    prev_height = -1
    for _ in range(max_scrolls):
        curr_height = await page.evaluate("document.body.scrollHeight")
        if curr_height == prev_height:
            break
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(1.0)
        prev_height = curr_height

async def process_listing_page(page: Page, config: ScraperConfig) -> list[str]:
    """Process a single listing page and extract detail URLs."""
    html = await page.content()
    await save_html(config.job_id, page.url, html)
    soup = BeautifulSoup(html, 'html.parser')
    return find_event_detail_urls(soup, page.url)

async def scrape_detail_page(context: BrowserContext, url: str, config: ScraperConfig, sem: asyncio.Semaphore) -> tuple[dict | None, str | None]:
    """Scrape a single event detail page."""
    async with sem:
        cached = await load_html(config.job_id, url)
        domain = urlparse(config.url).netloc
        
        if cached:
            html = cached
        else:
            page = await context.new_page()
            await apply_stealth_page(page)
            try:
                await page.goto(url, wait_until='domcontentloaded', timeout=30000)
                await random_delay(config.min_delay, config.max_delay)
                html = await page.content()
                await save_html(config.job_id, url, html)
            except Exception as e:
                logger.error(f"Failed to load {url}: {e}")
                await page.close()
                return None, None
            finally:
                if not page.is_closed():
                    await page.close()
                    
        soup = BeautifulSoup(html, 'html.parser')
        
        event = extract_event_fields(soup, url, domain)
        org = extract_organizer(soup)
        event.update(org)
        event['contact_hidden'] = 1 if detect_hidden_contact(soup) else 0
        event['scraped_at'] = datetime.utcnow().isoformat()
        event['job_id'] = config.job_id
        
        # Compute hash
        event['content_hash'] = content_hash(event['title'], event['date_start'], event['event_url'])
        
        profile_url = find_organizer_profile_url(soup, url)
        
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
            await check_state()
            await emit(progress_queue, {"type": "phase", "phase": 1, "label": f"Scanning {config.url}"})
            
            try:
                await page.goto(config.url, wait_until='networkidle', timeout=60000)
            except Exception as e:
                await emit(progress_queue, {"type": "error", "message": f"Failed to load start URL: {e}"})
                return stats
                
            # Attempt to find pagination or scroll
            detail_urls = set()
            html = await page.content()
            soup = BeautifulSoup(html, 'html.parser')
            
            # Very basic pagination detection (just first page and scroll for now)
            # A full implementation would find next buttons and loop
            await auto_scroll(page)
            
            urls = await process_listing_page(page, config)
            detail_urls.update(urls)
            
            await update_job(config.job_id, {"resume_cursor": config.url})
            await page.close()
            
            # Phase 2: Details
            await check_state()
            total = len(detail_urls)
            await emit(progress_queue, {"type": "phase", "phase": 2, "label": f"Scraping {total} events"})
            
            sem = asyncio.Semaphore(config.concurrency)
            profile_urls = set()
            
            for i, url in enumerate(detail_urls, 1):
                await check_state()
                
                event, prof = await scrape_detail_page(context, url, config, sem)
                if event:
                    stats["events_found"] += 1
                    inserted_id = await insert_event(event)
                    if inserted_id:
                        stats["events_new"] += 1
                    else:
                        stats["events_skipped"] += 1
                        
                if prof:
                    profile_urls.add(prof)
                    
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
                
            # Phase 3: Profiles (Simplified: just saving HTML for now)
            if profile_urls:
                await check_state()
                await emit(progress_queue, {"type": "phase", "phase": 3, "label": f"Scanning {len(profile_urls)} profiles"})
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
            
        await emit(progress_queue, {"type": "done", "events_found": stats["events_found"], "events_new": stats["events_new"]})
        
    except asyncio.CancelledError:
        await emit(progress_queue, {"type": "log", "level": "warning", "message": "Job cancelled by user"})
    except Exception as e:
        logger.error(f"Scraper error: {e}", exc_info=True)
        await emit(progress_queue, {"type": "error", "message": str(e)})
        
    return stats
