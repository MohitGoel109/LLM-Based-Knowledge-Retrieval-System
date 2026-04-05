from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os
import json
import threading

load_dotenv()

OFFICIAL_REFERENCE_URL = "https://www.krmangalam.edu.in/"

# Global RAG engine (initialized at startup)
rag_engine: Optional[Any] = None
rag_init_error: Optional[str] = None
_rag_init_thread: Optional[threading.Thread] = None
_rag_init_lock = threading.Lock()


def initialize_rag():
    """Lazy import + initialize heavy RAG dependencies at startup time."""
    from rag_engine import RAGEngine

    return RAGEngine()


def _initialize_rag_worker():
    """Load heavy RAG dependencies in a background thread."""
    global rag_engine, rag_init_error
    try:
        print("[API] Initializing RAG Engine...")
        print("[API] Loading embedding model, this may take 2-3 minutes...")
        rag_engine = initialize_rag()
        print(f"[API] RAG Engine ready: {rag_engine.status}")
    except Exception as e:
        rag_init_error = str(e)
        print(f"[API] RAG Engine failed to initialize: {e}")


def _start_rag_init_if_needed():
    """Start background RAG initialization once per process."""
    global _rag_init_thread
    with _rag_init_lock:
        if rag_engine is not None:
            return
        if _rag_init_thread is not None and _rag_init_thread.is_alive():
            return
        _rag_init_thread = threading.Thread(target=_initialize_rag_worker, daemon=True)
        _rag_init_thread.start()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start non-blocking RAG initialization at server startup."""
    _start_rag_init_if_needed()
    yield
    print("[API] Shutting down.")

app = FastAPI(title="KRMAI API", lifespan=lifespan)

# Setup CORS to allow React frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str
    
class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]]=None
    
class SourceDoc(BaseModel):
    source: str
    page: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceDoc]

@app.get("/health")
def health_check():
    """Returns the status of the RAG engine components."""
    if rag_engine is None:
        return {
            "db": False,
            "provider": os.getenv("LLM_PROVIDER", "groq").strip().lower(),
            "ollama": False,
            "groq": False,
            "ready": False,
            "initializing": True,
            "error": rag_init_error,
        }
    status = dict(rag_engine.status)
    status["initializing"] = False
    status["error"] = rag_init_error
    return status


def _get_ready_engine():
    """Return a ready RAG engine or raise a 503 while it is initializing."""
    _start_rag_init_if_needed()
    if rag_engine is None:
        detail = "RAG Engine is initializing. Please retry in a few seconds."
        if rag_init_error:
            detail = f"RAG Engine failed to initialize: {rag_init_error}"
        raise HTTPException(status_code=503, detail=detail)
    if not rag_engine.status.get("ready", False):
        raise HTTPException(status_code=503, detail="RAG Engine is not ready. Check /health endpoint.")
    return rag_engine

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Processes a user message and returns the LLM response with sources."""
    engine = _get_ready_engine()
    
    # Convert history to list of dicts for the engine
    history = None
    if request.history:
        history = [{"role": h.role, "content": h.content} for h in request.history]
    
    result = engine.query(request.message, history=history)
    
    # If the response is just a string, it means an error occurred in query()
    if isinstance(result, str):
        raise HTTPException(status_code=500, detail=result)
        
    answer = result.get("answer", "")
    source_docs = result.get("source_documents", [])
    
    sources_out = _extract_sources(source_docs)
            
    return ChatResponse(answer=answer, sources=sources_out)


@app.post("/chat/stream")
def chat_stream(request: ChatRequest):
    """Streaming endpoint — sends tokens as Server-Sent Events for real-time display."""
    engine = _get_ready_engine()

    history = None
    if request.history:
        history = [{"role": h.role, "content": h.content} for h in request.history]

    def event_generator():
        for chunk in engine.query_stream(request.message, history=history):
            # Send each text chunk as an SSE data event
            data = json.dumps({"type": "token", "content": chunk})
            yield f"data: {data}\n\n"

        # After streaming completes, send sources as a final event
        sources_out = [{"source": OFFICIAL_REFERENCE_URL, "page": None}]
        data = json.dumps({"type": "done", "sources": sources_out})
        yield f"data: {data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def _extract_sources(source_docs=None):
    """Return a single public website reference instead of local document paths."""
    return [SourceDoc(source=OFFICIAL_REFERENCE_URL, page=None)]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
