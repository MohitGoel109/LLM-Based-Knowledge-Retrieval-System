import streamlit as st
import time
from rag_engine import RAGEngine

# Page Config
st.set_page_config(page_title="College Knowledge Retrieval", page_icon="📚", layout="wide")

# Styling
st.markdown(\"\"\"
    <style>
    .chat-message {
        padding: 1.5rem; border-radius: 0.5rem; margin-bottom: 1rem; display: flex
    }
    .chat-message.user {
        background-color: #2b313e
    }
    .chat-message.bot {
        background-color: #475063
    }
    .chat-message .avatar {
      width: 20%;
    }
    .chat-message .avatar img {
      max-width: 78px;
      max-height: 78px;
      border-radius: 50%;
      object-fit: cover;
    }
    .chat-message .message {
      width: 80%;
      padding: 0 1.5rem;
      color: #fff;
    }
    </style>
\"\"\", unsafe_allow_html=True)

# Initialize Session State
if "messages" not in st.session_state:
    st.session_state.messages = []

if "rag_engine" not in st.session_state:
    st.session_state.rag_engine = RAGEngine()

# Sidebar
with st.sidebar:
    st.title("📚 Knowledge Base")
    st.markdown("---")
    st.subheader("System Status")
    if st.session_state.rag_engine.vector_store:
        st.success("Vector Database Loaded")
    else:
        st.error("Vector Database Not Found. Please run `ingest.py`.")
    
    st.markdown("---")
    st.markdown("### How to use")
    st.markdown("1. Put PDFs in `data/` folder.")
    st.markdown("2. Run `python ingest.py` in terminal.")
    st.markdown("3. Ask questions here!")

# Main Chat Interface
st.header("🤖 College Knowledge Assistant")

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# User Input
if prompt := st.chat_input("Ask a question about college documents..."):
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Generate response
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""
        
        with st.spinner("Searching documents and thinking..."):
            result = st.session_state.rag_engine.query(prompt)
            
            if isinstance(result, str):
                full_response = result
            else:
                answer = result["answer"]
                sources = result["source_documents"]
                
                full_response = answer
                
                if sources:
                    full_response += "\n\n**Sources:**\n"
                    for i, doc in enumerate(sources):
                        source_name = doc.metadata.get('source', 'Unknown')
                        page_num = doc.metadata.get('page', 'N/A')
                        full_response += f"- *{os.path.basename(source_name)}* (Page {page_num})\n"

        message_placeholder.markdown(full_response)
    
    # Add assistant response to chat history
    st.session_state.messages.append({"role": "assistant", "content": full_response})
