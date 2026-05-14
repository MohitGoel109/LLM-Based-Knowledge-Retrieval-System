#!/bin/bash

echo "🚀 Simple Vercel Deployment"
echo "=========================="

# Build frontend first
echo "🏗️  Building frontend..."
cd web-app
npm run build
cd ..

# Deploy with specific project name
echo "🌐 Deploying to Vercel..."
vercel --prod --name krmai-chatbot --confirm

echo "✅ Deployment complete!"