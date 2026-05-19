# KRMAI — Technical Guide

## How to Run

### Prerequisites

- Python 3.11+
- Node.js 22+
- An API key from one of: [Groq](https://console.groq.com), [OpenAI](https://platform.openai.com), [Anthropic](https://console.anthropic.com), or [Google Gemini](https://aistudio.google.com)

### Step 1: Environment Setup

```bash
cp .env.example .env
```

Edit `.env` — set `LLM_PROVIDER` to your choice and fill in the matching API key:

```env
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_actual_key
```

### Step 2: Backend

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Backend runs at **http://localhost:8000**.

### Step 3: Frontend (development mode)

```bash
cd web-app
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** with API proxy to backend.

### Step 4: Using the API directly (no frontend)

```bash
curl http://localhost:8000/health
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the BTech CSE fee structure?"}'
```

### Step 5: Document Ingestion (optional, for RAG)

Place PDF/TXT/DOCX files in `data/`, then:

```bash
python scripts/ingest.py
```

---

## Architecture Changes Made

### Before (Monolithic)

```
api.py              — All routes + streaming + SPA serving
rag_engine.py       — RAG + slang + Ollama + Groq in one file
config.py           — Settings with Ollama fields
api_minimal.py      — Vercel-specific duplicate
ingest.py           — Document ingestion at root
```

### After (Modular)

```
backend/
  main.py           — FastAPI app, CORS, lifespan, SPA catch-all
  config.py         — Settings with 4 providers, no Ollama
  api/
    models.py       — ChatRequest, ChatResponse, SourceDoc, HealthResponse
    routes.py       — /health, /provider, /chat, /chat/stream, /sources
  services/
    rag_engine.py   — RAG orchestration, prompts, creator detection
    providers.py    — Abstract LLM provider layer (Groq/OpenAI/Anthropic/Gemini)
  data/
    slang_map.py    — 300+ slang/Hinglish mappings with expand_slang()
scripts/
  ingest.py         — Vector store builder
```

---

## Provider Abstraction

All providers are API-key-based — no local models, no Ollama, no downloads.

| Provider   | Class              | LangChain Package        | Env Key               |
|------------|--------------------|--------------------------|----------------------|
| Groq       | `GroqProvider`     | `langchain-groq`         | `GROQ_API_KEY`       |
| OpenAI     | `OpenAIProvider`   | `langchain-openai`       | `OPENAI_API_KEY`     |
| Anthropic  | `AnthropicProvider`| `langchain-anthropic`    | `ANTHROPIC_API_KEY`  |
| Gemini     | `GeminiProvider`   | `langchain-google-genai` | `GEMINI_API_KEY`     |

Set `LLM_PROVIDER=openai` (or `groq` / `anthropic` / `gemini`) and only your chosen provider's key is required. The others can stay empty.

Each provider implements the same interface via `get_chat_model(settings)` returning a `BaseChatModel`, making the RAG engine provider-agnostic.

---

## What Was Removed

### Ollama / Local Model
- `langchain_ollama` dependency
- `OLLAMA_MODEL`, `OLLAMA_BASE_URL`, `OLLAMA_TIMEOUT` config
- `_ollama_is_running()` health check
- `OllamaLLM` initialization branch
- `start_ollama_local.bat`
- Ollama provider option (was 1 of 2, now 1 of 4 API providers)

### Vercel
- `vercel.json` (root + web-app) — SPA rewrites, Python builds, env config
- `api_minimal.py` — duplicate Vercel-specific API with Groq-only fallback
- `api_vercel.py` — compatibility alias
- 5 deployment shell scripts
- 6 Vercel documentation files

### Dead Code
- `push.py` — debug git pusher
- `app.py` — Streamlit UI (replaced by React frontend)
- `test_api.py`, `test_system.py` — outdated test suites
- `start_groq_api.bat` — Windows batch script
- `log.txt`, `log_app.txt`, `status.txt`, `status2.txt` — runtime logs
- All `__pycache__` directories
- `nohup.out`, `vite.log`

### Redundant Documentation
- `DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_NON_VERCEL.md`, `DEPLOYMENT_SUMMARY.md`
- `VERCEL_DEPLOYMENT.md`, `VERCEL_DEPLOYMENT_GUIDE.md`
- `RENDER_DEPLOYMENT_CHECKLIST.md`, `FIX_PLAN.md`, `ISSUES_FOUND.md`
- `SYSTEM_ARCHITECTURE.md`, `SKIP_EMBEDDINGS.md`

---

## Key Code Improvements

### 1. Config (`backend/config.py`)
- Frozen dataclass → now uses `field(default_factory=...)` for lazy evaluation
- Added `openai`, `anthropic`, `gemini` config fields
- `groq_configured` → `provider_configured()` dynamic check for any provider
- Removed `active_model` Ollama branch — now generic

### 2. RAG Engine (`backend/services/rag_engine.py`)
- Stripped Ollama completely
- Provider selection delegates to `providers.get_chat_model(settings)`
- Slang map extracted to `backend/data/slang_map.py`
- `_initialize()` gracefully handles missing API keys (prints warning, sets ready=false)
- Imports use absolute `backend.` prefix for module consistency

### 3. Provider Layer (`backend/services/providers.py`)
- ABC base class `LLMProvider` with `get_chat_model()` contract
- 4 concrete implementations — each creating the correct LangChain chat model
- `PROVIDER_MAP` dict + `get_provider(name)` factory function
- Extensible: add a new provider by subclassing and registering

### 4. API Layer (`backend/api/`)
- `models.py` — all Pydantic models in one place, no inline definitions
- `routes.py` — all endpoints, no app initialization
- RAG engine initialized in background thread (non-blocking startup)
- No duplicate `/api/`-prefixed endpoints (the old api.py had both `/chat` and `/api/chat`)
- Clean SSE streaming with proper event encoding

### 5. Frontend (`web-app/vite.config.js`)
- Added dev proxy for `/chat`, `/health`, `/sources`, `/provider` → backend on port 8000
- No more hardcoded API URLs needed in dev mode

### 6. Requirements (`requirements.txt`)
- All versions changed from `==x.y.z` pins to `>=x.y.z` for compatibility
- Added `sentence-transformers`, `langchain-openai`, `langchain-anthropic`, `langchain-google-genai`
- Removed `streamlit`, `langchain-ollama`
- Removed duplicate requirements files

---

## Build Verification

| Check | Result |
|-------|--------|
| Python imports | ✅ All modules resolve |
| FastAPI startup | ✅ Server starts on port 8000 |
| `/health` endpoint | ✅ Returns JSON status |
| `/provider` endpoint | ✅ Returns provider config |
| Frontend build | ✅ 0 errors, 2405 modules, 3.12s |
| Docker build | ✅ Multi-stage, 27s |
| With dummy API key | ✅ Engine initializes as ready |

Note: `sentence-transformers` (~80MB) is only needed when `RAG_ENABLED=true` and `SKIP_EMBEDDINGS=false` with an existing ChromaDB. Without it, the engine falls back to direct LLM mode.

---

## Environment Variables (Full Reference)

| Variable             | Default                  | Required | Description                              |
|----------------------|--------------------------|----------|------------------------------------------|
| `LLM_PROVIDER`       | `groq`                   | Yes      | One of: groq, openai, anthropic, gemini  |
| `GROQ_API_KEY`       | —                        | If Groq  | Groq Cloud API key                       |
| `GROQ_MODEL`         | `llama-3.3-70b-versatile`| No       | Groq model override                      |
| `OPENAI_API_KEY`     | —                        | If OpenAI| OpenAI API key                            |
| `OPENAI_MODEL`       | `gpt-4o-mini`            | No       | OpenAI model override                    |
| `ANTHROPIC_API_KEY`  | —                        | If Anthropic| Anthropic API key                     |
| `ANTHROPIC_MODEL`    | `claude-3-5-haiku-latest`| No       | Anthropic model override                 |
| `GEMINI_API_KEY`     | —                        | If Gemini | Google Gemini API key                   |
| `GEMINI_MODEL`       | `gemini-2.0-flash`       | No       | Gemini model override                    |
| `RAG_ENABLED`        | `true`                   | No       | Enable/disable RAG retrieval             |
| `SKIP_EMBEDDINGS`    | `false`                  | No       | Skip embedding model loading             |
| `ALLOWED_ORIGINS`    | `localhost:5173, ...`    | No       | CORS origins (comma-separated)           |
| `VITE_API_URL`       | `http://localhost:8000`  | No       | Frontend-side API URL                    |

---

## Files Changed (Summary)

### New Files (15)
- `backend/__init__.py`
- `backend/main.py`
- `backend/config.py`
- `backend/api/__init__.py`
- `backend/api/models.py`
- `backend/api/routes.py`
- `backend/services/__init__.py`
- `backend/services/providers.py`
- `backend/services/rag_engine.py`
- `backend/data/__init__.py`
- `backend/data/slang_map.py`
- `scripts/__init__.py`
- `scripts/ingest.py`
- `render.yaml`
- `KRMAI-TECHNICAL-GUIDE.md`

### Modified Files (8)
- `README.md` — updated architecture, removed Render-specific, added tech guide link
- `requirements.txt` — flexible versions, added providers, removed streamlit/ollama
- `.env.example` — 4 provider keys, cleaner layout
- `.gitignore` — `**/__pycache__/`, `chroma_db/`, cleaned up
- `.dockerignore` — sync with gitignore
- `Dockerfile` — simplified, references `backend.main:app`
- `Procfile` — updated uvicorn path
- `web-app/vite.config.js` — added dev proxy

### Removed Files (36)
- `api.py`, `api/__init__.py`, `api_minimal.py`, `api_vercel.py`
- `config.py`, `rag_engine.py`, `ingest.py`, `app.py`, `push.py`
- `test_api.py`, `test_system.py`
- `start.sh`, `start_ollama_local.bat`, `start_groq_api.bat`
- `vercel.json` (root + web-app)
- `deploy-*.sh` (5 files)
- `requirements-minimal.txt`, `requirements-vercel.txt`
- `DEPLOYMENT_GUIDE.md`, `DEPLOYMENT_NON_VERCEL.md`, `DEPLOYMENT_SUMMARY.md`
- `VERCEL_DEPLOYMENT.md`, `VERCEL_DEPLOYMENT_GUIDE.md`
- `RENDER_DEPLOYMENT_CHECKLIST.md`, `SKIP_EMBEDDINGS.md`
- `FIX_PLAN.md`, `ISSUES_FOUND.md`, `SYSTEM_ARCHITECTURE.md`
- `log.txt`, `log_app.txt`, `status.txt`, `status2.txt`
- `web-app/nohup.out`, `web-app/vite.log`
