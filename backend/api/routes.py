import json
import os
import threading
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, StreamingResponse

from backend.api.models import ChatRequest, ChatResponse, HealthResponse, SourceDoc
from backend.config import get_settings
from backend.services.rag_engine import CREATOR_RESPONSE, RAGEngine, _is_creator_query

settings = get_settings()

router = APIRouter()

OFFICIAL_REFERENCE_URL = "https://www.krmangalam.edu.in/"

rag_engine: Optional[RAGEngine] = None
rag_init_error: Optional[str] = None
_rag_init_thread: Optional[threading.Thread] = None
_rag_init_lock = threading.Lock()


def _initialize_rag_worker():
    global rag_engine, rag_init_error
    try:
        print("[API] Initializing RAG Engine...")
        rag_engine = RAGEngine()
        print(f"[API] RAG Engine ready: {rag_engine.status}")
    except Exception as e:
        rag_init_error = str(e)
        print(f"[API] RAG Engine failed to initialize: {e}")


def _start_rag_init_if_needed():
    global _rag_init_thread
    with _rag_init_lock:
        if rag_engine is not None:
            return
        if _rag_init_thread is not None and _rag_init_thread.is_alive():
            return
        _rag_init_thread = threading.Thread(target=_initialize_rag_worker, daemon=True)
        _rag_init_thread.start()


def _get_ready_engine():
    _start_rag_init_if_needed()
    if rag_engine is None:
        detail = "RAG Engine is initializing. Please retry in a few seconds."
        if rag_init_error:
            detail = f"RAG Engine failed to initialize: {rag_init_error}"
        raise HTTPException(status_code=503, detail=detail)
    if not rag_engine.status.get("ready", False):
        raise HTTPException(status_code=503, detail="RAG Engine is not ready.")
    return rag_engine


def _extract_sources(source_docs=None):
    sources = []
    seen = set()
    for doc in source_docs or []:
        metadata = getattr(doc, "metadata", {}) or {}
        source = metadata.get("source") or OFFICIAL_REFERENCE_URL
        page = metadata.get("page")
        key = (source, page)
        if key in seen:
            continue
        seen.add(key)
        sources.append(SourceDoc(source=source, page=page))
    return sources or [SourceDoc(source=OFFICIAL_REFERENCE_URL, page=None)]


@router.get("/health")
def health_check():
    if rag_engine is None:
        initializing = bool(_rag_init_thread and _rag_init_thread.is_alive())
        return HealthResponse(
            db=False,
            provider=settings.llm_provider,
            active_model=settings.active_model,
            ready=False,
            initializing=initializing,
            error=rag_init_error,
        )
    status = dict(rag_engine.status)
    return HealthResponse(
        db=status.get("db", False),
        provider=status.get("provider", settings.llm_provider),
        active_model=status.get("active_model", settings.active_model),
        ready=status.get("ready", False),
        initializing=False,
        error=rag_init_error,
    )


@router.get("/provider")
def provider_check():
    return settings.provider_status()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    if _is_creator_query(request.message):
        return ChatResponse(answer=CREATOR_RESPONSE, sources=_extract_sources([]))

    engine = _get_ready_engine()
    history = None
    if request.history:
        history = [{"role": h.role, "content": h.content} for h in request.history]

    result = engine.query(request.message, history=history)
    if isinstance(result, str):
        raise HTTPException(status_code=500, detail=result)

    return ChatResponse(
        answer=result.get("answer", ""),
        sources=_extract_sources(result.get("source_documents", [])),
    )


@router.post("/chat/stream")
def chat_stream(request: ChatRequest):
    if _is_creator_query(request.message):
        def creator_events():
            yield f"data: {json.dumps({'type': 'token', 'content': CREATOR_RESPONSE})}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'sources': []})}\n\n"
        return StreamingResponse(
            creator_events(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    engine = _get_ready_engine()
    history = None
    if request.history:
        history = [{"role": h.role, "content": h.content} for h in request.history]

    def event_generator():
        for event in engine.query_stream_events(request.message, history=history):
            if event["type"] == "token":
                yield f"data: {json.dumps({'type': 'token', 'content': event['content']})}\n\n"
            elif event["type"] == "done":
                sources_out = [s.model_dump() for s in _extract_sources(event.get("source_documents", []))]
                yield f"data: {json.dumps({'type': 'done', 'sources': sources_out})}\n\n"
            elif event["type"] == "error":
                yield f"data: {json.dumps({'type': 'error', 'message': event['message']})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/sources")
def get_sources():
    return {
        "reference_url": OFFICIAL_REFERENCE_URL,
        "rag_enabled": settings.rag_enabled,
        "db": bool(rag_engine and rag_engine.status.get("db")),
    }
