from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from rag_engine import RAGEngine

app = FastAPI(title="College Knowledge API")

# Setup CORS to allow React frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, you can restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Engine globally
rag_engine = RAGEngine()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None

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
    
    sources_out = []
    seen = set()
    for doc in source_docs:
        src = doc.metadata.get("source", "Unknown")
        page = doc.metadata.get("page", None)
        key = f"{src}-{page}"
        if key not in seen:
            seen.add(key)
            sources_out.append(SourceDoc(source=src, page=page))
            
    return ChatResponse(answer=answer, sources=sources_out)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
