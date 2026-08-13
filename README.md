# LMScraper

A personal event scraping tool with a dark-mode admin panel. Built to extract event data and organizer contact information from dance event aggregators like [Go&Dance](https://www.goandance.com) and [Salsero.es](https://salsero.es).

## Features

- 🌐 **Universal scraper** — paste any event listing URL, works on SSR and SPA sites
- 🎭 **Stealth mode** — Playwright-powered headless browser with anti-bot protections
- 📋 **3-level crawl** — listing pages → event detail pages → organizer profile pages
- 📇 **Contact extraction** — emails, phone numbers, Instagram, Facebook, TikTok, WhatsApp, YouTube, Twitter/X
- 🔁 **Deduplication** — SHA-256 fingerprinting prevents duplicate events across runs
- ⏸️ **Pause / Resume** — graceful job control with crash recovery
- 📅 **Scheduler** — recurring scrape jobs via cron expressions
- 🔑 **Saved Sessions** — paste browser cookies to access member-only pages
- 📊 **Export** — filtered results to CSV or XLSX
- 🗃️ **Data monitor** — tracks DB size and prompts cleanup when thresholds are reached

## Quick Start

### First-time setup
Double-click **`setup.bat`** — this will:
1. Create a Python virtual environment
2. Install all dependencies
3. Download the Playwright Chromium browser (~130 MB)
4. Create data directories
5. Initialize the local Git repository

### Daily use
Double-click **`start.bat`** — this will launch the app and open `http://localhost:8000` in your browser.

## Requirements

- Windows 10/11
- Python 3.11 or newer — [download here](https://python.org)
- Git — [download here](https://git-scm.com)

## Project Structure

```
lmScraper/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── scraper/             # Playwright scraping engine
│   ├── jobs/                # Job runner and scheduler
│   └── storage/             # Database, export, monitor
├── frontend/
│   ├── index.html           # Admin panel shell
│   ├── style.css            # All styles
│   └── app.js               # All UI logic
├── data/                    # Auto-created; gitignored
│   ├── lmscraper.db         # SQLite database
│   ├── html_cache/          # Raw HTML backups per job
│   └── exports/             # Downloaded CSV/XLSX files
├── setup.bat                # First-time setup
├── start.bat                # Daily launcher
└── requirements.txt
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + Uvicorn |
| Scraping | Playwright (Chromium, async) |
| HTML Parsing | BeautifulSoup4 |
| Scheduling | APScheduler |
| Database | SQLite + aiosqlite |
| Export | pandas + openpyxl |
| Frontend | Vanilla HTML / CSS / JavaScript |

## Notes

- The `data/` directory is excluded from Git — your scraped data stays local
- Saved session cookies are stored locally in the SQLite DB, never transmitted
- All scraping respects configurable request delays to avoid being blocked
