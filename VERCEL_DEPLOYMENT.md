# Vercel Deployment Guide

## Quick Start

### 1. Deploy Backend (Render)

```bash
# Make sure your backend is deployed first!
# Use Render.com with these settings:

# Build Command: pip install -r requirements.txt
# Start Command: uvicorn api:app --host 0.0.0.0 --port $PORT --workers 1
# Python Version: 3.11

# Environment Variables:
# - LLM_PROVIDER=groq
# - GROQ_API_KEY=your_groq_api_key
# - GROQ_MODEL=llama-3.3-70b-versatile
```

### 2. Deploy Frontend (Vercel)

```bash
cd web-app

# Option A: Using Vercel CLI
npm install -g vercel
vercel --prod

# Option B: Using GitHub integration
# 1. Push code to GitHub
# 2. Connect repository to Vercel
# 3. Set build settings:
#    - Framework: Vite
#    - Root Directory: web-app
#    - Build Command: npm run build
#    - Output Directory: dist
```

### 3. Set Environment Variables in Vercel

After deployment, go to your Vercel project dashboard:

1. Settings → Environment Variables
2. Add: `VITE_API_URL` = your backend URL (e.g., `https://your-app.onrender.com`)
3. Redeploy if necessary

## Environment Variables

### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://krmai-backend.onrender.com` |

### Backend (Render)
| Variable | Description | Example |
|----------|-------------|---------|
| `LLM_PROVIDER` | LLM provider | `groq` |
| `GROQ_API_KEY` | Groq API key | `your_key_here` |
| `GROQ_MODEL` | Groq model | `llama-3.3-70b-versatile` |
| `PYTHON_VERSION` | Python version | `3.11` |

## File Structure for Deployment

```
Mini_project/
├── api.py                 # FastAPI backend
├── rag_engine.py          # RAG engine
├── requirements.txt       # Python dependencies
├── web-app/              # React frontend
│   ├── vercel.json       # Vercel configuration
│   ├── package.json      # Node.js dependencies
│   ├── vite.config.js    # Vite configuration
│   ├── src/              # React source code
│   └── dist/             # Built frontend (auto-generated)
└── chroma_db/            # Vector database (persistent)
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Backend allows all origins, but check if your backend URL is correct
2. **API Connection Failed**: Verify `VITE_API_URL` is set correctly in Vercel
3. **Build Failures**: Ensure all dependencies are in package.json
4. **Slow Initial Response**: Backend takes 2-3 minutes to initialize models on first start

### Testing Deployment

1. **Test Backend**: 
   ```bash
   curl https://your-backend.onrender.com/health
   # Should return: {"status":"healthy"}
   ```

2. **Test Frontend**: 
   - Open your Vercel URL
   - Check browser console for errors
   - Try asking a question

### Performance Tips

- Use Groq for faster responses
- Backend uses background initialization to avoid blocking
- Frontend is optimized with Vite build
- Consider CDN for static assets

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify environment variables are set
3. Ensure backend is running and accessible
4. Check Render/Vercel logs for deployment issues

## Notes

- The backend must be deployed first to get the API URL
- ChromaDB data persists in the `chroma_db/` directory
- First backend startup may take longer due to model downloads
- Vercel automatically handles HTTPS and CDN distribution
