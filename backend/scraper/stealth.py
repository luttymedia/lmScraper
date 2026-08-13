"""Anti-bot stealth configuration for Playwright."""
import random
import asyncio
import fake_useragent

DEFAULT_MIN_DELAY = 1.5
DEFAULT_MAX_DELAY = 4.0

def get_stealth_launch_args() -> list[str]:
    """Return Playwright chromium launch args for stealth."""
    return [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--lang=en-US,en'
    ]

def get_random_viewport() -> dict:
    """Return a random desktop viewport."""
    return {
        "width": random.randint(1280, 1920),
        "height": random.randint(720, 1080)
    }

def get_random_user_agent() -> str:
    """Return a random modern desktop Chrome user agent."""
    try:
        ua = fake_useragent.UserAgent()
        return ua.chrome
    except:
        return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

def get_stealth_headers(user_agent: str) -> dict:
    """Return realistic HTTP headers dict."""
    return {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': user_agent
    }

async def apply_stealth_page(page) -> None:
    """Apply stealth techniques to a Playwright page."""
    # Override navigator.webdriver
    await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    # Override navigator.plugins
    await page.add_init_script("""
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3]
        });
    """)
    
    # Override languages
    await page.add_init_script("""
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en']
        });
    """)
    
    viewport = get_random_viewport()
    await page.set_viewport_size(viewport)
    
    ua = get_random_user_agent()
    headers = get_stealth_headers(ua)
    await page.set_extra_http_headers(headers)

async def random_delay(min_s: float = DEFAULT_MIN_DELAY, max_s: float = DEFAULT_MAX_DELAY) -> None:
    """Sleep for a random duration."""
    delay = random.uniform(min_s, max_s)
    await asyncio.sleep(delay)

async def inject_cookies(page, cookies: list[dict]) -> None:
    """Inject a list of cookie dicts into the page context."""
    if not cookies:
        return
    await page.context.add_cookies(cookies)
