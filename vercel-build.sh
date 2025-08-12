#!/bin/bash

# Vercel Build Script for Scaler AI Funnel
echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci
cd client && npm ci && cd ..

# Build client application
echo "🏗️ Building client application..."
npm run build:client

# Verify build output
if [ -d "client/build" ]; then
    echo "✅ Client build completed successfully"
    echo "📁 Build output: client/build/"
    ls -la client/build/
else
    echo "❌ Client build failed"
    exit 1
fi

echo "🎉 Build process completed successfully!"
