@echo off
setlocal enabledelayedexpansion
title LMScraper — First-Time Setup

echo.
echo  ============================================
echo   LMScraper — First-Time Setup
echo  ============================================
echo.

REM ── 1. Check Python ─────────────────────────────────────────────────────────
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.11+ from https://python.org
    pause
    exit /b 1
)
python --version

REM ── 2. Create virtual environment ───────────────────────────────────────────
if not exist "venv\" (
    echo.
    echo [1/5] Creating Python virtual environment...
    python -m venv venv
    echo       Done.
) else (
    echo [1/5] Virtual environment already exists. Skipping.
)

REM ── 3. Install dependencies ──────────────────────────────────────────────────
echo.
echo [2/5] Installing Python dependencies...
call venv\Scripts\pip install --prefer-binary -r requirements.txt --quiet
echo       Done.

REM ── 4. Install Playwright Chromium browser ───────────────────────────────────
echo.
echo [3/5] Installing Playwright Chromium browser (~130 MB)...
call venv\Scripts\playwright install chromium
echo       Done.

REM ── 5. Create data directories ───────────────────────────────────────────────
echo.
echo [4/5] Creating data directories...
if not exist "data\" mkdir data
if not exist "data\html_cache\" mkdir data\html_cache
if not exist "data\exports\" mkdir data\exports
echo       Done.

REM ── 6. Git setup ─────────────────────────────────────────────────────────────
echo.
echo [5/5] Setting up Git...
if not exist ".git\" (
    git init
    git remote add origin https://github.com/luttymedia/lmScraper.git
    echo       Git initialized and remote configured.
) else (
    echo       Git already initialized. Skipping.
)

echo.
echo  ============================================
echo   Setup complete! Run start.bat to launch.
echo  ============================================
echo.
pause
