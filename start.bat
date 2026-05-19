@echo off
REM ── KRMAI Launcher (Windows) ─────────────────────────────
REM Starts backend API + frontend dev server with one command.
cd /d "%~dp0"

echo ================================================
echo   KRMAI — Knowledge Retrieval System
echo ================================================
echo.

REM ── 1. Environment file ───────────────────────────────
if not exist ".env" (
    echo [*] No .env file found. Creating from .env.example ...
    copy .env.example .env >nul
    echo.
    echo   ^⚠  Open .env and set your API key, then re-run this script.
    echo.
    echo      Provider options: groq ^| openai ^| anthropic ^| gemini
    echo      Example:  LLM_PROVIDER=groq
    echo                GROQ_API_KEY=gsk_your_key_here
    echo.
    pause
    exit /b 1
)

REM ── 2. Python dependencies ─────────────────────────────
python -c "import fastapi" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [*] Installing Python dependencies...
    pip install -q -r requirements.txt
)

REM ── 3. Frontend dependencies ───────────────────────────
if not exist "web-app\node_modules" (
    echo [*] Installing frontend dependencies...
    cd web-app
    call npm install --silent
    cd ..
)

REM ── 4. Launch ──────────────────────────────────────────
echo.
echo ================================================
echo   Starting servers...
echo   API:       http://localhost:8000
echo   Frontend:  http://localhost:5173
echo ================================================
echo.
echo   Press Ctrl+C in this window to stop both servers.
echo.

start "KRMAI Backend" cmd /c "uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"
cd web-app
start "KRMAI Frontend" cmd /c "npm run dev"
cd ..

echo.
echo   Both servers started in separate windows.
echo   Close them to stop, or press Ctrl+C here.
pause
