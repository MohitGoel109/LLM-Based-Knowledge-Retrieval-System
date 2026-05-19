# KRMAI — Technical Guide

## How to Run

### Prerequisites

- Python 3.11+
- Node.js 22+
- An API key from one of: [NVIDIA NIM](https://build.nvidia.com/explore/discover), [OpenAI](https://platform.openai.com), [Anthropic](https://console.anthropic.com), or [Google Gemini](https://aistudio.google.com)

### Step 1: Environment Setup

```bash
cp .env.example .env
```

Edit `.env` — set `LLM_PROVIDER` to your choice and fill in the matching API key:

```env
LLM_PROVIDER=nim
NIM_API_KEY=nvapi-your_actual_key
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

## Migration: Groq → NVIDIA NIM

This section documents the complete migration from Groq to NVIDIA NIM as the default LLM provider.

### Why NIM?

| Feature         | Groq                | NVIDIA NIM                  |
|-----------------|---------------------|-----------------------------|
| Default model   | llama-3.3-70b       | deepseek-ai/deepseek-v4-flash |
| Auth            | API key (Groq Console) | API key (NVIDIA Build)      |
| Client          | `langchain-groq`    | `langchain-openai` (OpenAI-compatible) |
| Free tier       | Rate-limited        | Free credits on signup       |

### What Changed in Each File

| File | Change |
|------|--------|
| `backend/config.py` | Replaced `groq_api_key`/`groq_model` → `nim_api_key`/`nim_base_url`/`nim_model`. Default `LLM_PROVIDER` changed from `groq` to `nim`. `SUPPORTED_PROVIDERS` updated. |
| `backend/services/providers.py` | Removed `GroqProvider` class + `langchain_groq` import. Added `NIMProvider` that uses `ChatOpenAI` with `base_url=settings.nim_base_url`. Provider map entry `"groq"` → `"nim"`. |
| `backend/services/rag_engine.py` | No changes needed — provider-agnostic via `get_chat_model()`. |
| `.env.example` | `GROQ_API_KEY`/`GROQ_MODEL` sections removed. `NIM_API_KEY`/`NIM_BASE_URL`/`NIM_MODEL` added as primary section. |
| `requirements.txt` | `langchain-groq` removed. NIM needs no separate package (uses `langchain-openai` for its OpenAI-compatible API). |
| `README.md` | All references: Groq → NVIDIA NIM. Default model updated. Provider comparison table updated. |
| `KRMAI-TECHNICAL-GUIDE.md` | (this file) fully updated. |
| `start.sh` | Default provider `groq` → `nim`. Placeholder key message updated. |
| `start.bat` | Same as start.sh |
| `web-app/src/components/LandingPage.jsx` | "Groq / Ollama" badge → "NVIDIA NIM". |
| `web-app/src/components/UpdatesFAQPage.jsx` | FAQ answer about model updated: Groq → NVIDIA NIM. |

### Streaming Check

Streaming is **fully functional** — confirmed:

- ✅ `/chat/stream` route uses `StreamingResponse` with `media_type="text/event-stream"`
- ✅ `query_stream_events()` in `rag_engine.py` iterates `self.llm.stream()` token-by-token
- ✅ `ChatOpenAI.stream()` sends `stream=True` to the NIM API internally
- ✅ Chunks are converted via `_as_text()` and emitted as SSE `data: {json}\n\n`
- ✅ Done event with source documents is sent after stream completes

No changes to streaming were needed — the existing LangChain-based streaming works natively with `ChatOpenAI` pointed at NIM's OpenAI-compatible endpoint.

---

## Provider Abstraction

| Provider    | Class              | LangChain Package        | Env Key               |
|-------------|--------------------|--------------------------|-----------------------|
| NVIDIA NIM  | `NIMProvider`      | `langchain-openai`       | `NIM_API_KEY`         |
| OpenAI      | `OpenAIProvider`   | `langchain-openai`       | `OPENAI_API_KEY`      |
| Anthropic   | `AnthropicProvider`| `langchain-anthropic`    | `ANTHROPIC_API_KEY`   |
| Gemini      | `GeminiProvider`   | `langchain-google-genai` | `GEMINI_API_KEY`      |

Set `LLM_PROVIDER=nim` (or `openai` / `anthropic` / `gemini`) and only your chosen provider's key is required.

---

## Architecture

```
backend/
  main.py           — FastAPI app, CORS, lifespan, SPA catch-all
  config.py         — Settings with NIM + 3 other providers
  api/
    models.py       — ChatRequest, ChatResponse, SourceDoc, HealthResponse
    routes.py       — /health, /provider, /chat, /chat/stream, /sources
  services/
    rag_engine.py   — RAG orchestration, prompts, creator detection
    providers.py    — Abstract LLM provider layer (NIM/OpenAI/Anthropic/Gemini)
  data/
    slang_map.py    — 300+ slang/Hinglish mappings with expand_slang()
web-app/            — React + Vite frontend
scripts/
  ingest.py         — Vector store builder
```

---

## Environment Variables (Full Reference)

| Variable             | Default                                             | Required    | Description                              |
|----------------------|-----------------------------------------------------|-------------|------------------------------------------|
| `LLM_PROVIDER`       | `nim`                                               | Yes         | One of: nim, openai, anthropic, gemini   |
| `NIM_API_KEY`        | —                                                   | If NIM      | NVIDIA NIM API key (nvapi-...)           |
| `NIM_BASE_URL`       | `https://integrate.api.nvidia.com/v1`               | No          | NVIDIA NIM API base URL                  |
| `NIM_MODEL`          | `deepseek-ai/deepseek-v4-flash`                     | No          | NVIDIA NIM model ID                      |
| `OPENAI_API_KEY`     | —                                                   | If OpenAI   | OpenAI API key                           |
| `OPENAI_MODEL`       | `gpt-4o-mini`                                       | No          | OpenAI model override                    |
| `ANTHROPIC_API_KEY`  | —                                                   | If Anthropic| Anthropic API key                        |
| `ANTHROPIC_MODEL`    | `claude-3-5-haiku-latest`                           | No          | Anthropic model override                 |
| `GEMINI_API_KEY`     | —                                                   | If Gemini   | Google Gemini API key                    |
| `GEMINI_MODEL`       | `gemini-2.0-flash`                                  | No          | Gemini model override                    |
| `RAG_ENABLED`        | `true`                                              | No          | Enable/disable RAG retrieval             |
| `SKIP_EMBEDDINGS`    | `false`                                             | No          | Skip embedding model loading             |
| `ALLOWED_ORIGINS`    | `localhost:5173, ...`                               | No          | CORS origins (comma-separated)           |
| `VITE_API_URL`       | `http://localhost:8000`                             | No          | Frontend-side API URL                    |
