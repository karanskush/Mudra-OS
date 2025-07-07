# 🚀 Complete gRPC Streaming Demo Guide

This guide shows you how to demonstrate **real functional gRPC streaming** in your fintech application - not just mocks!

## 🎯 What You'll Demonstrate

✅ **Real-time Payment Processing** - Watch payments flow through different rails (ACH, UPI, SEPA)  
✅ **Live KYC Verification** - See documents being verified in real-time  
✅ **Streaming Ledger Operations** - Balance updates and transaction processing  
✅ **Postman-Compatible APIs** - Test everything with REST clients  
✅ **Frontend Integration** - Working React components with real streams  

## 🏗️ Architecture Overview

```
Frontend (React + TypeScript)
    ↓ HTTP Commands
gRPC-Web Gateway (Node.js Server)
    ↓ Server-Sent Events
Real-time Streaming to Browser
```

## 📋 Prerequisites

- Node.js 16+ installed
- Two terminal windows
- Postman (optional but recommended)
- Browser with Server-Sent Events support

## 🚀 Quick Start (2 Minutes Setup)

### 1. Start the Backend Server
```bash
# Terminal 1
cd grpc-streaming-server
chmod +x start-demo.sh
./start-demo.sh
```

### 2. Start the Frontend
```bash
# Terminal 2
npm run dev
```

### 3. Test the Demo
- **Frontend**: Visit http://localhost:3000/grpc-demo
- **Backend**: Visit http://localhost:8080
- **Streaming**: http://localhost:8080/api/grpc/payment/stream?userId=demo

## 📡 Live Streaming Endpoints

### Payment Streaming
```bash
# Real-time payment events
curl -N http://localhost:8080/api/grpc/payment/stream?userId=demo
```

### KYC Streaming
```bash
# Real-time KYC verification events
curl -N http://localhost:8080/api/grpc/kyc/stream?userId=demo
```

### Ledger Streaming
```bash
# Real-time balance and transaction updates
curl -N http://localhost:8080/api/grpc/ledger/stream?userId=demo
```

## 💡 Demo Scenarios

### Scenario 1: Payment Processing Demo

**Step 1: Start Payment Stream**
```bash
# Terminal 3
curl -N http://localhost:8080/api/grpc/payment/stream?userId=demo_user
```

**Step 2: Trigger Payment**
```bash
# Terminal 4
curl -X POST http://localhost:8080/api/grpc/payment/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": {
      "initiatePayment": {
        "userId": "demo_user",
        "fromAccountId": "acc_001",
        "toAccountId": "acc_002",
        "amount": 5000,
        "currency": "USD",
        "description": "Live demo payment",
        "reference": "DEMO_PAY_001",
        "preferredRail": "UPI"
      }
    }
  }'
```

**What You'll See:**
1. `paymentInitiated` event with payment details
2. `paymentStatusUpdate` showing processing
3. `paymentCompleted` with final confirmation

### Scenario 2: KYC Verification Demo

**Step 1: Start KYC Stream**
```bash
curl -N http://localhost:8080/api/grpc/kyc/stream?userId=demo_user
```

**Step 2: Start Verification**
```bash
curl -X POST http://localhost:8080/api/grpc/kyc/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": {
      "startVerification": {
        "userId": "demo_user",
        "country": "IN",
        "name": "Demo User",
        "email": "demo@example.com",
        "phone": "+919876543210",
        "amount": 25000
      }
    }
  }'
```

**Step 3: Upload Document**
```bash
curl -X POST http://localhost:8080/api/grpc/kyc/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": {
      "uploadDocument": {
        "userId": "demo_user",
        "documentType": "passport",
        "documentData": "mock_base64_data",
        "fileName": "passport.jpg"
      }
    }
  }'
```

**What You'll See:**
1. `verificationStarted` event
2. `documentUploaded` event
3. `documentVerified` with confidence score

### Scenario 3: Ledger Operations Demo

**Step 1: Start Ledger Stream**
```bash
curl -N http://localhost:8080/api/grpc/ledger/stream?userId=demo_user
```

**Step 2: Create Transaction**
```bash
curl -X POST http://localhost:8080/api/grpc/ledger/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": {
      "createTransaction": {
        "fromAccountId": "acc_business",
        "toAccountId": "acc_personal",
        "amount": 2500,
        "currency": "USD",
        "description": "Demo ledger transaction",
        "reference": "LEDGER_DEMO_001"
      }
    }
  }'
```

**What You'll See:**
1. `transactionCreated` event
2. `balanceUpdate` for affected accounts
3. Real-time settlement updates

## 🔧 Postman Testing

### Import Collection
1. Open Postman
2. Import the collection file: `grpc-streaming-server/postman-collection.json`
3. Collection includes:
   - Health checks
   - All streaming endpoints
   - Command endpoints with example payloads
   - Admin monitoring endpoints

### Key Postman Tests
1. **Health Check**: `GET /api/grpc/health`
2. **Payment Stream**: `GET /api/grpc/payment/stream?userId=demo`
3. **Send Payment**: `POST /api/grpc/payment/command`
4. **Monitor Streams**: `GET /api/admin/streams`

## 🎭 Frontend Integration

### Visit the Demo Pages
- **gRPC Demo**: http://localhost:3000/grpc-demo
- **Real-time Payments**: http://localhost:3000/payments
- **KYC Flow**: http://localhost:3000/kyc
- **Ledger Test**: http://localhost:3000/ledger

### Component Features
- **Real-time event streaming**
- **Connection status monitoring**
- **Interactive command sending**
- **Live event history**
- **Fallback to mock data when backend unavailable**

## 🤖 Automated Demo Script

Run the complete demo automatically:

```bash
# In grpc-streaming-server directory
node demo-script.js
```

This script will:
1. Check server health
2. Show streaming instructions
3. Trigger payment, KYC, and ledger operations
4. Display real-time events
5. Provide Postman setup guide

## 📊 Monitoring & Admin

### View Active Streams
```bash
curl http://localhost:8080/api/admin/streams
```

### Broadcast Custom Events
```bash
curl -X POST http://localhost:8080/api/admin/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "event": {
      "customEvent": {
        "message": "Manual broadcast test",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    }
  }'
```

## 🎪 Demo Presentation Flow

### 1. Introduction (2 minutes)
- Show the architecture diagram
- Explain gRPC-Web vs traditional REST
- Highlight real-time streaming benefits

### 2. Backend Demo (3 minutes)
- Start the server: `./start-demo.sh`
- Show the health check: http://localhost:8080/api/grpc/health
- Open streaming endpoint in browser/Postman

### 3. Live Streaming (5 minutes)
- Open payment stream in one tab
- Send payment command in another tab
- Watch real-time events appear
- Show multiple concurrent streams

### 4. Frontend Integration (5 minutes)
- Show the gRPC demo page: http://localhost:3000/grpc-demo
- Demonstrate real-time UI updates
- Show connection status and fallback behavior

### 5. Postman Testing (3 minutes)
- Import the collection
- Test streaming endpoints
- Send commands and watch events
- Show admin monitoring

### 6. Use Cases (2 minutes)
- Payment processing workflows
- KYC verification pipelines
- Ledger reconciliation
- Risk monitoring alerts

## 🔄 Event Types Reference

### Payment Events
- `paymentInitiated` - Payment started
- `paymentStatusUpdate` - Status changed
- `paymentCompleted` - Payment successful
- `paymentError` - Payment failed

### KYC Events
- `verificationStarted` - KYC verification initiated
- `documentUploaded` - Document uploaded
- `documentVerified` - Document verified
- `riskAssessmentUpdate` - Risk score updated
- `complianceAlert` - Compliance issue detected

### Ledger Events
- `balanceUpdate` - Account balance changed
- `transactionCreated` - New transaction
- `transactionStatusUpdate` - Transaction status changed
- `reconciliationResult` - Reconciliation completed
- `lowBalanceAlert` - Low balance warning

## 🚀 Production Considerations

### Current Implementation
- ✅ Server-Sent Events for real-time streaming
- ✅ HTTP commands for bidirectional communication
- ✅ Connection monitoring and health checks
- ✅ Error handling and fallback mechanisms

### For Production
- 🔒 Add authentication/authorization
- 📊 Add rate limiting and monitoring
- 🎯 Implement proper database integration
- 🔄 Add Redis for stream state management
- 📈 Add metrics and alerting

## 🎯 Key Selling Points

1. **Real-time**: Actual streaming, not polling
2. **Bidirectional**: Commands up, events down
3. **Scalable**: Handles multiple concurrent streams
4. **Browser-compatible**: Works with standard web technologies
5. **Fallback-ready**: Graceful degradation to REST APIs
6. **Demo-ready**: Complete working system in minutes

## 📝 Troubleshooting

### Server Won't Start
```bash
# Check Node.js version
node --version  # Should be 16+

# Install dependencies
npm install

# Check port 8080
lsof -i :8080
```

### Streaming Not Working
```bash
# Test basic connectivity
curl http://localhost:8080/api/grpc/health

# Test streaming
curl -N http://localhost:8080/api/grpc/payment/stream?userId=test
```

### Frontend Not Connecting
- Check CORS settings in server
- Verify base URLs in gRPC services
- Check browser console for errors

## 🏆 Success Metrics

After running this demo, you should be able to:
- ✅ Show real-time payment processing
- ✅ Demonstrate KYC verification workflows
- ✅ Display live ledger updates
- ✅ Test with Postman or curl
- ✅ Explain the architecture and benefits
- ✅ Show production-ready patterns

---

## 📞 Support

If you encounter any issues:
1. Check the server logs
2. Verify all dependencies are installed
3. Ensure ports 3000 and 8080 are available
4. Review the browser console for client-side errors

This demo provides a complete, functional gRPC streaming system that can be shared and demonstrated immediately! 