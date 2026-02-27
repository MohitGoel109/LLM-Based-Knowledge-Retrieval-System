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
if ! ollama list 2>/dev/null | grep -q "llama3.2:3b"; then
    echo "[INFO] Pulling llama3.2:3b model (first time only, ~2GB)..."
    ollama pull llama3.2:3b
fi

echo "[OK] Ollama is running with llama3.2:3b"

# 4. Check Python deps
if ! python -c "import streamlit" &>/dev/null; then
    echo "[INFO] Installing Python dependencies..."
    pip install -r requirements.txt
fi

# 5. Auto-ingest if no vector DB exists
if [ ! -d "chroma_db" ]; then
    echo "[INFO] No vector database found. Running ingestion..."
    python ingest.py
fi

# 6. Launch Streamlit
echo ""
echo "[INFO] Launching Streamlit app..."
echo "       Open http://localhost:8501 in your browser"
echo "=================================================="
streamlit run app.py --server.headless true
