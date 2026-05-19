import os
import shutil

from langchain_chroma import Chroma
from langchain_community.document_loaders import Docx2txtLoader, PyPDFLoader, TextLoader
from backend.services.nim_embeddings import NIMEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
CHROMA_PATH = os.path.join(BASE_DIR, "chroma_db")
EMBEDDING_MODEL = "nvidia/nv-embedqa-e5-v5"
NIM_API_KEY = os.getenv("NIM_API_KEY")
NIM_BASE_URL = os.getenv("NIM_BASE_URL", "https://integrate.api.nvidia.com/v1")
CHUNK_SIZE = 1500
CHUNK_OVERLAP = 300


def load_documents(data_dir: str) -> list:
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
                for doc in docs:
                    if not hasattr(doc, "metadata") or doc.metadata is None:
                        doc.metadata = {"source": filename}
                    else:
                        doc.metadata["source"] = filename
                documents.extend(docs)
                print(f"  Loaded: {filename} ({len(docs)} page(s))")
            except Exception as e:
                print(f"  Error loading {filename}: {e}")
        else:
            print(f"  Skipping unsupported file: {filename}")
    return documents


def chunk_documents(documents: list) -> list:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        is_separator_regex=False,
        separators=["\n\n\n", "\n\n", "\n---", "\n===", "\n~~~", "\n", " ", ""],
    )
    return text_splitter.split_documents(documents)


def create_vector_store(chunks: list) -> None:
    if not chunks:
        print("No chunks to ingest.")
        return

    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)
        print(f"Cleared old vector store at {CHROMA_PATH}")

    print("Initializing NIM embedding model...")
    if not NIM_API_KEY or NIM_API_KEY == "your-nvapi-key-here":
        print("ERROR: NIM_API_KEY is not set. Set it in your .env file.")
        return
    embeddings = NIMEmbeddings(
        api_key=NIM_API_KEY,
        base_url=NIM_BASE_URL,
        model=EMBEDDING_MODEL,
    )

    print("Creating vector store...")
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH,
    )
    print(f"Successfully ingested {len(chunks)} chunks into ChromaDB at {CHROMA_PATH}")


def main():
    print(f"{'=' * 50}")
    print(f"  Document Ingestion Pipeline")
    print(f"{'=' * 50}")
    print(f"\nLoading documents from {DATA_DIR}...")
    documents = load_documents(DATA_DIR)

    if documents:
        print(f"\nTotal: {len(documents)} document pages loaded.")
        chunks = chunk_documents(documents)
        print(f"Split into {len(chunks)} chunks (size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP}).\n")
        create_vector_store(chunks)
    else:
        print("\nNo documents found. Add PDF, DOCX, or TXT files to the 'data/' folder.")

    print(f"\n{'=' * 50}")


if __name__ == "__main__":
    main()
