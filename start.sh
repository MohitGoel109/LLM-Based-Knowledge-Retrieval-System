#!/usr/bin/env bash
# ── LLM-Based Knowledge Retrieval System – Launcher ──────────
set -e
cd "$(dirname "$0")"

echo "=================================================="
echo "  LLM Knowledge Retrieval System"
echo "=================================================="

# Load environment variables from .env when present
if [ -f ".env" ]; then
    set -a
    . ./.env
    set +a
fi

LLM_PROVIDER="$(printf "%s" "${LLM_PROVIDER:-groq}" | tr '[:upper:]' '[:lower:]')"
GROQ_MODEL="${GROQ_MODEL:-llama-3.3-70b-versatile}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5:3b}"
OLLAMA_BASE_URL="${OLLAMA_BASE_URL:-http://localhost:11434}"

if [ "$LLM_PROVIDER" = "groq" ]; then
    if [ -z "${GROQ_API_KEY:-}" ] || [ "${GROQ_API_KEY:-}" = "your_groq_api_key_here" ]; then
        echo "[ERROR] GROQ_API_KEY is missing. Set it in .env or your shell environment."
        exit 1
    fi
    echo "[OK] Using Groq provider with model: $GROQ_MODEL"
elif [ "$LLM_PROVIDER" = "ollama" ]; then
    # 1. Check Ollama
    if ! command -v ollama &>/dev/null; then
        echo "[ERROR] Ollama not found. Install from https://ollama.com"
        exit 1
    fi

    # 2. Start Ollama if not running
    if ! curl -s "${OLLAMA_BASE_URL%/}/api/tags" &>/dev/null; then
        echo "[INFO] Starting Ollama server..."
        ollama serve &>/dev/null &
        sleep 3
    fi

    # 3. Pull model if needed
    if ! ollama list 2>/dev/null | grep -Fq "$OLLAMA_MODEL"; then
        echo "[INFO] Pulling $OLLAMA_MODEL model (first time only)..."
        ollama pull "$OLLAMA_MODEL"
    fi

    echo "[OK] Ollama is running with $OLLAMA_MODEL"
else
    echo "[ERROR] Unsupported LLM_PROVIDER: $LLM_PROVIDER (use 'groq' or 'ollama')"
    exit 1
fi

# 4. Check Python deps
if ! python -c "import fastapi" &>/dev/null; then
    echo "[INFO] Installing Python dependencies..."
    pip install -r requirements.txt
fi

# 5. Auto-ingest if no vector DB exists
if [ ! -d "chroma_db" ] || [ -z "$(ls -A chroma_db 2>/dev/null)" ]; then
    echo "[INFO] No vector database found. Running ingestion..."
    HF_HUB_OFFLINE=0 python ingest.py
fi

# 6. Determine launch mode
MODE="${1:-api}"

if [ "$MODE" = "streamlit" ]; then
    echo ""
    echo "[INFO] Launching Streamlit app..."
    echo "       Open http://localhost:8501 in your browser"
    echo "=================================================="
    streamlit run app.py --server.headless true
else
    echo ""
    echo "[INFO] Launching FastAPI backend + React frontend..."
    echo "       API:      http://localhost:8000"
    echo "       Frontend: http://localhost:5173"
    echo "=================================================="

    # Start FastAPI backend
    HF_HUB_OFFLINE=1 python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload &
    API_PID=$!

    # Start React frontend
    if [ -d "web-app" ]; then
        cd web-app
        if [ ! -d "node_modules" ]; then
            echo "[INFO] Installing frontend dependencies..."
            npm install
        fi
        npm run dev &
        FRONTEND_PID=$!
        cd ..
    fi

    # Trap Ctrl+C to kill both
    trap 'echo ""; echo "[INFO] Shutting down..."; kill ${API_PID:-} ${FRONTEND_PID:-} 2>/dev/null || true; exit 0' INT TERM
    wait
fi
