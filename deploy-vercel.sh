#!/bin/bash

echo "🚀 Deploying KRMAI Frontend to Vercel"
echo "===================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to frontend directory
cd web-app

echo "📦 Building frontend..."
npm run build

echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set VITE_API_URL environment variable in Vercel dashboard"
echo "2. Make sure your backend is deployed (Render/Railway)"
echo "3. Test your deployed application"