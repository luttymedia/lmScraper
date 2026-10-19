"""Go & Dance Artists Scraper.
Follows the universal async engine architecture with Playwright auto-scroll discovery and concurrent detail extraction.
"""
import re
import json
import asyncio
import logging
import urllib.request
from datetime import datetime
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Page, BrowserContext

from backend.scraper.stealth import apply_stealth_page, get_stealth_launch_args, random_delay
from backend.storage.db import insert_or_update_artist, update_job, insert_job_log

logger = logging.getLogger(__name__)

CATEGORY_MAP = {
    'dancers': 'https://www.goandance.com/en/artists/dancers',
    'singers': 'https://www.goandance.com/en/artists/singers',
    'djs': 'https://www.goandance.com/en/artists/djs',
}

SINGULAR_CATEGORY = {
    'dancers': 'dancer',
    'singers': 'singer',
    'djs': 'dj',
}


def _fetch_url(url: str, timeout: int = 15) -> str:
    """Fetch URL contents with a browser-like User-Agent."""
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
        }
    )
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return response.read().decode('utf-8', errors='replace')


def _fetch_json(url: str, timeout: int = 10) -> dict | None:
    """Fetch JSON endpoint."""
    try:
        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
            }
        )
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return json.loads(response.read().decode('utf-8', errors='replace'))
    except Exception as e:
        logger.debug(f"JSON fetch failed for {url}: {e}")
        return None


async def _parse_showing_counter(page: Page) -> tuple[int, int]:
    """Parse 'Showing X of Y' / 'Mostrando X de Y' counter text."""
    try:
        counter_el = page.locator('.list-show-more .counter')
        if await counter_el.count() > 0:
            text = await counter_el.first.inner_text()
            m = re.search(r'(\d+)\s+(?:of|de)\s+(\d+)', text, re.I)
            if m:
                return int(m.group(1)), int(m.group(2))
    except Exception:
        pass
    try:
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


async def _dismiss_cookies(page: Page) -> None:
    """Dismiss Go & Dance cookie banner if present."""
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


async def auto_scroll_artists(
    page: Page,
    check_state=None,
    emit_log=None,
    max_pages: int | None = None,
    max_artists: int | None = None
) -> None:
    """Scroll down and repeatedly click the Go & Dance 'Load more' button
    until all artists in the directory are loaded."""

    async def _log(msg: str):
        logger.info(msg)
        if emit_log:
            await emit_log(msg)

    await _dismiss_cookies(page)

    BUTTON_SEL = '.list-show-more button'
    clicks = 0
    no_button_retries = 0
    MAX_NO_BUTTON_RETRIES = 6
    SAFETY_CAP = 300

    shown, total = await _parse_showing_counter(page)
    if total > 0:
        await _log(f"Load-more loop started: showing {shown} of {total} artists.")
    else:
        await _log("Load-more loop started (no counter found, will run until button disappears).")

    while clicks < SAFETY_CAP:
        if check_state:
            await check_state()

        if max_artists and shown >= max_artists:
            await _log(f"Reached max_artists target ({shown}/{max_artists}). Stopping load-more loop.")
            break

        if max_pages and (clicks + 1) >= max_pages:
            await _log(f"Reached max_pages limit ({max_pages}). Stopping load-more loop.")
            break

        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(1.2)

        shown, total = await _parse_showing_counter(page)
        if total > 0 and shown >= total:
            await _log(f"All {total} artists loaded. Stopping load-more loop.")
            break

        if check_state:
            await check_state()

        btn = page.locator(BUTTON_SEL)
        try:
            btn_count = await btn.count()
        except Exception:
            btn_count = 0

        if btn_count > 0:
            try:
                await btn.first.scroll_into_view_if_needed(timeout=3000)
                await asyncio.sleep(0.3)
                await btn.first.click(timeout=5000)
                clicks += 1
                no_button_retries = 0
                await asyncio.sleep(2.0)
                shown_after, total_after = await _parse_showing_counter(page)
                label = f"{shown_after} of {total_after}" if total_after > 0 else "?"
                await _log(f"Load more clicked ({clicks}x) – showing {label} artists")
                shown = shown_after
            except Exception as e:
                logger.warning(f"Load more click failed: {e}")
                no_button_retries += 1
                if no_button_retries >= MAX_NO_BUTTON_RETRIES:
                    await _log("Load more button present but unclickable after retries. Stopping.")
                    break
                await asyncio.sleep(1.0)
        else:
            no_button_retries += 1
            if no_button_retries >= MAX_NO_BUTTON_RETRIES:
                await _log("Load more button not found after retries. Assuming all artists loaded.")
                break
            await _log(f"Load more button not in DOM yet, retrying ({no_button_retries}/{MAX_NO_BUTTON_RETRIES})...")
            await asyncio.sleep(1.5)


async def extract_artists_from_dom(page: Page, category: str) -> list[dict]:
    """Extract all artist cards currently rendered in the DOM."""
    cards_data = await page.evaluate(r"""
        () => {
            const cards = Array.from(document.querySelectorAll('a.card-artist, a[href*="/artist/"]'));
            const results = [];
            const seen = new Set();
            for (const c of cards) {
                const href = c.getAttribute('href') || '';
                if (!href || href.includes('/artists/') || href === '#') continue;
                const fullHref = href.startsWith('http') ? href : ('https://www.goandance.com' + href);
                if (seen.has(fullHref)) continue;
                seen.add(fullHref);

                const nameEl = c.querySelector('h3') || c.querySelector('.card-content-area');
                const name = nameEl ? nameEl.innerText.trim() : '';

                let uuid = '';
                const followEl = c.querySelector('.js-react-follow');
                if (followEl && followEl.getAttribute('data-api')) {
                    const m = followEl.getAttribute('data-api').match(/\/api\/artist\/([a-f0-9\-]{36})/i);
                    if (m) uuid = m[1];
                }

                results.push({
                    profile_url: fullHref,
                    name: name,
                    uuid: uuid
                });
            }
            return results;
        }
    """)

    for c in cards_data:
        c['category'] = category

    return cards_data


async def scrape_artist_details(artist_info: dict, category_name: str) -> dict:
    """Fetch artist details via /api/artist/{uuid} or HTML fallback."""
    name = artist_info.get('name', '')
    profile_url = artist_info.get('profile_url', '')
    uuid_val = artist_info.get('uuid')

    origin = ''
    base = ''
    dance_styles = ''

    # 1. Fast API lookup if UUID is available
    if uuid_val:
        api_url = f"https://www.goandance.com/api/artist/{uuid_val}"
        api_res = await asyncio.to_thread(_fetch_json, api_url)
        if api_res and isinstance(api_res, dict):
            name = api_res.get('name') or name
            born_addr = api_res.get('bornAddress') or {}
            origin = born_addr.get('genericLocation') or ''
            res_addr = api_res.get('residenceAddress') or {}
            base = res_addr.get('genericLocation') or ''

            styles_list = [s.get('caption', '') for s in api_res.get('styles', []) if s.get('caption')]
            dance_styles = ", ".join(styles_list)

    # 2. HTML fallback if location or styles are missing
    if not origin and not base and profile_url:
        try:
            html = await asyncio.to_thread(_fetch_url, profile_url)
            soup = BeautifulSoup(html, 'html.parser')

            h1 = soup.select_one('.profile-main-heading-section h1, h1')
            if h1:
                name = h1.get_text(strip=True) or name

            for div in soup.select('div.content'):
                heading = div.select_one('div.heading')
                if heading:
                    h_text = heading.get_text(strip=True).lower()
                    p_text = div.select_one('p')
                    if p_text:
                        val = p_text.get_text(strip=True)
                        if 'origin' in h_text or 'origen' in h_text:
                            origin = val
                        elif 'base' in h_text:
                            base = val

            if not dance_styles:
                tag_spans = soup.select('.tag-area span, .white-outline-tag-lg')
                if tag_spans:
                    styles_list = [t.get_text(strip=True) for t in tag_spans if t.get_text(strip=True)]
                    dance_styles = ", ".join(styles_list)

            if not uuid_val:
                follow_div = soup.select_one('.js-react-follow')
                if follow_div and follow_div.get('data-api'):
                    m = re.search(r'/api/artist/([a-f0-9\-]{36})/follow', follow_div['data-api'])
                    if m:
                        uuid_val = m.group(1)
        except Exception as e:
            logger.debug(f"HTML fallback failed for {profile_url}: {e}")

    # Fallback UUID from URL slug id if still none
    if not uuid_val:
        m_id = re.search(r'/artist/(\d+)/', profile_url)
        uuid_val = f"gad-artist-{m_id.group(1)}" if m_id else profile_url

    return {
        'uuid': uuid_val,
        'name': name or 'Unknown Artist',
        'origin_location': origin,
        'base_location': base,
        'dance_styles': dance_styles,
        'profile_url': profile_url,
        'category': category_name,
    }


async def run_artist_scrape(
    config,
    progress_queue: asyncio.Queue,
    pause_event: asyncio.Event,
    cancel_event: asyncio.Event
) -> dict:
    """Main execution loop for scraping artists with the universal 2-phase architecture."""
    stats = {"events_found": 0, "events_new": 0, "events_updated": 0, "events_skipped": 0}

    async def check_state():
        while not pause_event.is_set():
            await asyncio.sleep(0.5)
        if cancel_event.is_set():
            raise asyncio.CancelledError()

    async def _emit(event: dict):
        if progress_queue:
            await progress_queue.put(event)
        if event.get('type') == 'log' and event.get('message'):
            try:
                await insert_job_log(config.job_id, event.get('level', 'info'), event['message'])
            except Exception:
                pass

    cat_raw = getattr(config, 'artist_category', 'all') or 'all'
    cat_lower = cat_raw.strip().lower()

    if cat_lower in CATEGORY_MAP:
        targets = [(cat_lower, CATEGORY_MAP[cat_lower])]
    else:
        # Default or 'all': scrape all three categories
        targets = [
            ('dancers', CATEGORY_MAP['dancers']),
            ('singers', CATEGORY_MAP['singers']),
            ('djs', CATEGORY_MAP['djs']),
        ]

    max_artists = getattr(config, 'max_artists', None)
    max_pages = getattr(config, 'max_pages', None)
    concurrency = getattr(config, 'concurrency', 2) or 2

    try:
        await _emit({"type": "phase", "phase": 1, "label": "Starting browser"})

        launch_kwargs = {
            "args": get_stealth_launch_args(),
            "headless": True
        }
        if getattr(config, 'proxy', None):
            launch_kwargs["proxy"] = {"server": config.proxy}

        async with async_playwright() as p:
            browser = await p.chromium.launch(**launch_kwargs)
            context = await browser.new_context()

            if getattr(config, 'session_cookies', None):
                await context.add_cookies(config.session_cookies)

            page = await context.new_page()
            await apply_stealth_page(page)

            # ── Phase 1: Listing / Discovery ─────────────────────────────────
            discovered_artists = []
            seen_urls = set()

            for cat_key, base_url in targets:
                if cancel_event.is_set():
                    break
                await check_state()

                singular_cat = SINGULAR_CATEGORY.get(cat_key, cat_key)
                start_url = base_url

                await _emit({"type": "phase", "phase": 1, "label": f"Scanning {start_url}"})
                await _emit({"type": "log", "level": "info", "message": f"Phase 1: Navigating to {start_url}..."})

                try:
                    await page.goto(start_url, wait_until='networkidle', timeout=60000)
                except Exception as e:
                    await _emit({"type": "error", "message": f"Failed to load start URL: {e}"})
                    continue

                async def _emit_log(msg: str):
                    await _emit({"type": "log", "level": "info", "message": msg})

                await _emit_log("Scrolling page and loading all artists (clicking Load More until done)...")
                await auto_scroll_artists(
                    page,
                    check_state=check_state,
                    emit_log=_emit_log,
                    max_pages=max_pages,
                    max_artists=max_artists
                )

                cards = await extract_artists_from_dom(page, singular_cat)
                new_in_cat = 0
                for c in cards:
                    if c['profile_url'] not in seen_urls:
                        seen_urls.add(c['profile_url'])
                        discovered_artists.append(c)
                        new_in_cat += 1

                await _emit({"type": "log", "level": "info", "message": f"Found {new_in_cat} artist links in {cat_key} directory."})

                if max_artists and len(discovered_artists) >= max_artists:
                    break

            if max_artists and len(discovered_artists) > max_artists:
                discovered_artists = discovered_artists[:max_artists]

            total = len(discovered_artists)
            stats["events_found"] = total
            await _emit({"type": "log", "level": "info", "message": f"Found {total} total artist links on listing page(s)."})

            await update_job(config.job_id, {"resume_cursor": targets[0][1]})
            await page.close()

            # ── Phase 2: Details ─────────────────────────────────────────────
            await check_state()
            await _emit({"type": "phase", "phase": 2, "label": f"Scraping {total} artists"})
            await _emit({"type": "log", "level": "info", "message": f"Phase 2: Crawling {total} artist detail profiles (concurrency: {concurrency})..."})

            sem = asyncio.Semaphore(concurrency)

            for i, item in enumerate(discovered_artists, 1):
                await check_state()

                async with sem:
                    await check_state()
                    try:
                        artist_data = await scrape_artist_details(item, item['category'])
                    except Exception as e:
                        logger.warning(f"Error scraping artist details for {item}: {e}")
                        artist_data = None

                if artist_data:
                    artist_data['job_id'] = config.job_id
                    artist_data['scraped_at'] = datetime.utcnow().isoformat()

                    _, status = await insert_or_update_artist(artist_data)
                    if status == 'new':
                        stats["events_new"] += 1
                        status_label = "new"
                    elif status == 'updated':
                        stats["events_updated"] += 1
                        status_label = "updated"
                    else:
                        stats["events_skipped"] += 1
                        status_label = "existing"

                    # Format location and styles for clear log
                    origin = artist_data.get('origin_location') or ''
                    base = artist_data.get('base_location') or ''
                    styles = artist_data.get('dance_styles') or ''

                    loc_parts = []
                    if origin: loc_parts.append(f"Origin: {origin}")
                    if base: loc_parts.append(f"Base: {base}")
                    loc_str = " | ".join(loc_parts) if loc_parts else "Location: N/A"
                    styles_short = styles if len(styles) <= 40 else (styles[:37] + '...')

                    await _emit({"type": "log", "level": "info", "message": f"[{i}/{total}] Scraped {item['category']}: {artist_data['name']} | {loc_str} | Styles: {styles_short or 'None'} ({status_label})"})

                    await _emit({
                        "type": "progress", "phase": 2,
                        "processed": i, "total": total,
                        "new": stats["events_new"], "updated": stats["events_updated"], "skipped": stats["events_skipped"]
                    })

                    await update_job(config.job_id, {
                        "events_found": stats["events_found"],
                        "events_new": stats["events_new"],
                        "events_updated": stats["events_updated"],
                        "resume_cursor": artist_data.get('profile_url')
                    })
                else:
                    await _emit({"type": "log", "level": "warning", "message": f"[{i}/{total}] Failed to parse artist details from {item.get('profile_url')}"})

                await random_delay(config.min_delay, config.max_delay)

            await browser.close()

            await _emit({"type": "log", "level": "success", "message": f"Scraping complete! Found {stats['events_found']} artists ({stats['events_new']} new, {stats['events_updated']} updated)."})
        await _emit({"type": "done", "events_found": stats["events_found"], "events_new": stats["events_new"], "events_updated": stats["events_updated"]})

    except asyncio.CancelledError:
        await _emit({"type": "log", "level": "warning", "message": "Job cancelled by user"})
        await _emit({"type": "cancelled"})
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logger.error(f"Artist scraper error: {e}\n{tb}")
        await _emit({"type": "error", "message": f"{type(e).__name__}: {str(e)}\n{tb}"})

    return stats
