#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Starting gRPC Streaming Demo Server${NC}"
echo -e "${CYAN}=====================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies.${NC}"
    exit 1
fi

echo -e "${BLUE}🔧 Making demo script executable...${NC}"
chmod +x demo-script.js

echo -e "${YELLOW}⚡ Starting the server...${NC}"
echo -e "${CYAN}📡 Server will be available at: http://localhost:8080${NC}"
echo -e "${CYAN}📊 Admin panel: http://localhost:8080/api/admin/streams${NC}"
echo -e "${CYAN}🔍 Health check: http://localhost:8080/api/grpc/health${NC}"

echo -e "${MAGENTA}📋 Available streaming endpoints:${NC}"
echo -e "${GREEN}   • Payment: http://localhost:8080/api/grpc/payment/stream?userId=demo${NC}"
echo -e "${GREEN}   • KYC: http://localhost:8080/api/grpc/kyc/stream?userId=demo${NC}"
echo -e "${GREEN}   • Ledger: http://localhost:8080/api/grpc/ledger/stream?userId=demo${NC}"
echo -e "${GREEN}   • Risk: http://localhost:8080/api/grpc/risk/stream?userId=demo${NC}"

echo -e "\n${YELLOW}💡 Tip: Run the demo script in another terminal:${NC}"
echo -e "${CYAN}   node demo-script.js${NC}"

echo -e "\n${YELLOW}🐛 To test with curl:${NC}"
echo -e "${CYAN}   curl -N http://localhost:8080/api/grpc/payment/stream?userId=demo${NC}"

echo -e "\n${MAGENTA}🎯 Starting server now...${NC}"
echo -e "${YELLOW}   Press Ctrl+C to stop${NC}\n"

# Start the server
npm start 