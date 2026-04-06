# 🚀 Vercel Deployment Guide for KRMAI

## 📋 What We've Set Up

### ✅ Backend (Python FastAPI)
- **Vercel-optimized API**: `api_vercel.py` with serverless support
- **Proper requirements**: `requirements-vercel.txt` with exact versions
- **Environment variables**: Ready for Groq API configuration
- **Health endpoint**: `/api/health` for monitoring

### ✅ Frontend (React + Vite)
- **Vercel configuration**: `vercel.json` with proper routing
- **Build optimized**: Already configured for production
- **API integration**: Uses `VITE_API_URL` environment variable

### ✅ Deployment Script
- **One-command deployment**: `./deploy-full-vercel.sh`
- **Automatic setup**: Installs Vercel CLI if needed

## 🚀 Quick Deployment

### Option 1: One-Command Deployment
```bash
./deploy-full-vercel.sh
```

### Option 2: Manual Deployment
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy
vercel --prod
```

## ⚙️ Environment Variables (Required)

After deployment, set these in your Vercel dashboard:

| Variable | Value | Description |
|----------|-------|-------------|
| `GROQ_API_KEY` | `your_groq_api_key` | Your Groq API key |
| `LLM_PROVIDER` | `groq` | LLM provider |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model |

## 🔍 Testing Your Deployment

### Test Backend API
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Chat test
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the admission requirements?"}'
```

### Test Frontend
1. Open your Vercel URL in browser
2. Try asking questions in the chat interface
3. Check browser console for any errors

## 🎯 Expected Behavior

- **Fast startup**: No heavy model loading (uses Groq API)
- **Immediate response**: Health endpoint works instantly
- **Streaming chat**: Real-time responses from Groq
- **Document retrieval**: Uses pre-loaded ChromaDB data

## 📁 Project Structure for Vercel

```
├── api_vercel.py          # Vercel-optimized FastAPI app
├── vercel.json            # Vercel configuration
├── requirements-vercel.txt # Python dependencies
├── api/__init__.py        # Python package marker
├── web-app/               # React frontend
│   ├── vercel.json       # Frontend config
│   ├── package.json      # Node.js dependencies
│   └── src/              # React source code
└── chroma_db/            # Vector database (deployed with code)
```

## 🔧 Troubleshooting

### Common Issues

1. **Missing environment variables**: Set all required vars in Vercel dashboard
2. **API connection errors**: Check Groq API key is valid
3. **Build failures**: Ensure all dependencies are in requirements-vercel.txt
4. **CORS errors**: Backend allows all origins

### Logs and Monitoring
- Check Vercel dashboard for build/deployment logs
- Monitor function execution in Vercel analytics
- Use browser developer tools for frontend debugging

## 🎉 Success Indicators

- ✅ Health endpoint returns `{"status": "healthy"}`
- ✅ Chat endpoint responds with answers
- ✅ Frontend loads without errors
- ✅ Streaming works in real-time

Your KRMAI chatbot should now be fully deployed and working on Vercel! 🚀