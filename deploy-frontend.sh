#!/bin/bash

echo "🚀 Deploying KRMAI Frontend to Vercel"
echo "===================================="

# Navigate to frontend directory
cd web-app

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🏗️  Building frontend..."
npm run build

echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Set VITE_API_URL environment variable in Vercel dashboard"
echo "2. Make sure your backend is deployed to Render"
echo "3. Test your deployed application"