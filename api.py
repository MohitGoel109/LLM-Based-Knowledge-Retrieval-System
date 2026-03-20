from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
import os
import json

# Set HuggingFace to offline mode before importing rag_engine
os.environ.setdefault("HF_HUB_OFFLINE", "1")
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")

from rag_engine import RAGEngine

# Global RAG engine (initialized at startup)
rag_engine: Optional[RAGEngine] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG engine at server startup."""
    global rag_engine
    print("[API] Initializing RAG Engine...")
    rag_engine = RAGEngine()
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
        source_docs = rag_engine.last_source_docs
        sources_out = [{"source": s.source, "page": s.page} for s in _extract_sources(source_docs)]
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


def _extract_sources(source_docs):
    """Extract unique sources from retrieved documents."""
    sources_out = []
    seen = set()
    for doc in source_docs:
        src = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", None)
        key = f"{src}-{page}"
        if key not in seen:
            seen.add(key)
            sources_out.append(SourceDoc(source=src, page=page))
    return sources_out


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
