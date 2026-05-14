# Skip Embedding Loading for Cloud Deployment

Add this environment variable to skip heavy embedding model loading:

```bash
SKIP_EMBEDDINGS=true
```

This will prevent the RAG engine from loading sentence-transformers models, which is useful for:
- Cloud deployments with limited RAM
- When using Groq API (no need for local embeddings)
- Faster startup times