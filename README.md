# KRMAI - LLM-Based Knowledge Retrieval System

Local AI assistant for KR Mangalam University students.

![Demo](assets/demo.gif)

## Project Summary

KRMAI is a fully local Retrieval-Augmented Generation (RAG) system for university FAQs. It ingests KRMU documents into ChromaDB and answers student questions through a FastAPI backend and React frontend.

The live query path in this repository is:

1. User asks a question from the React app.
2. FastAPI receives it on `/chat` or `/chat/stream`.
3. `rag_engine.py` expands slang/Hinglish terms, retrieves top-`k=4` chunks from ChromaDB, and prompts Ollama (`qwen2.5:3b`).
4. API returns answer plus unique source metadata.
5. Frontend renders markdown response and source badges.

## What The System Actually Does

Based on `rag_engine.py` and `api.py`:

- Uses local embeddings: `sentence-transformers/all-MiniLM-L6-v2`.
- Uses local vector store: ChromaDB at `chroma_db/`.
- Uses local LLM runtime: Ollama at `http://localhost:11434`.
- Uses local model: `qwen2.5:3b`.
- Supports non-stream and SSE streaming responses:
  - `POST /chat`
  - `POST /chat/stream`
- Maintains short conversation memory (last 4 messages / ~2 Q&A pairs) inside `RAGEngine`.
- Expands a large slang dictionary (`SLANG_MAP`) before retrieval.
- Returns source file metadata with each answer.

## Tech Stack (As Declared In Repo Files)

### Backend / Python (`requirements.txt`)

| Package | Version Spec In Repo |
|---|---|
| langchain | not pinned |
| langchain_community | not pinned |
| langchain_huggingface | not pinned |
| langchain_chroma | not pinned |
| langchain_ollama | not pinned |
| langchain_text_splitters | not pinned |
| langchain_core | not pinned |
| chromadb | not pinned |
| sentence-transformers | not pinned |
| streamlit | not pinned |
| pypdf | not pinned |
| docx2txt | not pinned |
| requests | not pinned |
| fastapi | not pinned |
| uvicorn | not pinned |
| pydantic | not pinned |
| pydantic-settings | not pinned |

### Frontend (`web-app/package.json`)

| Package | Version Spec In Repo |
|---|---|
| react | ^19.2.4 |
| react-dom | ^19.2.4 |
| vite | ^7.3.1 |
| @vitejs/plugin-react | ^5.1.4 |
| tailwindcss | ^4.2.1 |
| @tailwindcss/vite | ^4.2.1 |
| framer-motion | ^12.34.3 |
| lucide-react | ^0.575.0 |
| react-markdown | ^10.1.0 |
| remark-gfm | ^4.0.1 |

### Runtime/Model Constants From Code

| Item | Value |
|---|---|
| Ollama base URL | `http://localhost:11434` |
| LLM model | `qwen2.5:3b` |
| Embedding model | `sentence-transformers/all-MiniLM-L6-v2` |
| Retriever `k` | `4` |
| Chunk size | `1500` |
| Chunk overlap | `300` |

## Actual Project Structure (Generated From Current Directory)

The tree below is from a live `tree -a -L 5` run in this workspace (excluding `.git`, `node_modules`, `__pycache__`):

```text
.
├── api.py
├── app.py
├── assets
│   ├── chat_interface.png
│   └── landing_page.png
├── backend.log
├── backend_test.log
├── chroma_db
│   ├── 5891704a-f6a1-44b8-87c4-0288723367d7
│   │   ├── data_level0.bin
│   │   ├── header.bin
│   │   ├── length.bin
│   │   └── link_lists.bin
│   ├── chroma.sqlite3
│   └── ebf16809-62eb-434d-9b94-2004a98edfc5
│       ├── data_level0.bin
│       ├── header.bin
│       ├── length.bin
│       └── link_lists.bin
├── data
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
├── evaluation
│   ├── 01_benchmark_comparison.png
│   ├── 02_radar_qwen_vs_llama.png
│   ├── 03_parameter_efficiency.png
│   ├── 04_feature_comparison_heatmap.png
│   ├── benchmark_comparison.png
│   ├── feature_heatmap.png
│   ├── overall_ranking.png
│   ├── parameter_efficiency.png
│   ├── radar_comparison.png
│   └── test_results.json
├── For running the application.txt
├── .gitignore
├── ingest.py
├── KRMAI_Technical_Guide.txt
├── KRMU-BUS-ROUTE-AUG25.pdf
├── Mid term ppt format.pptx
├── mohit
│   ├── collegedekho_260303_155544.pdf
│   ├── collegedekho_260303_155611.pdf
│   ├── ingest2.py
│   └── KRMU Information Brochure.pdf
├── new_file.txt
├── nohup.out
├── ollama.log
├── project-implementation-pipeline
│   ├── pipeline-visualization.html
│   └── README.md
├── pull.log
├── rag_engine.py
├── RAG_Implementation_Plan.html
├── README.md
├── requirements.txt
├── start.bat
├── start.sh
├── streak_log.txt
├── test_system.py
├── .venv
│   ├── bin
│   │   ├── activate
│   │   ├── activate.csh
│   │   ├── activate.fish
│   │   ├── Activate.ps1
│   │   ├── pip
│   │   ├── pip3
│   │   ├── pip3.14
│   │   ├── python -> /usr/bin/python
│   │   ├── python3 -> python
│   │   ├── python3.14 -> python
│   │   └── 𝜋thon -> python
│   ├── .gitignore
│   ├── include
│   ├── lib
│   │   └── python3.14
│   │       └── site-packages
│   │           ├── pip
│   │           └── pip-25.1.1.dist-info
│   ├── lib64 -> lib
│   └── pyvenv.cfg
├── .vite
│   └── deps
│       ├── _metadata.json
│       └── package.json
├── .vscode
│   └── settings.json
└── web-app
    ├── dist
    │   ├── assets
    │   │   ├── index-B-_2fJ5v.js
    │   │   └── index-D7ITs23q.css
    │   └── index.html
    ├── frontend_test.log
    ├── index.html
    ├── nohup.out
    ├── package.json
    ├── package-lock.json
    ├── src
    │   ├── App.jsx
    │   ├── components
    │   │   ├── BackgroundEffect.jsx
    │   │   ├── ChatHeader.jsx
    │   │   ├── ChatInterface.jsx
    │   │   ├── HistorySidebar.jsx
    │   │   ├── KRMAILogo.jsx
    │   │   ├── LandingPage.jsx
    │   │   ├── LoadingDots.jsx
    │   │   ├── MarkdownComponents.jsx
    │   │   ├── MessageBubble.jsx
    │   │   ├── SettingsPage.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── SourceBadge.jsx
    │   │   ├── StudentProjectsPage.jsx
    │   │   └── UpdatesFAQPage.jsx
    │   ├── context
    │   │   └── ThemeContext.jsx
    │   ├── data
    │   │   └── constants.js
    │   ├── index.css
    │   └── main.jsx
    ├── vite.config.js
    └── vite.log
```

## How It Works End-To-End

```text
data/*.txt,.pdf,.docx
    -> ingest.py (load + split into chunks)
    -> sentence-transformers/all-MiniLM-L6-v2 embeddings
    -> ChromaDB persisted at chroma_db/
    -> rag_engine.py retrieval + prompt + Ollama inference
    -> api.py endpoints (/chat, /chat/stream, /health)
    -> React frontend (web-app/src) renders answers and source badges
```

### Ingestion Details (`ingest.py`)

- Supported loaders:
  - `.pdf` -> `PyPDFLoader`
  - `.docx` -> `Docx2txtLoader`
  - `.txt` -> `TextLoader`
- Chunking: `RecursiveCharacterTextSplitter` with
  - `chunk_size=1500`
  - `chunk_overlap=300`
- Rebuild behavior: wipes existing `chroma_db/` before rebuilding.

### Retrieval/Generation Details (`rag_engine.py`)

- Expands slang before retrieval with `SLANG_MAP` (262 patterns).
- Retrieves top 4 chunks (`k=4`).
- Adds short recent chat context.
- Uses prompt template requiring English output and grounded answers.
- Strips `<think>...</think>` sections from model output.
- Supports streaming token generation for SSE endpoint.

### API Contract (`api.py`)

- `GET /health` -> engine status (`db`, `ollama`, `ready`)
- `POST /chat` -> full response + source list
- `POST /chat/stream` -> SSE token stream + final source event

## Setup Instructions (From Repo Scripts And Notes)

### Prerequisites

- Python environment with dependencies from `requirements.txt`
- Node.js + npm for frontend
- Ollama installed and available in PATH
- Model pulled: `qwen2.5:3b`

### Manual Run (As In `For running the application.txt`)

Backend:

```bash
python api.py
```

Frontend:

```bash
cd web-app
npm run dev
```

### One-Command Linux/Mac (`start.sh`)

```bash
./start.sh
```

What `start.sh` does:

1. Checks Ollama installation.
2. Starts `ollama serve` if not already running.
3. Pulls `qwen2.5:3b` if missing.
4. Installs Python deps if `fastapi` import is missing.
5. Runs `python ingest.py` if vector DB is missing.
6. Starts FastAPI on `:8000` and Vite on `:5173`.

### Windows Launcher (`start.bat`)

```bat
start.bat
```

What `start.bat` does:

- Creates/activates local `venv`.
- Installs requirements.
- Shows menu:
  1. Ingest documents
  2. Run Streamlit UI (`streamlit run app.py`)

Note: `start.bat` currently launches the Streamlit path, not the React frontend.

## Knowledge Base In This Repo

Current text corpus in `data/`:

- krmu_academic_calendar.txt
- krmu_admissions.txt
- krmu_anti_ragging.txt
- krmu_bus_routes.txt
- krmu_campus_facilities.txt
- krmu_clubs_societies.txt
- krmu_code_of_conduct.txt
- krmu_fee_structure.txt
- krmu_hostel.txt
- krmu_placements.txt
- krmu_scholarships.txt
- krmu_soet_overview.txt
- krmu_student_welfare.txt

## Slang Expansion List (From `SLANG_MAP` In `rag_engine.py`)

`SLANG_MAP` currently contains 262 expansion patterns.

Representative entries (verbatim pattern style from code):

| Pattern | Expansion |
|---|---|
| `\bu\b` | `you` |
| `\bppl\b` | `people` |
| `\bb4\b` | `before` |
| `\b2\b` | `to` |
| `\bbtw\b` | `by the way` |
| `\bafaik\b` | `as far as I know` |
| `\bidk\b` | `I don't know` |
| `\bwdym\b` | `what do you mean` |
| `\bw/\b` | `with` |
| `\bw/o\b` | `without` |
| `\bwanna\b` | `want to` |
| `\bgonna\b` | `going to` |
| `\bdunno\b` | `don't know` |
| `\bgoated\b` | `greatest of all time` |
| `\bsus\b` | `suspicious` |
| `\bcap\b` | `lie` |
| `\bno cap\b` | `seriously` |
| `\bdrip\b` | `style` |
| `\bvibe check\b` | `assessment` |
| `\bdelulu\b` | `delusional` |
| `\bdept\b` | `department` |
| `\bsem\b` | `semester` |
| `\bacad\b` | `academic` |
| `\bhosty\b` | `hostel` |
| `\bkya\b` | `what is` |
| `\bkitna\b` | `how much is` |
| `\btheek\b` | `ok fine` |
| `\bpaisa\b` | `money fees` |
| `\battendance %\b` | `attendance percentage` |
| `\bkt\b` | `backlog subject` |
| `\bcgpa\b` | `CGPA cumulative grade point average` |
| `\bsgpa\b` | `SGPA semester grade point average` |
| `\bhod\b` | `Head of Department` |
| `\bfr fr\b` | `for real for real` |
| `\bwya\b` | `where you at` |
| `\bttyl\b` | `talk to you later` |
| `\b2moro\b` | `tomorrow` |
| `\bgr8\b` | `great` |
| `\bscene kya hai\b` | `what is the situation` |
| `\bbacklog\b` | `failed subject to be cleared later` |

For the complete set, see the `SLANG_MAP` dictionary in `rag_engine.py`.

## Current Limitations (Observed In Code)

- No authentication backend; sidebar explicitly shows sign-in as "coming soon".
- Chat/session history is browser-local (`localStorage`), not server-side persistent.
- Source badges are normalized labels; they do not provide deep links to exact source passages.
- CORS is wide open (`allow_origins=["*"]`) for development convenience.
- Python dependencies are unpinned in `requirements.txt`, so installs are not reproducible.
- `ingest.py` wipes and rebuilds `chroma_db/` each run.
- Windows launcher currently follows Streamlit flow, while React+FastAPI flow is handled in `start.sh`.
- Settings page model text currently mentions `Qwen3:8B`, while backend code uses `qwen2.5:3b`.

## Roadmap (From Existing Hints In Repository)

No explicit `TODO`/`FIXME` comments were found in core source files, but these roadmap signals exist:

1. `web-app/src/components/Sidebar.jsx`: sign-in/sync is marked "coming soon".
2. `RAG_Implementation_Plan.html`: phased roadmap includes setup/ingestion, core API/UI development, integration/testing, and final documentation/deployment.
3. `test_system.py`: existing broad test harness can be integrated into a repeatable CI check pipeline.

Practical next roadmap items grounded in current codebase:

1. Implement real auth + multi-device sync for sessions.
2. Align model labels in UI and backend configuration.
3. Add upload/re-index workflow in UI for new documents.
4. Add CI automation for `test_system.py` and health checks.
5. Tighten CORS and deployment hardening for production use.

## Contributors (From `git log`)

Unique commit authors detected:

- Pyro Sensei `<143206370+pyrosensei@users.noreply.github.com>`
- Pyro Sensei `<swetank0648@gmail.com>`
- Swetank Pritam `<swetank0648@gmail.com>`
- pyrosensei `<swetank0648@gmail.com>`
- MohitGoel109 `<goel0277@gmail.com>`
- Ankit Kumar `<anxkit5@gmail.com>`

If you want, this section can be normalized to canonical display names.
