import os
import argparse
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# Configuration
DATA_DIR = "data"
CHROMA_PATH = "chroma_db"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

def load_documents(data_dir):
    """Loads PDFs, DOCX, and TXT files from the data directory."""
    documents = []
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        print(f"Created {data_dir} directory. Please add documents there.")
        return []

    for filename in os.listdir(data_dir):
        file_path = os.path.join(data_dir, filename)
        if filename.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())
        elif filename.endswith(".docx"):
            loader = Docx2txtLoader(file_path)
            documents.extend(loader.load())
        elif filename.endswith(".txt"):
            loader = TextLoader(file_path)
            documents.extend(loader.load())
        else:
            print(f"Skipping unsupported file: {filename}")
    
    return documents

def chunk_documents(documents):
    """Splits documents into smaller chunks."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_documents(documents)
    return chunks

def create_vector_store(chunks):
    """Creates/Updates the vector store."""
    if not chunks:
        print("No documents to ingest.")
        return

    # Initialize Embedding Model
    print("Initializing embedding model...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    # Create/Update ChromaDB
    print(f"Creating/Updating Vector Store in {CHROMA_PATH}...")
    
    # Check if DB already exists to append/update vs create new
    # For simplicity in this script, we'll just persist to the directory
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH
    )
    print(f"Successfully ingested {len(chunks)} chunks into ChromaDB.")

def main():
    print(f"Loading documents from {DATA_DIR}...")
    documents = load_documents(DATA_DIR)
    
    if documents:
        print(f"Loaded {len(documents)} documents.")
        chunks = chunk_documents(documents)
        print(f"Split into {len(chunks)} chunks.")
        
        create_vector_store(chunks)
    else:
        print("No documents found to ingest.")

if __name__ == "__main__":
    main()
