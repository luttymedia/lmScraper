"""Exporter module for exporting scraped events to CSV and XLSX."""
import pandas as pd
import io
import aiofiles
from pathlib import Path
from datetime import datetime
from fastapi.responses import StreamingResponse
from backend.storage.db import query_events
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font

async def get_events_df(filters: dict) -> pd.DataFrame:
    """Get all events matching filters as a DataFrame."""
    events, _ = await query_events(filters, page=1, per_page=999999)
    if not events:
        return pd.DataFrame()
        
    cols = [
        'title', 'date_start', 'date_end', 'city', 'country', 'venue', 'price',
        'category', 'organizer_name', 'organizer_email', 'organizer_phone',
        'organizer_instagram', 'organizer_facebook', 'organizer_tiktok',
        'organizer_whatsapp', 'organizer_youtube', 'organizer_twitter',
        'organizer_website', 'contact_hidden', 'event_url', 'source_domain', 'scraped_at'
    ]
    
    df = pd.DataFrame(events)
    # Ensure all required columns exist
    for col in cols:
        if col not in df.columns:
            df[col] = ''
            
    # Reorder columns
    df = df[cols]
    return df

async def export_to_csv(filters: dict) -> StreamingResponse:
    """Export events to CSV format."""
    df = await get_events_df(filters)
    
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)
    
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"lmscraper_export_{timestamp}.csv"
    
    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

async def export_to_xlsx(filters: dict) -> StreamingResponse:
    """Export events to XLSX format."""
    df = await get_events_df(filters)
    
    stream = io.BytesIO()
    
    with pd.ExcelWriter(stream, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Events')
        worksheet = writer.sheets['Events']
        
        # Apply header formatting
        header_fill = PatternFill(start_color='1a1c23', end_color='1a1c23', fill_type='solid')
        header_font = Font(color='f5a623', bold=True)
        
        for cell in worksheet[1]:
            cell.fill = header_fill
            cell.font = header_font
            
        # Freeze header row
        worksheet.freeze_panes = 'A2'
        
        # Auto-fit column widths
        for col_idx, col in enumerate(df.columns, 1):
            max_len = max((df[col].astype(str).map(len).max(), len(col)))
            worksheet.column_dimensions[worksheet.cell(row=1, column=col_idx).column_letter].width = min(max_len + 2, 50)
            
    stream.seek(0)
    
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"lmscraper_export_{timestamp}.xlsx"
    
    return StreamingResponse(
        io.BytesIO(stream.getvalue()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
