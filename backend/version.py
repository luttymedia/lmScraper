"""Version and Changelog management for LMScraper."""

VERSION = "1.5.0"
RELEASE_DATE = "2026-08-14"

CHANGELOG = [
    {
        "version": "1.5.0",
        "date": "2026-08-14",
        "title": "Dynamic Dance Style Merging & Tagging on Deduplication",
        "changes": [
            "Updated event deduplication to automatically merge and update dance style tags when identical events are found across different searches",
            "Updated live scraper logs to report 'duplicate, updated tags' when new dance styles are attached to existing events",
            "Ensured automatic scroll-to-top on tab switching across all dashboard sections"
        ]
    },
    {
        "version": "1.4.0",
        "date": "2026-08-14",
        "title": "Schedule Groups & Sequential Execution",
        "changes": [
            "Added schedule group functionality"
        ]
    },
    {
        "version": "1.3.0",
        "date": "2026-08-14",
        "title": "Pagination Reliability & Duplicate Job Optimization",
        "changes": [
            "Fixed pagination issue during jobs",
            "Optimized jobs to skip duplicated events"
        ]
    },
    {
        "version": "1.2.0",
        "date": "2026-08-14",
        "title": "Results Table Enhancements, Advanced Filters & Job Nicknames",
        "changes": [
            "Added horizontal scroll to the Results table",
            "Added filters to Jobs History page and improved jobs filter in Results page",
            "Added nicknames to jobs"
        ]
    },
    {
        "version": "1.1.0",
        "date": "2026-08-13",
        "title": "Go&Dance Platform Optimization & Multi-Platform Foundation",
        "changes": [
            "Added Platform selector (Go&Dance pre-selected) to support modular multi-platform scraping engines",
            "Personalized search and URL query structure tailored specifically for Go&Dance parameters",
            "Integrated real-time location search and autocomplete with country code tagging",
            "Added Job History Re-run capability with automatic pre-population of search parameters",
            "Full end-to-end testing and validation across event listings, filters, and contact extraction"
        ]
    },
    {
        "version": "1.0.0",
        "date": "2026-08-13",
        "title": "Initial Release",
        "changes": [
            "Universal 3-level Playwright scraping engine (Listings → Detail → Organizer)",
            "Dark-mode admin panel with Amber/Gold design system",
            "Target website analysis for Go&Dance and Salsero.es with CSR/SSR handling",
            "Deduplication system using SHA-256 content hashing across scrape runs",
            "Full HTML page caching for pause, stop/resume, and crash recovery",
            "Data export capabilities to CSV and custom-styled Excel (.xlsx) files",
            "APScheduler backend integration for recurring scheduled scraping jobs",
            "Saved Sessions management to paste browser cookies for member-only pages",
            "Data storage monitor with threshold alerts and granular cleanup/backup tools",
            "Interactive tooltips, live WebSocket progress logs, and responsive layout"
        ]
    }
]
