#!/bin/bash

# 🚀 Fintech App Deployment Script
# This script helps you deploy your fintech application to Railway

set -e

echo "🚀 Starting Fintech App Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
        print_success "Railway CLI installed successfully!"
    else
        print_success "Railway CLI is already installed"
    fi
}

# Check if user is logged into Railway
check_railway_login() {
    if ! railway whoami &> /dev/null; then
        print_warning "Not logged into Railway. Please login..."
        railway login
    else
        print_success "Already logged into Railway"
    fi
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."
    
    # Set environment variables for frontend
    if [ -n "$BACKEND_URL" ] && [ -n "$GRPC_URL" ]; then
        railway variables set VITE_API_URL=$BACKEND_URL
        railway variables set VITE_GRPC_URL=$GRPC_URL
        print_success "Frontend environment variables set"
    else
        print_warning "Backend URLs not provided. You'll need to set them manually in Railway dashboard"
    fi
    
    # Deploy frontend
    railway up --service frontend
    print_success "Frontend deployed successfully!"
}

# Deploy backend APIs
deploy_backend() {
    print_status "Deploying backend APIs..."
    
    cd backend
    
    # Set environment variables for backend
    if [ -n "$DATABASE_URL" ]; then
        railway variables set DATABASE_URL=$DATABASE_URL
        railway variables set PORT=8080
        railway variables set ENVIRONMENT=production
        print_success "Backend environment variables set"
    else
        print_warning "Database URL not provided. You'll need to set it manually in Railway dashboard"
    fi
    
    # Deploy backend
    railway up --service backend
    print_success "Backend APIs deployed successfully!"
    
    cd ..
}

# Deploy gRPC server
deploy_grpc() {
    print_status "Deploying gRPC server..."
    
    cd backend
    
    # Set environment variables for gRPC server
    if [ -n "$DATABASE_URL" ]; then
        railway variables set DATABASE_URL=$DATABASE_URL
        railway variables set PORT=50051
        railway variables set ENVIRONMENT=production
        print_success "gRPC server environment variables set"
    else
        print_warning "Database URL not provided. You'll need to set it manually in Railway dashboard"
    fi
    
    # Deploy gRPC server with custom start command
    railway up --service grpc-server --start-command "go run cmd/grpc-server/main.go"
    print_success "gRPC server deployed successfully!"
    
    cd ..
}

# Main deployment function
main() {
    print_status "Starting deployment process..."
    
    # Check prerequisites
    check_railway_cli
    check_railway_login
    
    # Get deployment URLs from user
    echo
    print_status "Please provide the following URLs (or press Enter to skip and set manually):"
    read -p "Backend API URL (e.g., https://your-backend.railway.app): " BACKEND_URL
    read -p "gRPC Server URL (e.g., https://your-grpc.railway.app): " GRPC_URL
    read -p "Database URL (from Railway PostgreSQL service): " DATABASE_URL
    
    echo
    print_status "Deploying services..."
    
    # Deploy services
    deploy_frontend
    deploy_backend
    deploy_grpc
    
    echo
    print_success "🎉 Deployment completed successfully!"
    echo
    print_status "Next steps:"
    echo "1. Check your Railway dashboard for service URLs"
    echo "2. Test your endpoints:"
    echo "   - Frontend: https://your-frontend.railway.app"
    echo "   - Backend APIs: https://your-backend.railway.app/health"
    echo "   - gRPC Server: https://your-grpc.railway.app/health"
    echo "3. Set up custom domains if needed"
    echo "4. Configure monitoring and alerts"
    echo
    print_status "For troubleshooting, run: railway logs"
}

# Run main function
main "$@" 