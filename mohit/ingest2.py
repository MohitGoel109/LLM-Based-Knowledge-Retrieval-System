import os
import shutil
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# ── Configuration ──────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
CHROMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db")
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

def load_documents(data_dir):
    """Loads PDFs, DOCX, and TXT files from the data directory."""
    documents = []
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"Created '{data_dir}' directory. Please add documents there.")
        return []

    supported = {".pdf": PyPDFLoader, ".docx": Docx2txtLoader, ".txt": TextLoader}
    for filename in sorted(os.listdir(data_dir)):
        ext = os.path.splitext(filename)[1].lower()
        file_path = os.path.join(data_dir, filename)
        loader_cls = supported.get(ext)
        if loader_cls:
            try:
                loader = loader_cls(file_path)
                docs = loader.load()
                # Tag every doc with the original filename for citations
                for doc in docs:
                    doc.metadata["source"] = filename
                documents.extend(docs)
                print(f"  Loaded: {filename} ({len(docs)} page(s))")
            except Exception as e:
                print(f"  Error loading {filename}: {e}")
        else:

