#!/bin/bash

# Verification script for Vercel deployment
# Run this before deploying to ensure everything is ready

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verifying deployment readiness...${NC}"

# Check 1: Required files exist
echo -e "\n${YELLOW}Check 1: Required Files${NC}"
REQUIRED_FILES=(
    "index.go"
    "go.mod"
    "go.sum"
    "api/index.go"
    "api/health.go"
    "api/auth.go"
    "api/users.go"
    "api/accounts.go"
    "api/ledger.go"
    "api/kyc.go"
    "api/grpc_bridge.go"
    "internal/config/config.go"
    "internal/database/database.go"
    "internal/middleware/auth.go"
    "internal/middleware/cors.go"
    "pkg/logger/logger.go"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file (missing)${NC}"
        exit 1
    fi
done

# Check 2: No protobuf files in root
echo -e "\n${YELLOW}Check 2: Protobuf Files Location${NC}"
if [ -z "$(find . -maxdepth 1 -name '*.pb.go' 2>/dev/null)" ]; then
    echo -e "${GREEN}✓ No .pb.go files in root directory${NC}"
else
    echo -e "${RED}✗ Found .pb.go files in root directory${NC}"
    find . -maxdepth 1 -name '*.pb.go'
    exit 1
fi

# Check 3: Build works
echo -e "\n${YELLOW}Check 3: Build Test${NC}"
if go build -ldflags "-s -w" -o /tmp/verification-build .; then
    echo -e "${GREEN}✓ Build successful${NC}"
    rm -f /tmp/verification-build
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Check 4: Dependencies are tidy
echo -e "\n${YELLOW}Check 4: Dependencies${NC}"
if go mod tidy; then
    echo -e "${GREEN}✓ Dependencies are tidy${NC}"
else
    echo -e "${RED}✗ Dependencies need fixing${NC}"
    exit 1
fi

# Check 5: Module name is correct
echo -e "\n${YELLOW}Check 5: Module Configuration${NC}"
MODULE_NAME=$(grep "^module " go.mod | cut -d' ' -f2)
if [ "$MODULE_NAME" = "fintech-api" ]; then
    echo -e "${GREEN}✓ Module name is correct: $MODULE_NAME${NC}"
else
    echo -e "${RED}✗ Module name is incorrect: $MODULE_NAME${NC}"
    exit 1
fi

# Check 6: Vercel configuration
echo -e "\n${YELLOW}Check 6: Vercel Configuration${NC}"
if [ -f "../vercel.json" ]; then
    echo -e "${GREEN}✓ Root vercel.json exists${NC}"
    if grep -q "api/index.go" ../vercel.json; then
        echo -e "${GREEN}✓ Vercel config points to correct function${NC}"
    else
        echo -e "${RED}✗ Vercel config missing function reference${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Root vercel.json missing${NC}"
    exit 1
fi

# Check 7: .vercelignore doesn't exclude necessary files
echo -e "\n${YELLOW}Check 7: .vercelignore Configuration${NC}"
if [ -f "../.vercelignore" ]; then
    if grep -q "api/internal/" ../.vercelignore; then
        echo -e "${RED}✗ .vercelignore still excludes api/internal/${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ .vercelignore doesn't exclude api/internal/${NC}"
    fi
    
    if grep -q "api/pkg/" ../.vercelignore; then
        echo -e "${RED}✗ .vercelignore still excludes api/pkg/${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ .vercelignore doesn't exclude api/pkg/${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No .vercelignore file found${NC}"
fi

echo -e "\n${GREEN}✅ All checks passed! Ready for deployment.${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Run: vercel --prod"
echo "3. Test with: ./test-deployment.sh" 