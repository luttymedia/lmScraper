import asyncio
import sys

# Monkey-patch Uvicorn's Windows default to prevent it from breaking Playwright
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    asyncio.WindowsSelectorEventLoopPolicy = asyncio.WindowsProactorEventLoopPolicy

import uvicorn

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
    # If we run programmatically, we can control the loop setup!
    # Wait, uvicorn.run with reload=True spawns a subprocess running `spawn` or `fork`.
    # On Windows it uses `spawn`, which re-evaluates the file.
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
