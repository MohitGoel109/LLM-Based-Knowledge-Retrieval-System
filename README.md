# KRMAI — KR Mangalam University AI Assistant

AI-powered knowledge retrieval system for KR Mangalam University students. Uses RAG (Retrieval-Augmented Generation) with ChromaDB vector store and a configurable LLM provider (NVIDIA NIM, OpenAI, Anthropic, Gemini).

## Architecture

```
├── backend/
│   ├── main.py            FastAPI app entry point
│   ├── config.py          Environment-based settings
│   ├── api/
│   │   ├── models.py      Pydantic request/response schemas
│   │   └── routes.py      API endpoints (health, chat, stream)
│   ├── services/
│   │   ├── rag_engine.py  RAG orchestration + prompt logic
│   │   └── providers.py   LLM provider abstraction layer
│   └── data/
│       └── slang_map.py   Slang/abbreviation expansion engine
├── web-app/               React + Vite frontend
├── scripts/
│   └── ingest.py          Document ingestion into ChromaDB
├── data/                  Source documents (PDF, TXT, DOCX)
├── chroma_db/             Vector store (auto-generated)
├── requirements.txt
├── Dockerfile
└── Procfile
```

📘 **Full technical reference**: [KRMAI-TECHNICAL-GUIDE.md](./KRMAI-TECHNICAL-GUIDE.md)

## Quick Start

### 1. Set up API key

Copy `.env.example` to `.env` and set at least one API key:

```bash
cp .env.example .env
```

Edit `.env` to set your chosen provider key:

```env
LLM_PROVIDER=nim
NIM_API_KEY=nvapi-your_key_here
```

**Supported providers:**
| Provider    | Env Variable         | Model Env Variable    | Default Model                   |
|-------------|----------------------|-----------------------|---------------------------------|
| NVIDIA NIM  | `NIM_API_KEY`        | `NIM_MODEL`           | `deepseek-ai/deepseek-v4-flash` |
| OpenAI      | `OPENAI_API_KEY`     | `OPENAI_MODEL`        | `gpt-4o-mini`                   |
| Anthropic   | `ANTHROPIC_API_KEY`  | `ANTHROPIC_MODEL`     | `claude-3-5-haiku-latest`       |
| Gemini      | `GEMINI_API_KEY`     | `GEMINI_MODEL`        | `gemini-2.0-flash`              |

### 2. Ingest documents (optional for RAG)

```bash
pip install -r requirements.txt
python scripts/ingest.py
```

Place PDF, TXT, or DOCX files in `data/` first.

### 3. Start the backend

```bash
uvicorn backend.main:app --reload --port 8000
```

### 4. Start the frontend

```bash
cd web-app
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints

| Method | Path            | Description                          |
|--------|-----------------|--------------------------------------|
| GET    | `/health`       | System health and provider status    |
| GET    | `/provider`     | Provider configuration details       |
| POST   | `/chat`         | Send a message, get answer + sources |
| POST   | `/chat/stream`  | SSE streaming chat endpoint          |
| GET    | `/sources`      | Available data sources               |

### Chat Request

```json
{
  "message": "What is the BTech CSE fee structure?",
  "history": [{"role": "user", "content": "previous question"}]
}
```

### Chat Response

```json
{
  "answer": "The BTech CSE semester fee is Rs 1,42,500...",
  "sources": [{"source": "fee-structure.txt", "page": 1}]
}
```

## Environment Variables

| Variable             | Default                                             | Description                    |
|----------------------|-----------------------------------------------------|--------------------------------|
| `LLM_PROVIDER`       | `nim`                                               | Provider to use                |
| `NIM_API_KEY`        | —                                                   | NVIDIA NIM API key             |
| `NIM_BASE_URL`       | `https://integrate.api.nvidia.com/v1`               | NVIDIA NIM API base URL        |
| `NIM_MODEL`          | `deepseek-ai/deepseek-v4-flash`                     | NVIDIA NIM model               |
| `OPENAI_API_KEY`     | —                                                   | OpenAI API key                 |
| `ANTHROPIC_API_KEY`  | —                                                   | Anthropic API key              |
| `GEMINI_API_KEY`     | —                                                   | Google Gemini API key          |
| `RAG_ENABLED`        | `true`                                              | Enable/disable RAG retrieval   |
| `SKIP_EMBEDDINGS`    | `false`                                             | Skip embedding model loading   |
| `ALLOWED_ORIGINS`    | `localhost:5173, ...`                               | CORS origins (comma-separated) |
| `VITE_API_URL`       | `http://localhost:8000`                             | Frontend API URL               |

## Provider Comparison

| Feature         | NVIDIA NIM      | OpenAI         | Anthropic      | Gemini         |
|----------------|-----------------|----------------|----------------|----------------|
| Free tier      | Yes (credits)   | No             | No             | Yes (limited)  |
| Speed          | Fast            | Fast           | Moderate       | Fast           |
| Context window | 128K tokens     | 128K tokens    | 200K tokens    | 1M tokens      |
| Best for       | Fast RAG apps   | General purpose| Long documents | Multimodal     |

## Deployment

### Option 1: Docker (universal)

```bash
docker build -t krmai .
docker run -p 8000:8000 -e NIM_API_KEY=nvapi-... krmai
```

### Option 2: Direct (any VPS / cloud shell)

```bash
pip install -r requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Option 3: Your own platform

Set env vars (`NIM_API_KEY`, `LLM_PROVIDER`) on Railway, Fly.io, Coolify, Render, or any VPS.
