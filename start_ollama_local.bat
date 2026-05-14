@echo off
setlocal enableextensions
cd /d "%~dp0"

echo ==============================================
echo KRMAI Local Mode - Ollama + api.py
echo ==============================================

where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python is not available in PATH.
    echo         Install Python or activate your environment first.
    exit /b 1
)

where ollama >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Ollama is not available in PATH.
    echo         Install from https://ollama.com/download
    exit /b 1
)

set "LLM_PROVIDER=ollama"
if "%OLLAMA_MODEL%"=="" set "OLLAMA_MODEL=qwen2.5:3b"
if "%OLLAMA_BASE_URL%"=="" set "OLLAMA_BASE_URL=http://127.0.0.1:11434"
set "SKIP_EMBEDDINGS=false"

echo [INFO] Checking Ollama server...
ollama list >nul 2>nul
if errorlevel 1 (
    echo [INFO] Ollama is not running. Starting server...
    start "Ollama Server" cmd /k "ollama serve"
    timeout /t 6 /nobreak >nul
    ollama list >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] Ollama did not become ready in time.
        exit /b 1
    )
)

echo [INFO] Ollama is running.
echo [INFO] Ensuring model %OLLAMA_MODEL% is available...
ollama list 2>nul | findstr /I /C:"%OLLAMA_MODEL%" >nul
if errorlevel 1 (
    echo [INFO] Pulling %OLLAMA_MODEL% (first run can take several minutes)...
    ollama pull %OLLAMA_MODEL%
    if errorlevel 1 (
        echo [ERROR] Failed to pull model %OLLAMA_MODEL%.
        exit /b 1
    )
)

if not exist "chroma_db\chroma.sqlite3" (
    echo [INFO] Chroma DB not found. Running ingestion once...
    python ingest.py
    if errorlevel 1 (
        echo [ERROR] Ingestion failed.
        exit /b 1
    )
)

echo [INFO] Starting local API (api.py) at http://127.0.0.1:8000
python api.py
