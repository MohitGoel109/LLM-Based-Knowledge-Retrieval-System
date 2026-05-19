import os
import re
from typing import Any, Optional

from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from backend.services.nim_embeddings import NIMEmbeddings

from backend.config import SUPPORTED_PROVIDERS, get_settings
from backend.data.slang_map import expand_slang
from backend.services.providers import get_chat_model

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")
EMBEDDING_MODEL = "nvidia/nv-embedqa-e5-v5"

SETTINGS = get_settings()
LLM_PROVIDER = SETTINGS.llm_provider
RAG_ENABLED = SETTINGS.rag_enabled
SKIP_EMBEDDINGS = SETTINGS.skip_embeddings

CREATOR_RESPONSE = (
    "I was made by Swetank Pritam, a 3rd year B.Tech CSE (AI & ML) student.\n"
    "LinkedIn: https://www.linkedin.com/in/swetank-pritam-1557082a8/"
)

RAG_PROMPT = PromptTemplate(
    template=(
        "You are KRMAI, an AI assistant for KR Mangalam University students.\n"
        "Respond ONLY in English, even if the user writes in Hindi/Hinglish.\n\n"
        "Rules:\n"
        "- Respond DIRECTLY. Do NOT output <think> blocks or any internal reasoning.\n"
        "- Use ONLY the context below to answer. Do NOT make up information.\n"
        "- If the question has multiple parts, answer ALL parts thoroughly.\n"
        "- Use bullet points, numbered lists, or tables to structure your answer.\n"
        "- Include specific names, numbers, and details from the context.\n"
        "- If context lacks the answer for any part, say so for that specific part.\n"
        "- NEVER stop mid-sentence. Always complete your response.\n\n"
        "{chat_history}"
        "Context:\n{context}\n\n"
        "Question: {question}\n\n"
        "Answer:"
    ),
    input_variables=["context", "question", "chat_history"],
)

GENERAL_PROMPT = PromptTemplate(
    template=(
        "You are KRMAI, an AI assistant for KR Mangalam University students.\n"
        "Respond only in English. Be clear when an answer is not grounded in the local knowledge base.\n"
        "Do not invent official deadlines, fees, phone numbers, or policy details.\n\n"
        "{chat_history}"
        "Question: {question}\n\n"
        "Answer:"
    ),
    input_variables=["question", "chat_history"],
)


def _format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def _as_text(chunk) -> str:
    if isinstance(chunk, str):
        return chunk
    content = getattr(chunk, "content", chunk)
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict) and "text" in item:
                parts.append(str(item["text"]))
        return "".join(parts)
    return str(content)


def _strip_think(text: str) -> str:
    if '<think>' not in text:
        return text
    cleaned = re.sub(r'<think>[\s\S]*?</think>', '', text, flags=re.IGNORECASE).strip()
    if '<think>' in cleaned:
        cleaned = re.sub(r'<think>[\s\S]*$', '', cleaned, flags=re.IGNORECASE).strip()
    return cleaned


def _is_creator_query(text: str) -> bool:
    lowered = text.lower().strip()
    patterns = [
        r"\bwho\s+is\s+your\s+creator\b",
        r"\bwho\s+is\s+the\s+creator\b",
        r"\bwho'?s\s+the\s+creator\b",
        r"\bwho\s+(created|made|built|developed)\s+(you|this|krmai|chatbot|bot|assistant)\b",
        r"\bcreator\s+of\s+(this|the)?\s*(chatbot|bot|assistant|krmai)\b",
        r"\bdeveloper\s+of\s+(this|the)?\s*(chatbot|bot|assistant|krmai)\b",
    ]
    return any(re.search(pattern, lowered) for pattern in patterns)


def _build_chat_history(history: list | None, max_history: int) -> str:
    if not history:
        return ""
    recent = history[-max_history:]
    lines = ["Recent conversation:"]
    for msg in recent:
        role = "Student" if msg.get("role") == "user" else "Assistant"
        content = str(msg.get("content", ""))[:200]
        lines.append(f"{role}: {content}")
    lines.append("")
    return "\n".join(lines)


class RAGEngine:
    def __init__(self):
        self.vector_store = None
        self.retriever = None
        self.llm = None
        self.max_history = 4
        self.status = {
            "db": False,
            "provider": LLM_PROVIDER,
            "active_model": SETTINGS.active_model,
            "rag_enabled": RAG_ENABLED,
            "ready": False,
        }
        self._initialize()

    def _initialize(self):
        if not RAG_ENABLED:
            self.embeddings = None
            print("[RAG] RAG_ENABLED=false — retrieval disabled; using direct LLM mode")
        elif SKIP_EMBEDDINGS:
            self.embeddings = None
            print("[RAG] SKIP_EMBEDDINGS=true — retrieval disabled; using direct LLM mode")
        elif os.path.exists(CHROMA_PATH) and os.listdir(CHROMA_PATH):
            print("[RAG] Found ChromaDB, loading embeddings...")
            if not SETTINGS.nim_api_key:
                print("[RAG] NIM_API_KEY is missing; skipping retrieval.")
            else:
                try:
                    self.embeddings = NIMEmbeddings(
                        api_key=SETTINGS.nim_api_key,
                        base_url=SETTINGS.nim_base_url,
                        model=EMBEDDING_MODEL,
                    )
                    self.vector_store = Chroma(
                        persist_directory=CHROMA_PATH,
                        embedding_function=self.embeddings,
                    )
                    self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 4})
                    self.status["db"] = True
                except Exception as e:
                    print(f"[RAG] Error loading vector store: {e}")
        else:
            self.embeddings = None
            print("[RAG] ChromaDB not found — skipping embedding load.")

        provider = LLM_PROVIDER
        if provider not in SUPPORTED_PROVIDERS:
            raise ValueError(
                f"Unsupported LLM_PROVIDER='{provider}'. Use one of: {sorted(SUPPORTED_PROVIDERS)}"
            )

        if not SETTINGS.provider_configured():
            print(f"[RAG] {provider.upper()}_API_KEY not configured. Set it in your .env file.")
        else:
            try:
                self.llm = get_chat_model(SETTINGS)
                print(f"[RAG] {provider.title()} connected: {SETTINGS.active_model}")
            except Exception as e:
                print(f"[RAG] Error initializing {provider}: {e}")

        if self.llm:
            self.status["ready"] = True

    def query(self, question: str, history: list = None):
        cleaned = expand_slang(question)

        if _is_creator_query(cleaned):
            return {"answer": CREATOR_RESPONSE, "source_documents": []}

        if not self.llm:
            parts = []
            if RAG_ENABLED and not self.status["db"]:
                parts.append("Vector database not found — run 'python scripts/ingest.py' first.")
            if not SETTINGS.provider_configured():
                parts.append(
                    f"{LLM_PROVIDER.upper()}_API_KEY is not configured."
                )
            return " | ".join(parts) if parts else "System not initialized."

        chat_history_str = _build_chat_history(history, self.max_history)
        prompt_text, source_docs = self._build_prompt(cleaned, chat_history_str)

        raw = self.llm.invoke(prompt_text)
        answer = _strip_think(_as_text(raw))

        return {"answer": answer, "source_documents": source_docs}

    def query_stream_events(self, question: str, history: list = None):
        cleaned = expand_slang(question)

        if _is_creator_query(cleaned):
            yield {"type": "token", "content": CREATOR_RESPONSE}
            yield {"type": "done", "source_documents": []}
            return

        if not self.llm:
            yield {"type": "error", "message": "System not initialized."}
            return

        chat_history_str = _build_chat_history(history, self.max_history)
        prompt_text, source_docs = self._build_prompt(cleaned, chat_history_str)

        full_answer = ""
        thinking_done = False
        for chunk in self.llm.stream(prompt_text):
            chunk_text = _as_text(chunk)
            if not chunk_text:
                continue
            full_answer += chunk_text
            if not thinking_done:
                if '<think>' not in full_answer:
                    thinking_done = True
                    yield {"type": "token", "content": full_answer}
                elif '</think>' in full_answer:
                    thinking_done = True
                    after_think = full_answer.split('</think>', 1)[1]
                    if after_think.strip():
                        yield {"type": "token", "content": after_think}
                    full_answer = after_think
            else:
                yield {"type": "token", "content": chunk_text}

        yield {"type": "done", "source_documents": source_docs}

    def _build_prompt(self, cleaned_question: str, chat_history_str: str):
        if self.retriever:
            try:
                source_docs = self.retriever.invoke(cleaned_question)
                context = _format_docs(source_docs)
                prompt_text = RAG_PROMPT.format(
                    context=context,
                    question=cleaned_question,
                    chat_history=chat_history_str,
                )
                return prompt_text, source_docs
            except Exception as e:
                print(f"[RAG] Retrieval failed, falling back to direct mode: {e}")
        prompt_text = GENERAL_PROMPT.format(
            question=cleaned_question,
            chat_history=chat_history_str,
        )
        return prompt_text, []
