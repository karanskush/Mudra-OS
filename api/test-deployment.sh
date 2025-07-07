#!/bin/bash

# Test deployment script for Vercel
echo "🚀 Testing Vercel deployment..."

# Check if we're in the right directory
if [ ! -f "go.mod" ]; then
    echo "❌ Error: go.mod not found. Please run this script from the api directory."
    exit 1
fi

# Check if required environment variables are set
echo "📋 Checking environment variables..."

# Required environment variables for deployment
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    else
        echo "✅ $var is set"
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set these environment variables in your Vercel project settings."
    exit 1
fi

# Test Go build
echo "🔨 Testing Go build..."
if go build -o test-build .; then
    echo "✅ Go build successful"
    rm -f test-build
else
    echo "❌ Go build failed"
    exit 1
fi

# Test Go modules
echo "📦 Testing Go modules..."
if go mod tidy; then
    echo "✅ Go modules are clean"
else
    echo "❌ Go modules have issues"
    exit 1
fi

# Test configuration loading
echo "⚙️  Testing configuration loading..."
if go run -c "package main; import 'fintech-api/pkg/config'; func main() { cfg, err := config.Load(); if err != nil { panic(err) }; println('Config loaded successfully') }" .; then
    echo "✅ Configuration loading successful"
else
    echo "❌ Configuration loading failed"
    exit 1
fi

# Test database connection (if DATABASE_URL is available)
if [ -n "$DATABASE_URL" ]; then
    echo "🗄️  Testing database connection..."
    if go run -c "package main; import ('fintech-api/pkg/config'; 'fintech-api/pkg/database'; 'fintech-api/pkg/logger'); func main() { logger.Init('info', 'json'); cfg, _ := config.Load(); if err := database.Connect(cfg); err != nil { panic(err) }; println('Database connection successful') }" .; then
        echo "✅ Database connection successful"
    else
        echo "❌ Database connection failed"
        exit 1
    fi
else
    echo "⚠️  Skipping database connection test (DATABASE_URL not set)"
fi

# Test Vercel function export
echo "🔍 Testing Vercel function export..."
if grep -q "func Handler" index.go; then
    echo "✅ Handler function found in index.go"
else
    echo "❌ Handler function not found in index.go"
    exit 1
fi

# Check vercel.json configuration
echo "📄 Checking vercel.json configuration..."
if [ -f "../vercel.json" ]; then
    echo "✅ vercel.json found"
    if grep -q "api/index.go" ../vercel.json; then
        echo "✅ vercel.json points to correct entry point"
    else
        echo "❌ vercel.json does not point to api/index.go"
        exit 1
    fi
else
    echo "❌ vercel.json not found in parent directory"
    exit 1
fi

echo ""
echo "🎉 All deployment tests passed!"
echo ""
echo "Next steps:"
echo "1. Commit your changes"
echo "2. Push to your repository"
echo "3. Deploy to Vercel"
echo ""
echo "Make sure these environment variables are set in Vercel:"
for var in "${REQUIRED_VARS[@]}"; do
    echo "   - $var"
done 