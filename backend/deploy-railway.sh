#!/bin/bash

# Railway Deployment Script for Go Backend
# This script helps set up and deploy the Go backend to Railway

set -e

echo "🚀 Railway Deployment Script for Go Backend"
echo "=========================================="

# Check if we're in the backend directory
if [ ! -f "go.mod" ]; then
    echo "❌ Error: This script must be run from the backend directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected files: go.mod, main.go"
    exit 1
fi

echo "✅ Backend directory detected"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

echo "✅ Railway CLI available"

# Check if user is logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

echo "✅ Railway authentication confirmed"

# Check if we're in a Railway project
if ! railway status &> /dev/null; then
    echo "📁 Initializing Railway project..."
    railway init
fi

echo "✅ Railway project initialized"

# Show current services
echo "📋 Current Railway services:"
railway status

echo ""
echo "🔧 Next steps:"
echo "1. Deploy the main backend service:"
echo "   railway up"
echo ""
echo "2. Deploy the gRPC service (in a separate Railway project or service):"
echo "   railway up --service grpc-server"
echo ""
echo "3. Set environment variables:"
echo "   railway variables set DATABASE_URL=your_postgresql_url"
echo "   railway variables set PORT=8080"
echo "   railway variables set ENVIRONMENT=production"
echo ""
echo "4. Check deployment status:"
echo "   railway logs"
echo "   railway status"
echo ""
echo "🎉 Deployment script completed!" 