#!/bin/bash

# Vercel Deployment Script
# This script automates the deployment process and includes all necessary checks

set -e

echo "🚀 Starting Vercel deployment process..."

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

# Check if we're in the right directory
if [ ! -f "go.mod" ]; then
    print_error "go.mod not found. Please run this script from the api directory."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it with: npm i -g vercel"
    exit 1
fi

# Step 1: Run deployment tests
print_status "Running deployment tests..."
if [ -f "test-deployment.sh" ]; then
    chmod +x test-deployment.sh
    if ./test-deployment.sh; then
        print_success "Deployment tests passed"
    else
        print_error "Deployment tests failed. Please fix the issues before deploying."
        exit 1
    fi
else
    print_warning "test-deployment.sh not found, skipping tests"
fi

# Step 2: Check environment variables
print_status "Checking environment variables..."

# Required environment variables
REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    else
        print_success "$var is set"
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_warning "Some required environment variables are not set locally:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    print_status "These will need to be set in your Vercel project settings."
    echo ""
fi

# Step 3: Clean and prepare
print_status "Cleaning and preparing for deployment..."

# Clean any previous builds
rm -rf .vercel
rm -f main

# Tidy Go modules
if go mod tidy; then
    print_success "Go modules cleaned"
else
    print_error "Failed to clean Go modules"
    exit 1
fi

# Step 4: Test build
print_status "Testing build..."
if go build -o test-build .; then
    print_success "Build test successful"
    rm -f test-build
else
    print_error "Build test failed"
    exit 1
fi

# Step 5: Check vercel.json
print_status "Checking vercel.json configuration..."
if [ -f "../vercel.json" ]; then
    if grep -q "api/index.go" ../vercel.json; then
        print_success "vercel.json is properly configured"
    else
        print_error "vercel.json does not point to api/index.go"
        exit 1
    fi
else
    print_error "vercel.json not found in parent directory"
    exit 1
fi

# Step 6: Deploy to Vercel
print_status "Deploying to Vercel..."

# Check if we should deploy to production
if [ "$1" = "--prod" ]; then
    print_status "Deploying to production..."
    if vercel --prod; then
        print_success "Production deployment successful!"
    else
        print_error "Production deployment failed"
        exit 1
    fi
else
    print_status "Deploying to preview..."
    if vercel; then
        print_success "Preview deployment successful!"
    else
        print_error "Preview deployment failed"
        exit 1
    fi
fi

echo ""
print_success "Deployment completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Check your Vercel dashboard for the deployment URL"
echo "2. Test the health endpoint: curl https://your-app.vercel.app/api/health"
echo "3. Set environment variables in Vercel dashboard if not already done"
echo "4. Test your API endpoints"
echo ""
print_status "Environment variables to set in Vercel:"
for var in "${REQUIRED_VARS[@]}"; do
    echo "   - $var"
done
echo ""
print_status "For more information, see DEPLOYMENT_GUIDE.md" 