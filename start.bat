@echo off
setlocal enabledelayedexpansion
title LMScraper

REM ── Check venv exists ────────────────────────────────────────────────────────
if not exist "venv\Scripts\uvicorn.exe" (
    echo [ERROR] Virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

REM ── Activate venv and launch ─────────────────────────────────────────────────
call venv\Scripts\activate.bat

echo.
echo  ============================================
echo   LMScraper is starting...
echo   Open http://localhost:8000 in your browser
echo   Press Ctrl+C to stop
echo  ============================================
echo.

REM ── Open browser after 2 seconds ─────────────────────────────────────────────
start /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:8000"

REM ── Start FastAPI server ─────────────────────────────────────────────────────
python run_server.py

pause
