from typing import Optional

from pydantic import BaseModel, field_validator


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[list[ChatMessage]] = None

    @field_validator("message")
    @classmethod
    def message_must_not_be_empty(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("message must not be empty")
        return cleaned


class SourceDoc(BaseModel):
    source: str
    page: Optional[int] = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceDoc]


class HealthResponse(BaseModel):
    db: bool = False
    provider: str = ""
    active_model: str = ""
    ready: bool = False
    initializing: bool = False
    error: Optional[str] = None
