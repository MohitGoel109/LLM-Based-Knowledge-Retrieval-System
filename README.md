# KRMAI: LLM-Based Knowledge Retrieval System

KRMAI is a local Retrieval-Augmented Generation (RAG) assistant for KR Mangalam University information. It answers student questions using university documents from the data folder and returns source citations with each response.

The project includes:
- A FastAPI backend with normal and streaming chat endpoints.
- A React + Vite frontend with real-time token streaming.
- A document ingestion pipeline using ChromaDB and sentence-transformers.
- A legacy Streamlit UI for quick local testing.

## Core Features

- Local-first setup (Ollama + local vector DB).
- Source-grounded answers from ingested university documents.
- Token streaming over Server-Sent Events (SSE).
- Query normalization with slang and Hinglish expansion.
- Session history in frontend localStorage.
- Source badges shown per response.

## Tech Stack

### Backend
- Python
- FastAPI + Uvicorn
- LangChain ecosystem
- ChromaDB
- sentence-transformers/all-MiniLM-L6-v2
- Ollama with qwen2.5:3b

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- react-markdown + remark-gfm

## Repository Structure

```text
Mini_project/
├── api.py                          # FastAPI app (health/chat/stream)
├── rag_engine.py                   # Retrieval + prompt + LLM + streaming logic
├── ingest.py                       # Document ingestion into ChromaDB
├── app.py                          # Legacy Streamlit interface
├── test_system.py                  # Integration and quality tests
├── requirements.txt                # Python dependencies
├── start.sh                        # Linux/macOS launcher (API + frontend)
├── start.bat                       # Windows launcher (ingest + Streamlit)
├── docs/
│   ├── guides/
│   │   ├── KRMAI_Technical_Guide.txt
│   │   └── running-application.txt
│   ├── planning/
│   │   └── RAG_Implementation_Plan.html
│   └── pipeline/
│       ├── README.md
│       └── pipeline-visualization.html
├── data/                           # Source documents for ingestion
├── chroma_db/                      # Persistent vector store (generated)
├── evaluation/
│   ├── test_results.json           # Automated test outputs
│   └── plots/                      # Benchmark and comparison charts
├── assets/                         # Screenshots and demo media
├── docs/sources/
│   └── KRMU-BUS-ROUTE-AUG25.pdf    # Reference source file (optional)
└── web-app/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── context/
        ├── data/
        └── components/
```

## System Flow

1. Documents are loaded from `data/` (`.txt`, `.pdf`, `.docx`).
2. Text is chunked and embedded with all-MiniLM-L6-v2.
3. Chunks are stored in `chroma_db/`.
4. User query is normalized (slang/Hinglish expansion).
5. Top relevant chunks are retrieved from Chroma.
6. Prompt is built with retrieved context and recent chat history.
7. Ollama model (`qwen2.5:3b`) generates the answer.
8. API returns answer + source metadata (or streams tokens via SSE).

## Prerequisites

- Python 3.10+
- Node.js 18+
- Ollama installed and available on PATH
- Recommended RAM: 8 GB minimum

## Quick Start

### Option A: Linux/macOS launcher

```bash
./start.sh
```

What it does:
- Starts Ollama if needed.
- Pulls `qwen2.5:3b` if missing.
- Installs Python dependencies if needed.
- Runs ingestion if `chroma_db/` is missing.
- Starts FastAPI on port 8000 and frontend on port 5173.

### Option B: Manual setup

1. Start Ollama and pull model:

```bash
ollama serve
ollama pull qwen2.5:3b
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Ingest documents:

```bash
python ingest.py
```

4. Start backend:

```bash
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

5. Start frontend (new terminal):

```bash
cd web-app
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:8000

### Option C: Windows launcher

```bat
start.bat
```

Note: Current Windows launcher menu supports ingestion and Streamlit mode.

## API Reference

### `GET /health`
Returns backend readiness and component status.

### `POST /chat`
Synchronous chat response.

Request body:

```json
{
  "message": "What is the BTech CSE fee?",
  "history": [
    { "role": "user", "content": "Previous question" },
    { "role": "assistant", "content": "Previous answer" }
  ]
}
```

Response body:

```json
{
  "answer": "...",
  "sources": [
    { "source": "krmu_fee_structure.txt", "page": null }
  ]
}
```

### `POST /chat/stream`
SSE streaming endpoint.

SSE event payloads:
- Token event: `{"type":"token","content":"..."}`
- Done event: `{"type":"done","sources":[...]}`

Example (terminal):

```bash
curl -N -X POST http://localhost:8000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"Tell me about hostel facilities"}'
```

## Ingestion Notes

- Input folder: `data/`
- Supported formats: `.txt`, `.pdf`, `.docx`
- Running `python ingest.py` rebuilds the vector database at `chroma_db/`.
- Re-run ingestion whenever source documents change.

## Testing

Run full test suite:

```bash
python test_system.py
```

Expected before testing:
- Ollama running with `qwen2.5:3b`
- API running on port 8000
- `chroma_db/` already ingested

Test output is written to `evaluation/test_results.json`.

## Frontend Commands

```bash
cd web-app
npm run dev
npm run build
npm run preview
```

## Legacy Streamlit Mode

Run:

```bash
streamlit run app.py
```

This is useful for quick backend checks but the primary UI is in `web-app/`.

## Troubleshooting

- `RAG Engine is not ready`:
  - Check Ollama is running (`ollama serve`).
  - Ensure model exists (`ollama list`).
  - Ensure vector DB exists (`python ingest.py`).

- Empty or weak answers:
  - Verify relevant files exist in `data/`.
  - Re-run ingestion after document edits.

- Frontend cannot connect:
  - Confirm backend is on `http://localhost:8000`.
  - Check CORS/network restrictions in your environment.

- Streaming not appearing:
  - Verify `/chat/stream` endpoint returns SSE events.
  - Check browser console/network tab for stream errors.

## Current Limitations

- No authentication/authorization.
- No server-side persistent user sessions.
- CORS allows all origins (development-friendly, not hardened).
- No rate limiting.
- Single-machine vector store setup.
- Windows launcher does not start React frontend.

## License

ISC license is configured in `web-app/package.json`.

## Contributors

- Swetank Pritam
