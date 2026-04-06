# Minimal Vercel API - Groq only, no local embeddings
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import json
import requests

load_dotenv()

app = FastAPI(title="KRMAI Chatbot API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    # Frontend may send `message` while older clients send `question`.
    question: Optional[str] = None
    message: Optional[str] = None
    history: Optional[List[Dict[str, Any]]] = None

class HealthResponse(BaseModel):
    status: str
    message: Optional[str] = None

def get_user_question(request: ChatRequest) -> str:
    question = (request.question or request.message or "").strip()
    if not question:
        raise HTTPException(status_code=422, detail="Request must include `question` or `message`")
    return question

def query_groq(question: str) -> str:
    """Direct Groq API call without local embeddings"""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "GROQ_API_KEY not configured"
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Simple prompt for university questions
    prompt = f"""You are KRMAI, an AI assistant for KR Mangalam University students.
Answer the following question based on general university knowledge:

Question: {question}

Answer directly and helpfully:"""
    
    payload = {
        "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1024
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error calling Groq API: {str(e)}"

@app.get("/")
async def root():
    return {"message": "KRMAI Chatbot API", "version": "1.0.0"}

@app.get("/api")
async def api_root():
    return {"message": "KRMAI Chatbot API", "version": "1.0.0"}

@app.get("/health")
async def health():
    """Health check endpoint."""
    if not os.getenv("GROQ_API_KEY"):
        return HealthResponse(status="error", message="GROQ_API_KEY not set")
    return HealthResponse(status="healthy")

@app.get("/api/health")
async def api_health():
    """Health check endpoint for /api-prefixed routing."""
    if not os.getenv("GROQ_API_KEY"):
        return HealthResponse(status="error", message="GROQ_API_KEY not set")
    return HealthResponse(status="healthy")

@app.post("/chat")
async def chat(request: ChatRequest):
    """Main chat endpoint using Groq directly."""
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    
    try:
        question = get_user_question(request)
        answer = query_groq(question)
        return {
            "answer": answer,
            "sources": [],
            "source_documents": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def api_chat(request: ChatRequest):
    """/api-prefixed chat endpoint."""
    return await chat(request)

def sse_chunks(answer: str):
    # Emit one token payload followed by done for frontend stream compatibility.
    yield f"data: {json.dumps({'type': 'token', 'content': answer})}\n\n"
    yield f"data: {json.dumps({'type': 'done', 'sources': []})}\n\n"

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming-compatible endpoint expected by frontend."""
    if not os.getenv("GROQ_API_KEY"):
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    question = get_user_question(request)
    answer = query_groq(question)
    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    }
    return StreamingResponse(sse_chunks(answer), media_type="text/event-stream", headers=headers)

@app.post("/api/chat/stream")
async def api_chat_stream(request: ChatRequest):
    """/api-prefixed streaming endpoint."""
    return await chat_stream(request)

@app.get("/sources")
async def get_sources():
    """Get available data sources."""
    return {
        "sources": ["general university knowledge"],
        "note": "Using Groq API directly without local embeddings"
    }

@app.get("/api/sources")
async def api_get_sources():
    """/api-prefixed sources endpoint."""
    return await get_sources()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)