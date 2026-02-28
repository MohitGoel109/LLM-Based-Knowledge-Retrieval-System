# LLM-Based Knowledge Retrieval System

A local RAG (Retrieval-Augmented Generation) system for querying internal college documents.

## Features
- **Local Privacy**: Runs locally using Ollama (Llama 3) and ChromaDB.
- **Multi-Format Support**: Ingests PDF, DOCX, and TXT files.
- **Interactive UI**: Built with Streamlit for easy interaction.
- **Citation**: Provides source documents and page numbers for answers.

## Setup

1.  **Install Ollama**: Download from [ollama.com](https://ollama.com/) and run `ollama pull llama3.2:3b`.
2.  **Install Python Dependencies**:
    ```bash
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    ```

## Usage

1.  **Add Documents**: Place your PDF/DOCX files in the `data/` directory.
2.  **Ingest Data**:
    ```bash
    python ingest.py
    ```
3.  **Run Application**:
    ```bash
    streamlit run app.py
    ```