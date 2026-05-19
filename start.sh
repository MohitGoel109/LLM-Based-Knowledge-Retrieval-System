#!/usr/bin/env bash
# ── KRMAI Launcher ──────────────────────────────────────────
# Starts backend API + frontend dev server with one command.
set -e

cd "$(dirname "$0")"

echo "================================================"
echo "  KRMAI — Knowledge Retrieval System"
echo "================================================"
echo ""

# ── 1. Environment file ───────────────────────────────
if [ ! -f ".env" ]; then
    echo "[*] No .env file found. Creating from .env.example ..."
    cp .env.example .env
    echo ""
    echo "  ⚠  Open .env and set your API key, then re-run this script."
    echo ""
    echo "     Provider options: nim | openai | anthropic | gemini"
    echo "     Example:  LLM_PROVIDER=nim"
    echo "               NIM_API_KEY=nvapi-your_key_here"
    echo ""
    exit 0
fi

set -a; source .env; set +a

# ── 2. Pick provider ───────────────────────────────────
PROVIDER="${LLM_PROVIDER:-nim}"
KEY_VAR="${PROVIDER^^}_API_KEY"
API_KEY="${!KEY_VAR}"

if [ -z "$API_KEY" ] || [ "$API_KEY" = "your_${PROVIDER}_api_key_here" ]; then
    echo "[!] $KEY_VAR is not set or still has the placeholder value."
    echo "    Edit .env and set a valid API key, then re-run."
    exit 1
fi
echo "[OK] Provider: $PROVIDER  |  Model: $(eval echo \$${PROVIDER^^}_MODEL)"

# ── 3. Python dependencies ─────────────────────────────
if ! python -c "import fastapi" &>/dev/null 2>&1; then
    echo "[*] Installing Python dependencies..."
    pip install -q -r requirements.txt
fi

# ── 4. Frontend dependencies ───────────────────────────
if [ ! -d "web-app/node_modules" ]; then
    echo "[*] Installing frontend dependencies..."
    cd web-app && npm install --silent && cd ..
fi

# ── 5. Document ingestion (optional) ───────────────────
if [ -d "data" ] && [ "$(ls -A data 2>/dev/null)" ] && \
   { [ ! -d "chroma_db" ] || [ -z "$(ls -A chroma_db 2>/dev/null)" ]; }; then
    echo "[*] Running document ingestion..."
    python scripts/ingest.py
fi

# ── 6. Launch ──────────────────────────────────────────
echo ""
echo "================================================"
echo "  Starting servers..."
echo "  API:       http://localhost:8000"
echo "  Frontend:  http://localhost:5173"
echo "================================================"
echo ""

# Start backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Start frontend
cd web-app
npm run dev &
FRONTEND_PID=$!
cd ..

# Trap Ctrl+C to kill both
trap 'echo ""; echo "[ Shutting down... ]"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT TERM

wait
