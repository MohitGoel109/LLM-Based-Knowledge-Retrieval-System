<div align="center">

# 🎓 KRMAI — LLM-Based Knowledge Retrieval System

**A fully local, AI-powered chatbot for KR Mangalam University students — instant answers about fees, admissions, hostels, placements, scholarships, and more, grounded in official university documents.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Ollama](https://img.shields.io/badge/Ollama-qwen2.5:3b-black?logo=ollama)](https://ollama.com)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

<div align="center">

| Landing Page | Chat Interface |
|:---:|:---:|
| ![Landing Page](assets/landing_page.png) | ![Chat Interface](assets/chat_interface.png) |

</div>

---

## 📖 What It Does

KRMAI uses **Retrieval-Augmented Generation (RAG)** to answer student questions by grounding every response in official university documents. Instead of relying on an LLM's training data (which hallucinate), it:

1. **Ingests** 13 official KRMU documents (fees, placements, hostels, scholarships, etc.) into a vector database
2. **Expands slang** — converts 200+ abbreviations, Gen Z slang, Hindi/Hinglish terms to clean English before searching (e.g., `"bhai fees kitni h btw"` → `"fees how much is by the way"`)
3. **Retrieves** the 4 most relevant document chunks via cosine similarity search in ChromaDB
4. **Generates** a grounded answer using a local Ollama LLM (qwen2.5:3b) — streamed token-by-token via Server-Sent Events for real-time display
5. **Cites sources** — every answer shows which document and page the information came from

Everything runs **100% locally** — no cloud APIs, no data leaves your machine. Privacy-first.

---

## 🛠 Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **Python 3.10+** | Backend language |
| **FastAPI** | REST API (`/chat`, `/chat/stream`, `/health`) |
| **Uvicorn** | ASGI server |
| **LangChain** (core, community, huggingface, chroma, ollama, text_splitters) | RAG orchestration framework |
| **ChromaDB** | Vector database with HNSW indexing |
| **sentence-transformers** (all-MiniLM-L6-v2) | Local embedding model (384-dim vectors) |
| **Ollama** + **qwen2.5:3b** | Local LLM runtime + model (~3GB) |
| **Streamlit** | Alternative legacy UI (not used in production) |
| **PyPDF** / **docx2txt** | PDF and DOCX document loaders |
| **Pydantic** | Request/response validation |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.4 | UI library |
| **Vite** | 7.3.1 | Build tool & dev server |
| **Tailwind CSS** | 4.2.1 | Utility-first CSS framework |
| **Framer Motion** | 12.34.3 | Page transitions & animations |
| **Lucide React** | 0.575.0 | Icon library |
| **react-markdown** + **remark-gfm** | 10.1.0 / 4.0.1 | Markdown rendering for bot responses |
| **Web Speech API** | Browser-native | Voice input (Chrome/Edge) |

### Infrastructure

| Component | Port | Description |
|---|---|---|
| Ollama Server | `localhost:11434` | Local LLM inference |
| FastAPI Backend | `localhost:8000` | REST API |
| Vite Dev Server | `localhost:5173` | React frontend |

---

## 📁 Project Structure

```
KRMAI/
├── api.py                          # FastAPI server — /chat, /chat/stream, /health endpoints
├── rag_engine.py                   # RAG engine — retrieval, slang expansion, LLM, streaming
├── ingest.py                       # Document ingestion — load → chunk → embed → ChromaDB
├── app.py                          # Streamlit UI (legacy alternative interface)
├── test_system.py                  # Comprehensive test suite (20 tests across 7 categories)
├── start.sh                        # Linux/macOS launcher (Ollama → Backend → Frontend)
├── start.bat                       # Windows launcher with interactive menu
├── requirements.txt                # Python dependencies
├── KRMAI_Technical_Guide.txt       # Complete technical documentation
├── For running the application.txt # Quick-start instructions
│
├── data/                           # 📚 Knowledge base (13 official KRMU documents)
│   ├── krmu_academic_calendar.txt
│   ├── krmu_admissions.txt
│   ├── krmu_anti_ragging.txt
│   ├── krmu_bus_routes.txt
│   ├── krmu_campus_facilities.txt
│   ├── krmu_clubs_societies.txt
│   ├── krmu_code_of_conduct.txt
│   ├── krmu_fee_structure.txt
│   ├── krmu_hostel.txt
│   ├── krmu_placements.txt
│   ├── krmu_scholarships.txt
│   ├── krmu_soet_overview.txt
│   └── krmu_student_welfare.txt
│
├── chroma_db/                      # ChromaDB persistent storage (auto-generated)
│
├── evaluation/                     # Model evaluation results
│   ├── test_results.json           # Test suite output
│   ├── benchmark_comparison.png    # Qwen vs alternatives
│   ├── radar_comparison.png        # Multi-metric radar chart
│   ├── parameter_efficiency.png    # Model size vs performance
│   └── feature_heatmap.png         # Feature comparison heatmap
│
├── project-implementation-pipeline/
│   ├── README.md                   # Pipeline documentation
│   └── pipeline-visualization.html # Interactive pipeline diagram
│
├── assets/                         # Screenshots & media
│   ├── landing_page.png
│   └── chat_interface.png
│
└── web-app/                        # ⚛️ React frontend
    ├── index.html                  # HTML entry — loads Google Fonts (DM Sans, DM Serif Display)
    ├── package.json                # Node.js dependencies
    ├── vite.config.js              # Vite config with React + Tailwind plugins
    └── src/
        ├── main.jsx                # React entry — wraps App in ThemeProvider
        ├── App.jsx                 # Root component — view routing (landing/chat/settings/projects/updates)
        ├── index.css               # Global CSS — theme variables, animations, glassmorphism
        ├── context/
        │   └── ThemeContext.jsx     # Dark/light theme context (persisted in localStorage)
        ├── data/
        │   └── constants.js        # Category data, suggestion prompts, FAQ cards
        └── components/
            ├── LandingPage.jsx         # Hero section, animated stats, feature cards, CTA
            ├── ChatInterface.jsx       # Main chat UI — messages, input, voice, SSE streaming
            ├── Sidebar.jsx             # Left nav — category prompts, quick suggestions
            ├── HistorySidebar.jsx       # Right panel — chat session history (localStorage)
            ├── ChatHeader.jsx          # Top bar — search, notifications, navigation
            ├── MessageBubble.jsx       # Message display (user blue bubble, bot dark card)
            ├── MarkdownComponents.jsx  # Custom markdown renderers for bot responses
            ├── SourceBadge.jsx         # Source citation badge component
            ├── KRMAILogo.jsx           # Animated graduation cap logo SVG
            ├── BackgroundEffect.jsx    # Glass orb + aurora background animations
            ├── SettingsPage.jsx        # Theme toggle, voice language, data clearing
            ├── StudentProjectsPage.jsx # Student projects showcase page
            ├── UpdatesFAQPage.jsx      # Updates feed + FAQ accordion
            └── LoadingDots.jsx         # Loading dots animation
```

---

## ⚙️ How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  University      │     │  Document        │     │  Text Chunking   │
│  Documents       │────▶│  Loaders         │────▶│  (1500 chars,    │
│  (data/*.txt)    │     │  (PDF/DOCX/TXT)  │     │   300 overlap)   │
└─────────────────┘     └─────────────────┘     └────────┬─────────┘
                                                         │
                         ┌───────────────────────────────┘
                         ▼
              ┌─────────────────────┐     ┌──────────────────┐
              │  Embedding Model    │────▶│  ChromaDB         │
              │  all-MiniLM-L6-v2  │     │  (HNSW Index,     │
              │  (384-dim vectors)  │     │   chroma_db/)     │
              └─────────────────────┘     └────────┬─────────┘
                                                   │
     ┌─── Query Flow ─────────────────────────────┘
     │
     ▼
┌──────────────┐   ┌──────────────┐   ┌───────────┐   ┌──────────────┐
│ Slang        │──▶│ Similarity   │──▶│ Prompt    │──▶│ Ollama LLM   │
│ Expansion    │   │ Search (k=4) │   │ Builder   │   │ qwen2.5:3b   │
│ (200+ rules) │   │              │   │ + History │   │ (Streaming)  │
└──────────────┘   └──────────────┘   └───────────┘   └──────┬───────┘
                                                             │
                    ┌────────────────────────────────────────┘
                    ▼
         ┌────────────────────┐     ┌────────────────────┐
         │ FastAPI Backend    │────▶│ React Frontend     │
         │ POST /chat/stream  │ SSE │ Real-time display  │
         │ (localhost:8000)   │     │ (localhost:5173)    │
         └────────────────────┘     └────────────────────┘
```

### Step-by-Step Flow

1. **Ingestion** (`ingest.py`): Documents from `data/` are loaded, split into chunks of 1500 characters (with 300-character overlap using `RecursiveCharacterTextSplitter`), embedded with `all-MiniLM-L6-v2`, and stored in ChromaDB at `chroma_db/`.

2. **Query Processing** (`rag_engine.py`): When a student asks a question:
   - **Slang expansion**: 200+ regex patterns normalize informal text (Gen Z, Hinglish, abbreviations)
   - **Retrieval**: The cleaned query is embedded and the 4 most similar chunks are found via cosine similarity
   - **Prompt construction**: Retrieved context + chat history (last 4 messages, truncated to 200 chars each) + question are assembled into a structured prompt
   - **LLM inference**: Ollama runs qwen2.5:3b locally with optimized parameters (`temperature=0.3`, `top_k=20`, `top_p=0.8`, `num_ctx=2048`, `num_predict=1024`)
   - **`<think>` stripping**: Qwen model's internal reasoning blocks are removed before streaming

3. **API Layer** (`api.py`): FastAPI exposes three endpoints:
   - `GET /health` — Component status (DB, Ollama, ready)
   - `POST /chat` — Synchronous response with answer + sources
   - `POST /chat/stream` — SSE streaming (token-by-token with final source citations)

4. **Frontend** (`web-app/`): React app with:
   - Landing page with animated hero, feature cards, and CTA
   - Chat interface with real-time SSE streaming, voice input, markdown rendering
   - Session management in localStorage (save/load/delete, up to 20 sessions)
   - Dark/light theme with CSS variables and smooth transitions
   - Source citation badges on every response

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** (for the React frontend)
- **Ollama** — Install from [ollama.com](https://ollama.com)
- At least **8GB RAM** (16GB recommended)

### Option 1: One-Command Launch (Linux/macOS)

```bash
# Clone and enter the project
git clone https://github.com/MohitGoel109/LLM-Based-Knowledge-Retrieval-System.git
cd LLM-Based-Knowledge-Retrieval-System

# This handles everything: Ollama, model pull, dependencies, ingestion, backend + frontend
./start.sh
```

The script will:
1. ✅ Check/start Ollama
2. ✅ Pull `qwen2.5:3b` model if needed
3. ✅ Install Python dependencies
4. ✅ Run document ingestion if `chroma_db/` doesn't exist
5. ✅ Launch FastAPI on `localhost:8000` + React on `localhost:5173`

### Option 2: Manual Setup

```bash
# 1. Start Ollama and pull the model
ollama serve                     # Start Ollama server
ollama pull qwen2.5:3b           # Download the LLM (~3GB, first time only)

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Ingest documents into ChromaDB (first time or after updating data/)
python ingest.py

# 4. Start the backend API
python api.py                    # Runs on http://localhost:8000

# 5. Start the frontend (in a new terminal)
cd web-app
npm install                      # First time only
npm run dev                      # Runs on http://localhost:5173
```

### Option 3: Windows

```batch
# Run the interactive launcher
start.bat
```

This provides a menu to: (1) Ingest documents, (2) Run Streamlit UI, (3) Exit.

---

## 🗣 Slang & Abbreviation Expansion

KRMAI understands the way students actually type. The engine has **200+ regex rules** across 9 categories that normalize informal queries before retrieval:

<details>
<summary><strong>Click to expand all categories</strong></summary>

| Category | Examples |
|---|---|
| **Single-letter shortcuts** | `u` → you, `r` → are, `n` → and, `y` → why, `k` → ok |
| **Internet abbreviations** | `btw` → by the way, `idk` → I don't know, `tbh` → to be honest, `asap` → as soon as possible, `fyi` → for your information, `brb` → be right back, `omg` → oh my god |
| **Informal contractions** | `wanna` → want to, `gonna` → going to, `gotta` → got to, `kinda` → kind of, `lemme` → let me, `dunno` → don't know |
| **Gen Z slang** | `bussin` → really good, `sus` → suspicious, `no cap` → seriously, `slay` → amazing, `rizz` → charisma, `delulu` → delusional, `vibe check` → assessment |
| **Text abbreviations** | `pls`/`plz` → please, `thx` → thanks, `2day` → today, `2moro` → tomorrow, `gr8` → great, `l8r` → later |
| **Shorthand** | `uni` → university, `prof` → professor, `sem` → semester, `govt` → government, `dept` → department, `lib` → library |
| **Hindi / Hinglish** | `kya` → what is, `kab` → when is, `kahan` → where is, `kitna` → how much is, `padhai` → studies, `paisa` → money fees |
| **College-specific** | `kt` → backlog subject, `cgpa` → CGPA cumulative grade point average, `hod` → Head of Department, `placement` → placement cell campus recruitment |
| **Additional Gen Z** | `rizz` → charisma, `salty` → bitter or upset, `ghosting` → suddenly stopping communication, `yolo` → you only live once, `istg` → I swear to god |

</details>

---

## 🧪 Testing

A comprehensive test suite (`test_system.py`) with **20 tests across 7 categories**:

```bash
# Prerequisites: Ollama running + API running
python test_system.py
```

| Category | Tests | What's Verified |
|---|---|---|
| Infrastructure | 4 | Ollama running, model available, ChromaDB exists, API health |
| Query Quality | 8 | Bus routes, placements, fees, hostel, scholarships, anti-ragging, campus, top students |
| Multi-Topic | 2 | Combined queries (bus + placements, fees + hostel) |
| Edge Cases | 4 | Hinglish input, slang input, irrelevant queries, empty queries |
| Response Quality | 3 | Non-truncated responses, English-only output, source citations |
| Streaming | 1 | SSE endpoint delivers complete tokens + done event |
| Performance | 1 | Response time under 60 seconds |

Results are saved to `evaluation/test_results.json`.

---

## ⚠️ Current Limitations

| Limitation | Details |
|---|---|
| **No authentication** | No user login or access control — anyone on the network can use the API |
| **No persistent server-side history** | Chat history lives only in browser `localStorage`; backend keeps a 4-message in-memory buffer per request |
| **CORS allow-all** | `allow_origins=["*"]` — suitable for development only |
| **No rate limiting** | No protection against API abuse or runaway requests |
| **Single-machine ChromaDB** | Vector DB runs on local disk — not horizontally scalable |
| **CPU inference by default** | Ollama runs on CPU unless GPU is configured; response times can be 10–30s |
| **No document update pipeline** | Documents must be manually placed in `data/` and re-ingested with `python ingest.py` |
| **English-only responses** | Even for Hindi/Hinglish input, the LLM is instructed to respond only in English |
| **No production build** | Frontend runs via Vite dev server, not a production bundle |
| **Browser-dependent voice** | Web Speech API only works in Chrome/Edge |

---

## 🗺 Roadmap

Based on [`KRMAI_Technical_Guide.txt`](KRMAI_Technical_Guide.txt) future scope:

- [ ] 📸 Multi-modal support (images, campus maps, timetable screenshots)
- [ ] 🔐 User authentication (SSO with university portal)
- [ ] 🛡 Admin panel for managing knowledge base documents
- [ ] 📊 Analytics dashboard (most asked questions, usage stats)
- [ ] 🔄 Automatic document update pipeline (scrape university website)
- [ ] ⚡ GPU-accelerated inference for faster responses
- [ ] 🎯 Fine-tuning the LLM on university-specific data
- [ ] 🌐 Multi-language response support (Hindi output option)
- [ ] 🔗 Integration with university LMS (Moodle, Blackboard)
- [ ] 📱 Mobile app (React Native)
- [ ] 🔁 Feedback loop to improve answer quality over time
- [ ] 🐳 Docker containerization for easy deployment

---

## 👥 Contributors

<!-- Add your team members here -->
| Name | Role | GitHub |
|---|---|---|
| **Mohit Goel** | Lead Developer | [@MohitGoel109](https://github.com/MohitGoel109) |
| *Add team members* | — | — |

> 💡 *To add contributors, update this table with team member names and roles.*

---

## 📄 License

This project is licensed under the ISC License — see [package.json](web-app/package.json) for details.

---

<div align="center">

**Built with ❤️ for KR Mangalam University students**

*KRMAI — Because every student deserves instant, accurate answers.*

</div>
