#!/bin/bash

# Test script for Vercel deployment
# Run this after deployment to verify everything works

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Vercel deployment...${NC}"

# Get the deployment URL from environment or use default
DEPLOYMENT_URL=${VERCEL_URL:-"http://localhost:8080"}

echo -e "${YELLOW}Testing against: $DEPLOYMENT_URL${NC}"

# Test 1: Health check
echo -e "\n${YELLOW}Test 1: Health Check${NC}"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "$DEPLOYMENT_URL/api/health" -o /tmp/health_response)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    cat /tmp/health_response | jq . 2>/dev/null || cat /tmp/health_response
else
    echo -e "${RED}✗ Health check failed with status: $HEALTH_RESPONSE${NC}"
    cat /tmp/health_response
fi

# Test 2: CORS headers
echo -e "\n${YELLOW}Test 2: CORS Headers${NC}"
CORS_RESPONSE=$(curl -s -I -X OPTIONS "$DEPLOYMENT_URL/api/health" | grep -i "access-control-allow-origin" || echo "No CORS headers found")
if [[ "$CORS_RESPONSE" == *"access-control-allow-origin"* ]]; then
    echo -e "${GREEN}✓ CORS headers present${NC}"
    echo "$CORS_RESPONSE"
else
    echo -e "${RED}✗ CORS headers missing${NC}"
fi

# Test 3: Registration endpoint (should return 400 for missing data)
echo -e "\n${YELLOW}Test 3: Registration Endpoint${NC}"
REG_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$DEPLOYMENT_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{}' -o /tmp/reg_response)
if [ "$REG_RESPONSE" = "400" ]; then
    echo -e "${GREEN}✓ Registration endpoint responds correctly to invalid data${NC}"
    cat /tmp/reg_response | jq . 2>/dev/null || cat /tmp/reg_response
else
    echo -e "${RED}✗ Registration endpoint unexpected response: $REG_RESPONSE${NC}"
    cat /tmp/reg_response
fi

# Test 4: 404 for non-existent endpoint
echo -e "\n${YELLOW}Test 4: 404 Handling${NC}"
NOTFOUND_RESPONSE=$(curl -s -w "%{http_code}" "$DEPLOYMENT_URL/api/nonexistent" -o /tmp/notfound_response)
if [ "$NOTFOUND_RESPONSE" = "404" ]; then
    echo -e "${GREEN}✓ 404 handling works correctly${NC}"
else
    echo -e "${RED}✗ 404 handling failed: $NOTFOUND_RESPONSE${NC}"
    cat /tmp/notfound_response
fi

# Test 5: API structure
echo -e "\n${YELLOW}Test 5: API Structure${NC}"
echo "Available endpoints:"
echo "  - GET  /api/health"
echo "  - POST /api/v1/auth/register"
echo "  - POST /api/v1/auth/login"
echo "  - POST /api/v1/auth/logout"
echo "  - GET  /api/v1/users/profile"
echo "  - PUT  /api/v1/users/profile"
echo "  - GET  /api/v1/accounts"
echo "  - POST /api/v1/accounts"
echo "  - GET  /api/v1/accounts/:id"
echo "  - GET  /api/ledger/accounts"
echo "  - POST /api/ledger/accounts"
echo "  - POST /api/ledger/transfers"
echo "  - GET  /api/kyc/dashboard"
echo "  - POST /api/kyc/start"
echo "  - GET  /api/kyc/status/:id"

echo -e "\n${GREEN}Deployment test completed!${NC}"

# Cleanup
rm -f /tmp/health_response /tmp/reg_response /tmp/notfound_response 