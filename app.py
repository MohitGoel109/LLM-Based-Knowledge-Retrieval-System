import os
import streamlit as st
from rag_engine import RAGEngine

# ── Page config ────────────────────────────────────────────────
st.set_page_config(page_title="College Knowledge Retrieval", page_icon="📚", layout="wide")

# ── Session state ──────────────────────────────────────────────
if "messages" not in st.session_state:
    st.session_state.messages = []

if "rag_engine" not in st.session_state:
    with st.spinner("Loading RAG engine (first launch may download embeddings)..."):
        st.session_state.rag_engine = RAGEngine()

engine: RAGEngine = st.session_state.rag_engine

# ── Sidebar ────────────────────────────────────────────────────
with st.sidebar:
    st.title("📚 Knowledge Base")
    st.markdown("---")

    st.subheader("System Status")
    if engine.status["db"]:
        st.success("✅ Vector Database Loaded")
    else:
        st.error("❌ Vector Database Not Found")

    if engine.status["ollama"]:
        st.success("✅ Ollama LLM Connected")
    else:
        st.error("❌ Ollama Not Running")

    if engine.status["ready"]:
        st.success("✅ RAG Pipeline Ready")
    else:
        st.warning("⚠️ System Not Ready")

    st.markdown("---")
    st.markdown("### Setup Steps")
    st.markdown("1. Install [Ollama](https://ollama.com)")
    st.markdown("2. Run `ollama pull llama3.2:3b`")
    st.markdown("3. Put documents in `data/` folder")
    st.markdown("4. Run `python ingest.py`")
    st.markdown("5. Ask questions here!")

    st.markdown("---")
    if st.button("🔄 Reload Engine"):
        st.session_state.rag_engine = RAGEngine()
        st.rerun()

# ── Main chat ──────────────────────────────────────────────────
st.header("🤖 College Knowledge Assistant")
st.caption("Ask questions about college documents — answers are grounded in uploaded files.")

# Display chat history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# User input
if prompt := st.chat_input("Ask a question about college documents..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        placeholder = st.empty()

        with st.spinner("Searching documents and thinking..."):
            result = engine.query(prompt)

            if isinstance(result, str):
                full_response = result
            else:
                answer = result["answer"]
                sources = result.get("source_documents", [])

                full_response = answer

                if sources:
                    full_response += "\n\n---\n**📄 Sources:**\n"
                    seen = set()
                    for doc in sources:
                        src = doc.metadata.get("source", "Unknown")
                        page = doc.metadata.get("page", "N/A")
                        key = f"{src}-{page}"
                        if key not in seen:
                            seen.add(key)
                            full_response += f"- *{src}* (Page {page})\n"

        placeholder.markdown(full_response)

    st.session_state.messages.append({"role": "assistant", "content": full_response})
