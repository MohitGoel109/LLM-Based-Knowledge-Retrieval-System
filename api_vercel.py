# Vercel-optimized API for serverless deployment
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import json

load_dotenv()

OFFICIAL_REFERENCE_URL = "https://www.krmangalam.edu.in/"

# Initialize RAG engine on first request (serverless-friendly)
rag_engine: Optional[Any] = None
rag_init_error: Optional[str] = None

def initialize_rag():
    """Lazy import + initialize heavy RAG dependencies."""
    from rag_engine import RAGEngine
    return RAGEngine()

def get_rag_engine():
    """Get or initialize RAG engine (thread-safe for serverless)."""
    global rag_engine, rag_init_error
    
    if rag_engine is not None:
        return rag_engine, rag_init_error
    
    try:
        print("[API] Initializing RAG Engine for Vercel...")
        rag_engine = initialize_rag()
        print(f"[API] RAG Engine ready: {rag_engine.status}")
        return rag_engine, None
    except Exception as e:
        rag_init_error = str(e)
        print(f"[API] RAG Engine failed to initialize: {e}")
        return None, rag_init_error

app = FastAPI(title="KRMAI Chatbot API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str
    history: Optional[List[Dict[str, str]]] = None

class HealthResponse(BaseModel):
    status: str
    message: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "KRMAI Chatbot API", "version": "1.0.0"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    engine, error = get_rag_engine()
    if error:
        return HealthResponse(status="error", message=error)
    return HealthResponse(status="healthy")

@app.post("/chat")
async def chat(request: ChatRequest):
    """Main chat endpoint."""
    engine, error = get_rag_engine()
    if error:
        raise HTTPException(status_code=500, detail=error)
    
    try:
        result = engine.query(request.question, request.history)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming chat endpoint."""
    engine, error = get_rag_engine()
    if error:
        raise HTTPException(status_code=500, detail=error)
    
    async def generate():
        try:
            for chunk in engine.query_stream(request.question, request.history):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.get("/sources")
async def get_sources():
    """Get available data sources."""
    return {
        "sources": ["admissions", "scholarships", "placements", "hostel", "bus_routes"],
        "reference_url": OFFICIAL_REFERENCE_URL
    }

# Vercel requires this for serverless functions
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)