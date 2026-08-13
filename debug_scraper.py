import asyncio
import sys
import logging
import traceback
from backend.scraper.engine import ScraperConfig, run_scrape

logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)

async def main():
    try:
        config = ScraperConfig('test_id', 'https://www.goandance.com/es/eventos', {})
        await run_scrape(config, asyncio.Queue(), asyncio.Event(), asyncio.Event())
    except Exception as e:
        print("EXCEPTION CAUGHT IN MAIN:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
