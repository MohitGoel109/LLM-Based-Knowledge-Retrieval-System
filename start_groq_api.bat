@echo off
setlocal enableextensions
cd /d "%~dp0"

echo ==============================================
echo KRMAI API Key Mode - Groq + api_minimal.py
echo ==============================================

where python >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Python is not available in PATH.
    echo         Install Python or activate your environment first.
    exit /b 1
)

set "LLM_PROVIDER=groq"
if "%GROQ_MODEL%"=="" set "GROQ_MODEL=llama-3.3-70b-versatile"

if "%GROQ_API_KEY%"=="" (
    echo [INFO] GROQ_API_KEY is not set in this shell.
    echo        If present in .env, api_minimal.py will load it automatically.
)

echo [INFO] Starting Groq API (api_minimal.py) at http://127.0.0.1:8000
python api_minimal.py
