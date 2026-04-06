#!/bin/bash

echo "🚀 Deploying KRMAI Full Stack to Vercel"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🏗️  Building frontend..."
cd web-app
npm run build
cd ..

echo "🌐 Deploying backend + frontend to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - GROQ_API_KEY=your_groq_api_key_here"
echo "   - LLM_PROVIDER=groq"
echo "   - GROQ_MODEL=llama-3.3-70b-versatile"
echo "2. Test your API endpoints:"
echo "   - https://your-app.vercel.app/api/health"
echo "   - https://your-app.vercel.app/api/chat"
echo "3. Share your Vercel URL!"