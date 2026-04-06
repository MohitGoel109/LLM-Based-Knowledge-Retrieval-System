#!/bin/bash

echo "🚀 Deploying KRMAI Minimal Version to Vercel"
echo "==============================================="

# Build frontend first
echo "🏗️  Building frontend..."
cd web-app
npm run build
cd ..

echo "🌐 Deploying minimal backend + frontend to Vercel..."
vercel --prod --confirm

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - GROQ_API_KEY=your_groq_api_key_here"
echo "   - GROQ_MODEL=llama-3.3-70b-versatile"
echo "2. Test your API endpoints:"
echo "   - https://your-app.vercel.app/api/health"
echo "   - https://your-app.vercel.app/api/chat"
echo "3. Share your Vercel URL!"