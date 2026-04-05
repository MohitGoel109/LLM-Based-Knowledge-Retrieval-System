#!/usr/bin/env bash
# ── Render Build Script ──────────────────────────────────────
# This script is used as the Build Command on Render.
# It installs Python deps, builds the React frontend, and
# runs document ingestion if chroma_db doesn't exist yet.
set -e

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Building React frontend..."
cd web-app
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
VITE_API_URL="" npm run build
cd ..

echo "==> Checking vector database..."
if [ ! -d "chroma_db" ] || [ -z "$(ls -A chroma_db 2>/dev/null)" ]; then
    if [ -d "data" ] && [ -n "$(ls -A data 2>/dev/null)" ]; then
        echo "==> Running document ingestion..."
        python ingest.py
    else
        echo "==> WARNING: No data/ directory found. Skipping ingestion."
        echo "    The /health endpoint will report db=false."
    fi
else
    echo "==> chroma_db already exists, skipping ingestion."
fi

echo "==> Build complete!"
