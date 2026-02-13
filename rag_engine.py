from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import os

# Configuration
CHROMA_PATH = "chroma_db"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
LLM_MODEL = "llama3" # Ensure you have this pulled in Ollama: `ollama pull llama3`

class RAGEngine:
    def __init__(self):
        self.vector_store = None
        self.retriever = None
        self.llm = None
        self.qa_chain = None
        self._initialize()

    def _initialize(self):
        # 1. Initialize Embeddings
        self.embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

        # 2. Check if Vector Store exists
        if os.path.exists(CHROMA_PATH) and os.path.isdir(CHROMA_PATH):
             self.vector_store = Chroma(
                persist_directory=CHROMA_PATH,
                embedding_function=self.embeddings
            )
             self.retriever = self.vector_store.as_retriever(
                 search_kwargs={"k": 3} # Retrieve top 3 relevant chunks
             )
        else:
             print("Warning: ChromaDB not found. Please run ingest.py first.")

        # 3. Initialize LLM (Ollama)
        try:
            self.llm = Ollama(model=LLM_MODEL)
        except Exception as e:
            print(f"Error initializing Ollama: {e}. Make sure Ollama is running.")

        # 4. Create QA Chain
        if self.llm and self.retriever:
            prompt_template = \"\"\"Use the following pieces of context to answer the question at the end. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context:
{context}

Question: {question}

Answer:\"\"\"
            PROMPT = PromptTemplate(
                template=prompt_template, input_variables=["context", "question"]
            )
            
            self.qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.retriever,
                return_source_documents=True,
                chain_type_kwargs={"prompt": PROMPT}
            )

    def query(self, question):
        if not self.qa_chain:
            return "System not initialized properly. Please ingest documents and ensure Ollama is running."
        
        response = self.qa_chain.invoke({"query": question})
        return {
            "answer": response["result"],
            "source_documents": response["source_documents"]
        }
