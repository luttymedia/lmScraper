from typing import Any
from playwright.async_api import Page
from bs4 import BeautifulSoup

class BaseScraper:
    """Abstract base class for platform-specific scrapers."""
    
    async def process_listing_page(self, page: Page, html: str, url: str) -> list[str]:
        """Extract event detail URLs from a listing page."""
        raise NotImplementedError
        
    async def prepare_detail_page(self, page: Page) -> None:
        """Perform any platform-specific actions before extracting HTML (e.g., click modals)."""
        pass
        
    def extract_event_details(self, soup: BeautifulSoup, url: str) -> tuple[dict | None, dict | None, str | None]:
        """
        Extract event and organizer info from a detail page.
        Returns: (event_dict, organizer_dict, profile_url)
        """
        raise NotImplementedError
