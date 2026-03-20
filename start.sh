#!/usr/bin/env bash
# ── LLM-Based Knowledge Retrieval System – Launcher ──────────
set -e
cd "$(dirname "$0")"

echo "=================================================="
echo "  LLM Knowledge Retrieval System"
echo "=================================================="

# 1. Check Ollama
if ! command -v ollama &>/dev/null; then
    echo "[ERROR] Ollama not found. Install from https://ollama.com"
    exit 1
fi

# 2. Start Ollama if not running
if ! curl -s http://localhost:11434/api/tags &>/dev/null; then
    echo "[INFO] Starting Ollama server..."
    ollama serve &>/dev/null &
    sleep 3
fi

# 3. Pull model if needed
if ! ollama list 2>/dev/null | grep -q "qwen2.5:3b"; then
    echo "[INFO] Pulling qwen2.5:3b model (first time only)..."
    ollama pull qwen2.5:3b
fi

echo "[OK] Ollama is running with qwen2.5:3b"

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
    trap "echo ''; echo '[INFO] Shutting down...'; kill $API_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
    wait
fi
