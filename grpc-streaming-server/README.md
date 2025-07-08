# 🚀 gRPC Streaming Demo Server

A functional gRPC-Web streaming server that demonstrates real-time payment processing, KYC verification, and ledger operations for fintech applications.

## 🎯 Features

- **Real-time Payment Processing** - Stream payment status updates as they happen
- **Live KYC Verification** - Real-time document verification and risk assessment
- **Ledger Streaming** - Live balance updates and transaction monitoring
- **Risk Monitoring** - Continuous risk assessment streaming
- **Server-Sent Events** - Browser-compatible real-time streaming
- **Postman Compatible** - Easy testing with REST clients

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd grpc-streaming-server
npm install
```

### 2. Start the Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

### 3. Test the Server
Open your browser to: http://localhost:8080

## 📡 Available Endpoints

### Health Checks
- `GET /api/grpc/health` - Overall health check
- `GET /api/grpc/payment/health` - Payment service health
- `GET /api/grpc/kyc/health` - KYC service health
- `GET /api/grpc/ledger/health` - Ledger service health

### Streaming Endpoints (Server-Sent Events)
- `GET /api/grpc/payment/stream?userId=demo` - Payment events stream
- `GET /api/grpc/kyc/stream?userId=demo` - KYC events stream
- `GET /api/grpc/ledger/stream?userId=demo` - Ledger events stream
- `GET /api/grpc/risk/stream?userId=demo` - Risk monitoring stream

### Command Endpoints
- `POST /api/grpc/payment/command` - Send payment commands
- `POST /api/grpc/kyc/command` - Send KYC commands
- `POST /api/grpc/ledger/command` - Send ledger commands

### Admin Endpoints
- `GET /api/admin/streams` - View active streams
- `POST /api/admin/broadcast` - Broadcast custom events

## 🧪 Testing with curl

### 1. Test Streaming
```bash
# Stream payment events
curl -N http://localhost:8080/api/grpc/payment/stream?userId=demo

# Stream KYC events
curl -N http://localhost:8080/api/grpc/kyc/stream?userId=demo

# Stream ledger events
curl -N http://localhost:8080/api/grpc/ledger/stream?userId=demo
```

### 2. Send Commands
```bash
# Initiate a payment
curl -X POST http://localhost:8080/api/grpc/payment/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": {
      "initiatePayment": {
        "userId": "demo",
        "fromAccountId": "acc_001",
        "toAccountId": "acc_002",
        "amount": 1000,
        "currency": "USD",
        "description": "Test payment",
        "reference": "PAY_001",
        "preferredRail": "ACH"
      }
    }
  }'

# Start KYC verification
curl -X POST http://localhost:8080/api/grpc/kyc/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": {
      "startVerification": {
        "userId": "demo",
        "country": "US",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "amount": 50000
      }
    }
  }'

# Create ledger transaction
curl -X POST http://localhost:8080/api/grpc/ledger/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": {
      "createTransaction": {
        "fromAccountId": "acc_001",
        "toAccountId": "acc_002",
        "amount": 500,
        "currency": "USD",
        "description": "Test transfer",
        "reference": "TXN_001"
      }
    }
  }'
```

## 🔧 Postman Testing

### Import Collection
1. Create a new Postman workspace
2. Import the following requests:

#### GET Requests (for Streaming)
- **Payment Stream**: `GET http://localhost:8080/api/grpc/payment/stream?userId=demo`
- **KYC Stream**: `GET http://localhost:8080/api/grpc/kyc/stream?userId=demo`
- **Ledger Stream**: `GET http://localhost:8080/api/grpc/ledger/stream?userId=demo`

#### POST Requests (for Commands)
- **Payment Command**: `POST http://localhost:8080/api/grpc/payment/command`
- **KYC Command**: `POST http://localhost:8080/api/grpc/kyc/command`
- **Ledger Command**: `POST http://localhost:8080/api/grpc/ledger/command`

### Example Payloads

#### Payment Command
```json
{
  "command": {
    "initiatePayment": {
      "userId": "demo",
      "fromAccountId": "acc_001",
      "toAccountId": "acc_002",
      "amount": 1000,
      "currency": "USD",
      "description": "Demo payment",
      "reference": "PAY_DEMO_001",
      "preferredRail": "UPI"
    }
  }
}
```

#### KYC Command
```json
{
  "command": {
    "startVerification": {
      "userId": "demo",
      "country": "IN",
      "name": "Demo User",
      "email": "demo@example.com",
      "phone": "+919876543210",
      "amount": 25000
    }
  }
}
```

#### KYC Document Upload
```json
{
  "command": {
    "uploadDocument": {
      "userId": "demo",
      "documentType": "passport",
      "documentData": "base64_encoded_document_data",
      "fileName": "passport.jpg"
    }
  }
}
```

## 🎭 Frontend Integration

Connect your frontend to this server by updating the base URL in your gRPC services:

```typescript
// In your frontend gRPC services
const grpcPaymentService = new GrpcPaymentService('http://localhost:8080');
const grpcKYCService = new GrpcKYCService('http://localhost:8080');
const grpcLedgerService = new GrpcLedgerService('http://localhost:8080');
```

## 📊 Event Types

### Payment Events
- `paymentInitiated` - Payment has been started
- `paymentStatusUpdate` - Payment status changed
- `paymentCompleted` - Payment successfully completed
- `paymentError` - Payment failed

### KYC Events
- `verificationStarted` - KYC verification initiated
- `documentUploaded` - Document uploaded for verification
- `documentVerified` - Document verification completed
- `riskAssessmentUpdate` - Risk score updated
- `verificationCompleted` - Full KYC verification completed
- `complianceAlert` - Compliance issue detected

### Ledger Events
- `balanceUpdate` - Account balance changed
- `transactionCreated` - New transaction created
- `transactionStatusUpdate` - Transaction status changed
- `reconciliationResult` - Account reconciliation completed
- `lowBalanceAlert` - Low balance warning
- `accountLocked` - Account has been locked

### Risk Events
- `riskAssessmentUpdate` - Risk factors updated
- `anomalyDetected` - Unusual activity detected
- `riskThresholdExceeded` - Risk score too high

## 🔍 Monitoring

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
        "message": "This is a custom broadcast",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    }
  }'
```

## 🏗️ Architecture

```
Frontend (React/TypeScript)
    ↓ HTTP Requests
gRPC-Web Gateway (This Server)
    ↓ Server-Sent Events
Real-time Event Streams
```

## 🔧 Customization

### Adding New Event Types
1. Add new event structure to `generateMockEvent()`
2. Create corresponding command handlers
3. Add new streaming endpoints
4. Update frontend interfaces

### Modifying Stream Frequency
Change the interval timers in the streaming endpoints:
```javascript
// Every 5 seconds instead of 10
const eventInterval = setInterval(() => {
  // ...
}, 5000);
```

## 🚀 Production Considerations

For production use:
1. Add authentication/authorization
2. Implement rate limiting
3. Add proper error handling and logging
4. Use Redis for stream state management
5. Add health checks and monitoring
6. Implement proper database integration
7. Add data validation and sanitization

## 📝 License

MIT License - feel free to use this for your demos and projects! 