"""Version and Changelog management for LMScraper."""

VERSION = "2.2.0"
RELEASE_DATE = "2026-08-25"

CHANGELOG = [
    {
        "version": "2.2.0",
        "date": "2026-08-25",
        "title": "Row Locking & Deletion Protection",
        "changes": [
            "Added row locking mechanism ('is_locked') allowing records to be protected against all deletion paths while remaining editable",
            "Added padlock indicator column as the first data column in the Results table with instant inline click-to-toggle",
            "Added bulk lock, unlock, and safe delete actions with confirmation warnings for locked rows in the Results table",
            "Added 'Locked' filter dropdown in Results to filter records by lock status (Any / Only Locked / Only Unlocked)",
            "Updated database cleanup routines and purge tools to preserve locked rows by default with optional override options",
            "Updated CSV and XLSX exports to include the 'locked' column right after record ID, with full roundtrip import support"
        ]
    },
    {
        "version": "2.1.0",
        "date": "2026-08-17",
        "title": "Salsero Platform Integration",
        "changes": [
            "Integrated Salsero.es as a fully supported scraping platform with custom HTML structural parsing",
            "Added dynamic UI toggles to hide unsupported platform-specific filters when Salsero is selected",
            "Implemented engine routing to switch between Go&Dance's auto-scroll and Salsero's multi-page pagination",
            "Added robust regex date and time parsing to standardize Salsero timestamps into ISO formats",
            "Enhanced location extraction to cleanly isolate venue names from nested city and country elements"
        ]
    },
    {
        "version": "2.0.0",
        "date": "2026-08-15",
        "title": "Mobile Responsiveness & Remote Access",
        "changes": [
            "Comprehensive mobile UI optimization for New Job, Job History, Results, and Scheduler tabs",
            "Restructured Job History cards, filters, and action buttons for seamless mobile view without horizontal scrolling",
            "Redesigned Schedule Group cards into clean multi-row component layout with status indicators and pill metadata",
            "Repositioned mobile navigation menu trigger and aligned search/filter action rows",
            "Added mobile remote access tunnel support for remote monitoring"
        ]
    },
    {
        "version": "1.9.0",
        "date": "2026-08-14",
        "title": "Data Management System & Automated Maintenance",
        "changes": [
            "Implemented Data Management system with dedicated Backup & Restore and Clean Up & Purge sections",
            "Added granular target selection for Full System, Results & Cache Only, and Schedules & Groups Only",
            "Implemented direct-to-folder backups storing ZIP snapshots in backups/ subdirectories",
            "Added automated job cache compression upon completion and once-per-day background maintenance",
            "Added daily automated full backups with a 5-day rolling retention policy (manual backups preserved)"
        ]
    },
    {
        "version": "1.8.0",
        "date": "2026-08-14",
        "title": "Import / Export Synchronization System",
        "changes": [
            "Implemented CSV/XLSX file import with interactive 3-step wizard (Upload -> Preview Diff -> Apply)",
            "Added Partial import (safe updates for subsets) and Complete import (full sync with absent row hiding) modes",
            "Added full diff preview breakdown highlighting field-level changes, inserted records, and hidden items",
            "Implemented automatic pre-import SQLite database snapshots stored in data/exports/import_backups/",
            "Enhanced date parser & boolean normalizer for seamless roundtrip import/export compatibility"
        ]
    },
    {
        "version": "1.7.0",
        "date": "2026-08-14",
        "title": "Sequential Execution Mode & Reordering for Schedule Groups",
        "changes": [
            "Implemented Sequential (Immediate) mode for Schedule Groups to automatically chain jobs back-to-back with zero interval wait time",
            "Fixed a bug where manual triggers of sequential groups caused all jobs to spawn simultaneously",
            "Added a Reverse Order button to the Group Members modal for quick reordering without manual drag-and-drop"
        ]
    },
    {
        "version": "1.6.0",
        "date": "2026-08-14",
        "title": "Job Log Persistence & Updated Tags Filtering",
        "changes": [
            "Added 'Updated' tag count filter to Job History cards to filter results table specifically by events updated by a job",
            "Implemented job execution log persistence and a dark console modal viewer ('Logs' button) to inspect full execution logs for any job"
        ]
    },
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
