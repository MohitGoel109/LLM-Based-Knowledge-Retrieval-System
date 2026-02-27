import os
import requests
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# ── Configuration ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL = "llama3.2:3b"
OLLAMA_BASE_URL = "http://localhost:11434"

# Prompt that keeps answers grounded in the retrieved context
RAG_PROMPT = PromptTemplate(
    template=(
        "You are a helpful college assistant. Use ONLY the context below to answer.\n"
        "If the context does not contain the answer, say "
        "'I don't have enough information to answer that.'\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}\n\n"
        "Answer:"
    ),
    input_variables=["context", "question"],
)


class RAGEngine:
    """Retrieval-Augmented Generation engine backed by ChromaDB + Ollama."""

    def __init__(self):
        self.vector_store = None
        self.retriever = None
        self.llm = None
        self.qa_chain = None
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

        # 4. QA chain
        if self.llm and self.retriever:
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.retriever,
                return_source_documents=True,
                chain_type_kwargs={"prompt": RAG_PROMPT},
            )
            self.status["ready"] = True

    # ── Public API ─────────────────────────────────────────────
    def query(self, question: str):
        """Ask a question. Returns dict with answer + sources, or error string."""
        if not self.qa_chain:
            parts = []
            if not self.status["db"]:
                parts.append("Vector database not found — run 'python ingest.py' first.")
            if not self.status["ollama"]:
                parts.append("Ollama is not running — start it with 'ollama serve'.")
            return " | ".join(parts) if parts else "System not initialized."

        response = self.qa_chain.invoke({"query": question})
        return {
            "answer": response["result"],
            "source_documents": response.get("source_documents", []),
        }

    # ── Helpers ────────────────────────────────────────────────
    @staticmethod
    def _ollama_is_running() -> bool:
        try:
            r = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
            return r.status_code == 200
        except Exception:
            return False
