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
            print(f"  Skipping unsupported file: {filename}")

    return documents


def chunk_documents(documents):
    """Splits documents into smaller overlapping chunks."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(documents)


def create_vector_store(chunks):
    """Creates the ChromaDB vector store (wipes old DB first for a clean rebuild)."""
    if not chunks:
        print("No chunks to ingest.")
        return

    # Wipe stale DB so we always have a clean, consistent store
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)
        print(f"Cleared old vector store at {CHROMA_PATH}")

    print("Initializing embedding model (first run downloads ~80 MB)...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    print(f"Creating vector store...")
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
