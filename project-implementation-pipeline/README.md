# 🧠 Zeno — RAG Implementation Pipeline

## Project Overview

**Zeno** is an LLM-Based Knowledge Retrieval System that uses **Retrieval-Augmented Generation (RAG)** to provide accurate, context-grounded answers to college students' queries about fees, placements, hostel rules, scholarships, and more.

Instead of relying solely on the LLM's training data, Zeno retrieves relevant document chunks from a local vector database and feeds them as context, ensuring factual and hallucination-free responses.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    React + Vite + TailwindCSS                   │
│                     (http://localhost:5173)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP POST /chat
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FastAPI BACKEND                          │
│                      (http://localhost:8000)                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     RAG ENGINE                            │   │
│  │                                                           │   │
│  │  1. Slang Expansion  →  Clean user query                  │   │
│  │  2. Retriever        →  Find top-k relevant chunks        │   │
│  │  3. Prompt Builder   →  Context + History + Question       │   │
│  │  4. LLM Inference    →  Generate grounded answer           │   │
│  │  5. Response          →  Answer + Source citations          │   │
│  └──────────────┬───────────────────┬────────────────────────┘   │
│                 │                   │                             │
│                 ▼                   ▼                             │
│  ┌──────────────────┐   ┌────────────────────┐                   │
│  │    ChromaDB       │   │   Ollama (Local)    │                  │
│  │  Vector Database  │   │   llama3.2:3b       │                  │
│  │  (Embeddings)     │   │   (localhost:11434) │                  │
│  └──────────────────┘   └────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 File Structure & Responsibilities

```
LLM-Based-Knowledge-Retrieval-System/
│
├── data/                          # 📄 Source documents (knowledge base)
│   ├── anti_ragging_policy.txt
│   ├── fee_structure.txt
│   ├── hostel_rules.txt
│   ├── placement_cell_guidelines.txt
│   ├── scholarship_info.txt
│   └── sample_policy.txt
│
├── chroma_db/                     # 🗄️ ChromaDB vector store (auto-generated)
│
├── ingest.py                      # 📥 Document ingestion pipeline
├── rag_engine.py                  # 🧠 Core RAG engine (retrieval + generation)
├── api.py                         # 🔌 FastAPI REST API server
├── app.py                         # 🖥️ Streamlit UI (alternative frontend)
│
├── web-app/                       # ⚛️ React frontend
│   ├── src/
│   │   ├── App.jsx                # Main chat component
│   │   ├── index.css              # Global styles (Tailwind)
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── project-implementation-pipeline/  # 📋 This documentation
│
├── requirements.txt               # Python dependencies
├── start.sh                       # One-click launcher
└── README.md                      # Project README
```

---

## 🔄 The RAG Pipeline — Step by Step

### Stage 1: Document Ingestion (`ingest.py`)

```
Raw Documents (.txt, .pdf, .docx)
        │
        ▼
   ┌─────────┐
   │  LOAD    │  PyPDFLoader / TextLoader / Docx2txtLoader
   └────┬─────┘
        │
        ▼
   ┌─────────┐
   │  CHUNK   │  RecursiveCharacterTextSplitter
   │          │  chunk_size=1000, overlap=200
   └────┬─────┘
        │
        ▼
   ┌─────────┐
   │ EMBED    │  sentence-transformers/all-MiniLM-L6-v2
   │          │  384-dimensional vectors
   └────┬─────┘
        │
        ▼
   ┌─────────┐
   │  STORE   │  ChromaDB (persistent, local)
   └──────────┘
```

**What happens:**
1. All documents in `data/` are loaded based on their file type
2. Each document is split into overlapping chunks of ~1000 characters
3. Each chunk is converted into a 384-dimensional embedding vector
4. Vectors are stored in ChromaDB for fast similarity search

### Stage 2: Query Processing (`rag_engine.py`)

```
User Question: "what's the hostel fee bro?"
        │
        ▼
   ┌──────────────┐
   │ SLANG EXPAND │  "what is the hostel fee?"
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  RETRIEVE    │  ChromaDB similarity search (top-3 chunks)
   │              │  Uses same embedding model as ingestion
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ BUILD PROMPT │  System prompt + Chat history +
   │              │  Retrieved context + User question
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  LLM INVOKE  │  Ollama → llama3.2:3b (local inference)
   │              │  Generates grounded answer
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │   RESPONSE   │  Answer text + Source document citations
   └──────────────┘
```

**Key Design Decisions:**

| Decision | Choice | Why |
|----------|--------|-----|
| Embedding Model | `all-MiniLM-L6-v2` | Fast, small (80MB), great for semantic search |
| Vector DB | ChromaDB | Simple, local, persistent, no server needed |
| LLM | Ollama + llama3.2:3b | Fully offline, no API keys, 3B params is fast on CPU |
| Chunking | 1000 chars, 200 overlap | Balances context length vs. retrieval precision |
| Top-K | 3 documents | Enough context without overwhelming the LLM |
| Slang Map | 40+ patterns | Students use informal language; clean queries = better retrieval |

### Stage 3: API Layer (`api.py`)

```
React Frontend (port 5173)
        │
        │  POST /chat  { message, history }
        ▼
   ┌──────────┐
   │ FastAPI   │  Validates request → calls RAG engine
   │          │  Returns { answer, sources[] }
   └──────────┘
        │
        │  GET /health  → { db: true, ollama: true, ready: true }
        │
```

**Endpoints:**
- `GET /health` — System status check
- `POST /chat` — Send question, get RAG-powered answer with source citations

### Stage 4: Frontend (`web-app/`)

```
┌──────────────────────────────────────────────┐
│  React + Vite + TailwindCSS v4               │
│                                              │
│  ┌────────┐  ┌───────────────────────────┐   │
│  │Sidebar │  │  Chat Interface            │   │
│  │        │  │                            │   │
│  │ KB docs│  │  [Hero] → Suggested Qs     │   │
│  │ Status │  │  [Chat] → Messages + Src   │   │
│  │ New    │  │  [Input] → Send query      │   │
│  └────────┘  └───────────────────────────┘   │
└──────────────────────────────────────────────┘
```

**Features:**
- Dark theme with gradient accents
- Real-time health check indicator
- Markdown rendering for AI responses
- Source citation badges
- Suggested questions for quick start
- Mobile-responsive with sidebar toggle
- Conversation history sent to backend for context

---

## 🚀 How to Run

```bash
# One-command launch (starts both API + frontend):
./start.sh

# Or manually:

# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start FastAPI backend
HF_HUB_OFFLINE=1 python -m uvicorn api:app --host 0.0.0.0 --port 8000

# Terminal 3: Start React frontend
cd web-app && npm run dev
```

**First-time setup:**
```bash
# Install Python deps
pip install -r requirements.txt

# Install frontend deps
cd web-app && npm install

# Pull the LLM model
ollama pull llama3.2:3b

# Ingest documents into vector DB
python ingest.py
```

---

## 🔧 Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **LLM** | Ollama + llama3.2:3b | Local language model inference |
| **Embeddings** | sentence-transformers/all-MiniLM-L6-v2 | Document & query vectorization |
| **Vector DB** | ChromaDB | Persistent similarity search |
| **Orchestration** | LangChain | RAG pipeline, prompts, chains |
| **Backend** | FastAPI + Uvicorn | REST API server |
| **Frontend** | React 19 + Vite 7 + Tailwind CSS 4 | Modern web interface |
| **Alt Frontend** | Streamlit | Quick prototyping UI |

---

## 🧪 Conversation Flow Example

```
Student: "yo what's the hostel fee for single room?"
                    ↓
Slang Expansion:   "what is the hostel fee for single room?"
                    ↓
ChromaDB Search:   Retrieves chunks from hostel_rules.txt & fee_structure.txt
                    ↓
LLM Prompt:        Context + Question → llama3.2:3b
                    ↓
Response:          "The single room hostel fee is Rs. 15,000 per semester."
                    Sources: hostel_rules.txt, fee_structure.txt
```

---

*Built by Team — LLM-Based Knowledge Retrieval System*
