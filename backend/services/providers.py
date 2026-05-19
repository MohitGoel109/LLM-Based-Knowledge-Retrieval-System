from abc import ABC, abstractmethod

from langchain_anthropic import ChatAnthropic
from langchain_core.language_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from backend.config import Settings


class LLMProvider(ABC):
    name: str

    @abstractmethod
    def get_chat_model(self, settings: Settings) -> BaseChatModel:
        ...


class NIMProvider(LLMProvider):
    """NVIDIA NIM — OpenAI-compatible, uses ChatOpenAI pointed at NIM base URL."""

    name = "nim"

    def get_chat_model(self, settings: Settings) -> BaseChatModel:
        return ChatOpenAI(
            api_key=settings.nim_api_key,
            model=settings.nim_model,
            base_url=settings.nim_base_url,
            timeout=60,
            max_retries=1,
        )


class OpenAIProvider(LLMProvider):
    name = "openai"

    def get_chat_model(self, settings: Settings) -> BaseChatModel:
        return ChatOpenAI(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
        )


class AnthropicProvider(LLMProvider):
    name = "anthropic"

    def get_chat_model(self, settings: Settings) -> BaseChatModel:
        return ChatAnthropic(
            api_key=settings.anthropic_api_key,
            model=settings.anthropic_model,
        )


class GeminiProvider(LLMProvider):
    name = "gemini"

    def get_chat_model(self, settings: Settings) -> BaseChatModel:
        return ChatGoogleGenerativeAI(
            api_key=settings.gemini_api_key,
            model=settings.gemini_model,
        )


PROVIDER_MAP: dict[str, LLMProvider] = {
    "nim": NIMProvider(),
    "openai": OpenAIProvider(),
    "anthropic": AnthropicProvider(),
    "gemini": GeminiProvider(),
}


def get_provider(name: str) -> LLMProvider:
    provider = PROVIDER_MAP.get(name)
    if not provider:
        raise ValueError(
            f"Unsupported LLM provider '{name}'. "
            f"Supported: {', '.join(sorted(PROVIDER_MAP.keys()))}"
        )
    return provider


def get_chat_model(settings: Settings) -> BaseChatModel:
    provider = get_provider(settings.llm_provider)
    return provider.get_chat_model(settings)
