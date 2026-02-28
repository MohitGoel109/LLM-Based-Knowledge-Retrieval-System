import os
import requests
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# ── Configuration ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL = "llama3.2:3b"
OLLAMA_BASE_URL = "http://localhost:11434"

# ── Slang / Abbreviation Dictionary ───────────────────────────
# Maps common student slang and internet abbreviations to their
# full forms so both retrieval and the LLM see clean text.
import re

SLANG_MAP = {
    # Common abbreviations
    r'\buk\b': 'you know',
    r'\bidk\b': "I don't know",
    r'\bimo\b': 'in my opinion',
    r'\bbtw\b': 'by the way',
    r'\bfyi\b': 'for your information',
    r'\bafaik\b': 'as far as I know',
    r'\btbh\b': 'to be honest',
    r'\brn\b': 'right now',
    r'\bpls\b': 'please',
    r'\bplz\b': 'please',
    r'\bthx\b': 'thanks',
    r'\bty\b': 'thank you',
    r'\bnp\b': 'no problem',
    r'\bwdym\b': 'what do you mean',
    r'\bhmu\b': 'let me know',
    r'\blmk\b': 'let me know',
    r'\bbrb\b': 'be right back',
    r'\bomg\b': 'oh my god',
    r'\bsmh\b': 'shaking my head',
    r'\bgoat\b': 'greatest of all time',
    r'\bw/\b': 'with',
    r'\bw/o\b': 'without',
    r'\bb/w\b': 'between',
    r'\baint\b': "isn't",
    r'\bwanna\b': 'want to',
    r'\bgonna\b': 'going to',
    r'\bgotta\b': 'got to',
    r'\bkinda\b': 'kind of',
    r'\bsorta\b': 'sort of',
    r'\blemme\b': 'let me',
    r'\bgimme\b': 'give me',
    r'\bdunno\b': "don't know",
    # College-specific
    r'\battendance %\b': 'attendance percentage',
    r'\bkt\b': 'backlog subject',
    r'\bcgpa\b': 'CGPA cumulative grade point average',
    r'\bsgpa\b': 'SGPA semester grade point average',
    r'\bhod\b': 'Head of Department',
    r'\bplacement\b': 'placement cell campus recruitment',
}


def _expand_slang(text: str) -> str:
    """Replace slang and abbreviations with full forms (case-insensitive)."""
    result = text
    for pattern, replacement in SLANG_MAP.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    return result


# Prompt that keeps answers grounded in the retrieved context
RAG_PROMPT = PromptTemplate(
    template=(
        "You are a friendly and helpful college assistant who talks to students.\n"
        "Students may use informal language, slang, abbreviations, or shorthand.\n"
        "Interpret their intent naturally (e.g. 'uk' means 'you know', "
        "'idk' means 'I don't know', 'wanna' means 'want to').\n"
        "Use ONLY the context below to answer. Be clear, concise, and student-friendly.\n"
        "If the context does not contain the answer, say "
        "'I don't have enough information to answer that.'\n\n"
        "{chat_history}"
        "Context:\n{context}\n\n"
        "Question: {question}\n\n"
        "Answer:"
    ),
    input_variables=["context", "question", "chat_history"],
)


def _format_docs(docs):
    """Join retrieved document pages into a single context string."""
    return "\n\n".join(doc.page_content for doc in docs)


class RAGEngine:
    """Retrieval-Augmented Generation engine backed by ChromaDB + Ollama."""

    def __init__(self):
        self.vector_store = None
        self.retriever = None
        self.llm = None
        self.qa_chain = None
        self.chat_history = []  # Stores last N messages for conversational memory
        self.max_history = 6    # Keep last 6 messages (3 Q&A pairs)
        self.status = {"db": False, "ollama": False, "ready": False}
        self._initialize()

    # ── Setup ──────────────────────────────────────────────────
    def _initialize(self):
        # 1. Embeddings (runs locally via sentence-transformers)
        self.embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

        # 2. Vector store
        if os.path.exists(CHROMA_PATH) and os.listdir(CHROMA_PATH):
            try:
                self.vector_store = Chroma(
                    persist_directory=CHROMA_PATH,
                    embedding_function=self.embeddings,
                )
                self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})
                self.status["db"] = True
            except Exception as e:
                print(f"[RAG] Error loading vector store: {e}")
        else:
            print("[RAG] ChromaDB not found — run ingest.py first.")

        # 3. Ollama LLM
        if self._ollama_is_running():
            try:
                self.llm = OllamaLLM(model=LLM_MODEL, base_url=OLLAMA_BASE_URL)
                self.status["ollama"] = True
            except Exception as e:
                print(f"[RAG] Error initializing Ollama: {e}")
        else:
            print("[RAG] Ollama is not running. Start it with: ollama serve")

        # 4. RAG chain (using LCEL instead of deprecated RetrievalQA)
        if self.llm and self.retriever:
            self.qa_chain = (
                {
                    "context": self.retriever | _format_docs,
                    "question": RunnablePassthrough(),
                }
                | RAG_PROMPT
                | self.llm
                | StrOutputParser()
            )
            self.status["ready"] = True

    # ── Public API ─────────────────────────────────────────────
    def query(self, question: str, history: list = None):
        """Ask a question. Returns dict with answer + sources, or error string."""
        if not self.qa_chain:
            parts = []
            if not self.status["db"]:
                parts.append("Vector database not found — run 'python ingest.py' first.")
            if not self.status["ollama"]:
                parts.append("Ollama is not running — start it with 'ollama serve'.")
            return " | ".join(parts) if parts else "System not initialized."

        # Expand slang/abbreviations so retrieval finds the right docs
        cleaned_question = _expand_slang(question)

        # Build chat history string from provided history or internal buffer
        if history:
            self.chat_history = history[-self.max_history:]
        chat_history_str = ""
        if self.chat_history:
            chat_history_str = "Previous conversation:\n"
            for msg in self.chat_history:
                role = "Student" if msg["role"] == "user" else "Assistant"
                chat_history_str += f"{role}: {msg['content']}\n"
            chat_history_str += "\n"

        # Retrieve source documents separately for citations
        assert self.retriever is not None  # guaranteed when qa_chain is set
        source_docs = self.retriever.invoke(cleaned_question)

        # Build prompt inputs manually (can't use the chain directly with history)
        context = _format_docs(source_docs)
        prompt_text = RAG_PROMPT.format(
            context=context,
            question=cleaned_question,
            chat_history=chat_history_str,
        )
        answer = self.llm.invoke(prompt_text)

        # Update internal history
        self.chat_history.append({"role": "user", "content": question})
        self.chat_history.append({"role": "assistant", "content": answer})
        self.chat_history = self.chat_history[-self.max_history:]

        return {
            "answer": answer,
            "source_documents": source_docs,
        }

    # ── Helpers ────────────────────────────────────────────────
    @staticmethod
    def _ollama_is_running() -> bool:
        try:
            r = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
            return r.status_code == 200
        except Exception:
            return False
