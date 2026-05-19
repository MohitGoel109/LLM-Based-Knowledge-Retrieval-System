import os
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Optional

from dotenv import load_dotenv

load_dotenv()


def _bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _csv_env(name: str, default: str) -> list[str]:
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


SUPPORTED_PROVIDERS = {"groq", "openai", "anthropic", "gemini"}


@dataclass(frozen=True)
class Settings:
    llm_provider: str = field(default_factory=lambda: os.getenv("LLM_PROVIDER", "groq").strip().lower())

    groq_api_key: Optional[str] = field(default_factory=lambda: os.getenv("GROQ_API_KEY"))
    groq_model: str = field(default_factory=lambda: os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"))

    openai_api_key: Optional[str] = field(default_factory=lambda: os.getenv("OPENAI_API_KEY"))
    openai_model: str = field(default_factory=lambda: os.getenv("OPENAI_MODEL", "gpt-4o-mini"))

    anthropic_api_key: Optional[str] = field(default_factory=lambda: os.getenv("ANTHROPIC_API_KEY"))
    anthropic_model: str = field(default_factory=lambda: os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-latest"))

    gemini_api_key: Optional[str] = field(default_factory=lambda: os.getenv("GEMINI_API_KEY"))
    gemini_model: str = field(default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-2.0-flash"))

    rag_enabled: bool = field(default_factory=lambda: _bool_env("RAG_ENABLED", True))
    skip_embeddings: bool = field(default_factory=lambda: _bool_env("SKIP_EMBEDDINGS", False))
    allowed_origins: tuple[str, ...] = field(default_factory=lambda: tuple(
        _csv_env("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    ))
    environment: str = field(default_factory=lambda: os.getenv("APP_ENV", os.getenv("ENVIRONMENT", "development")))

    @property
    def active_model(self) -> str:
        return getattr(self, f"{self.llm_provider}_model", "unknown")

    @property
    def groq_configured(self) -> bool:
        return bool(self.groq_api_key and self.groq_api_key != "your_groq_api_key_here")

    @property
    def openai_configured(self) -> bool:
        return bool(self.openai_api_key and self.openai_api_key != "your_openai_api_key_here")

    @property
    def anthropic_configured(self) -> bool:
        return bool(self.anthropic_api_key and self.anthropic_api_key != "your_anthropic_api_key_here")

    @property
    def gemini_configured(self) -> bool:
        return bool(self.gemini_api_key and self.gemini_api_key != "your_gemini_api_key_here")

    def provider_configured(self) -> bool:
        cfg = {
            "groq": self.groq_configured,
            "openai": self.openai_configured,
            "anthropic": self.anthropic_configured,
            "gemini": self.gemini_configured,
        }
        return cfg.get(self.llm_provider, False)

    def provider_status(self) -> dict:
        return {
            "provider": self.llm_provider,
            "active_model": self.active_model,
            "groq_configured": self.groq_configured,
            "openai_configured": self.openai_configured,
            "anthropic_configured": self.anthropic_configured,
            "gemini_configured": self.gemini_configured,
            "rag_enabled": self.rag_enabled,
            "skip_embeddings": self.skip_embeddings,
            "environment": self.environment,
        }


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
