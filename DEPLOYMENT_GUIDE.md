# Deployment Guide for KRMAI Chatbot

## Frontend Deployment (Vercel)

### 1. Prepare Frontend for Deployment

```bash
cd web-app
npm install
npm run build
```

### 2. Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd web-app
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project in Vercel
   - Settings → Environment Variables
   - Add: `VITE_API_URL` = your backend API URL (see below)

## Backend Deployment (Render/Railway)

### Option A: Render (Recommended)

1. **Create account on [render.com](https://render.com)**

2. **Create Web Service**:
   - Connect your GitHub repository
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn api:app --host 0.0.0.0 --port $PORT --workers 1`
   - Environment Variables:
     - `LLM_PROVIDER` = groq
     - `GROQ_API_KEY` = your_groq_api_key
     - `GROQ_MODEL` = llama-3.3-70b-versatile
     - `PYTHON_VERSION` = 3.11

3. **Get Backend URL**: After deployment, copy the URL (e.g., `https://your-app.onrender.com`)

### Option B: Railway

1. **Create account on [railway.app](https://railway.app)**

2. **Deploy**:
   - Connect your GitHub repository
   - Railway will auto-detect Python app
   - Set environment variables as above

## Environment Variables

### Frontend (Vercel)
- `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.onrender.com`)

### Backend (Render/Railway)
- `LLM_PROVIDER`: groq or ollama
- `GROQ_API_KEY`: Your Groq API key
- `GROQ_MODEL`: Model name (e.g., llama-3.3-70b-versatile)
- `OLLAMA_MODEL`: Model name if using Ollama
- `OLLAMA_BASE_URL`: Ollama server URL
- `PYTHON_VERSION`: 3.11 (recommended)

## Important Notes

1. **Backend First**: Deploy the backend first to get the API URL
2. **CORS**: The backend is configured to allow all origins for development
3. **Storage**: ChromaDB data is stored locally in `chroma_db/` directory
4. **Performance**: Backend initialization may take 2-3 minutes on first startup

## Testing Deployment

1. After deploying backend, test the health endpoint:
   ```
   GET https://your-backend.onrender.com/health
   ```

2. After deploying frontend, test the complete flow:
   - Open your Vercel URL
   - Try asking a question
   - Check browser console for any errors

## Troubleshooting

- **CORS errors**: Ensure backend allows your Vercel domain
- **API connection errors**: Check `VITE_API_URL` environment variable
- **Slow responses**: Backend may be initializing models (first request)
- **Build failures**: Ensure Python 3.11 and all dependencies are compatible
