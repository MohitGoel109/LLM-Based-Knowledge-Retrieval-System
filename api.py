from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os
import json

load_dotenv()

OFFICIAL_REFERENCE_URL = "https://www.krmangalam.edu.in/"

# Global RAG engine (initialized at startup)
rag_engine: Optional[Any] = None


def initialize_rag():
    """Lazy import + initialize heavy RAG dependencies at startup time."""
    from rag_engine import RAGEngine

    return RAGEngine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG engine at server startup."""
    global rag_engine
    print("[API] Initializing RAG Engine...")
    print("[API] Loading embedding model, this may take 2-3 minutes...")
    rag_engine = initialize_rag()
    print(f"[API] RAG Engine ready: {rag_engine.status}")
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
    return rag_engine.status

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Processes a user message and returns the LLM response with sources."""
    if not rag_engine.status["ready"]:
        raise HTTPException(status_code=503, detail="RAG Engine is not ready. Check /health endpoint.")
    
    # Convert history to list of dicts for the engine
    history = None
    if request.history:
        history = [{"role": h.role, "content": h.content} for h in request.history]
    
    result = rag_engine.query(request.message, history=history)
    
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
    if not rag_engine.status["ready"]:
        raise HTTPException(status_code=503, detail="RAG Engine is not ready.")

    history = None
    if request.history:
        history = [{"role": h.role, "content": h.content} for h in request.history]

    def event_generator():
        for chunk in rag_engine.query_stream(request.message, history=history):
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
