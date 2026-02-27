@echo off
setlocal
title LLM Knowledge Retrieval System Launcher

echo ========================================================
echo       LLM Knowledge Retrieval System Setup/Run
echo ========================================================

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not found in your PATH.
    echo Please install Python 3.10+ and add it to PATH.
    pause
    exit /b
)

REM Create venv if it doesn't exist
if not exist venv (
    echo [INFO] Creating virtual environment...
    python -m venv venv
)

REM Activate venv
call venv\Scripts\activate

REM Install dependencies
echo [INFO] Checking dependencies...
pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Installing dependencies...
    pip install -r requirements.txt
)

REM Check for data directory
if not exist data (
    mkdir data
    echo [INFO] Created 'data' directory.
    echo [ACTION] Please put your PDF/DOCX files in the 'data' folder.
)

:menu
echo.
echo Select an option:
echo 1. Ingest Documents (Process PDFs in 'data' folder)
echo 2. Run Application (Streamlit UI)
echo 3. Exit
echo.
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo.
    echo [INFO] Starting ingestion process...
    python ingest.py
    echo [INFO] Ingestion complete.
    pause
    goto menu
)

if "%choice%"=="2" (
    echo.
    echo [INFO] Starting User Interface...
    streamlit run app.py
)

if "%choice%"=="3" (
    exit /b
)

goto menu
