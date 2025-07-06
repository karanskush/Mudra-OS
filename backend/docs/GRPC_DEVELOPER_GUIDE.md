# gRPC Developer Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [API Types](#api-types)
4. [Bidirectional Streaming APIs](#bidirectional-streaming-apis)
5. [Service Definitions](#service-definitions)
6. [Implementation Guide](#implementation-guide)
7. [Client Examples](#client-examples)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## Overview

This fintech platform implements **6 practical gRPC APIs** that leverage gRPC's core strengths for real fintech operations with measurable business value.

### Key Features

- **Payment Processing**: Real-time payment processing with dynamic status updates
- **Risk Monitoring**: Real-time transaction risk assessment with dynamic rule updates  
- **Account Synchronization**: Real-time balance sync across multiple clients/services
- **Transaction Validation**: Ultra-fast pre-transaction validation and compliance checking
- **Payment Rail Selection**: Optimal payment rail selection with cost and speed optimization
- **Account Operations**: Efficient account queries with transaction history streaming

---

## Architecture

### Service Structure

```
fintech-backend/
├── proto/                  # Protocol Buffer definitions
│   ├── payment.proto      # Payment services
│   ├── webhook.proto      # Webhook management
│   ├── reconciliation.proto # Reconciliation workflows
│   ├── compliance.proto   # Compliance reports
│   ├── kyc.proto         # KYC verification
│   └── ledger.proto      # Ledger operations
├── internal/grpc/
│   ├── server.go         # gRPC server setup
│   └── handlers/         # Service implementations
│       ├── payment_handler.go
│       ├── webhook_handler.go
│       ├── reconciliation_handler.go
│       ├── compliance_handler.go
│       ├── kyc_handler.go
│       └── ledger_handler.go
└── cmd/grpc-server/
    └── main.go           # Server entry point
```

### Ports and Configuration

- **gRPC Port**: `50051` (configurable via environment)
- **Health Check**: Built-in gRPC health checking
- **Reflection**: Enabled for development (disable in production)
- **TLS**: Optional (configure certificates in production)

---

## API Types

Our gRPC implementation uses four types of RPC calls:

### 1. Unary RPCs (Request-Response)
Standard synchronous calls for simple operations.

```protobuf
rpc CreatePayment(CreatePaymentRequest) returns (CreatePaymentResponse);
rpc GetPayment(GetPaymentRequest) returns (GetPaymentResponse);
```

### 2. Server Streaming (One Request, Stream of Responses)
Server sends multiple responses for a single client request.

```protobuf
rpc StreamPayments(StreamPaymentsRequest) returns (stream PaymentUpdate);
```

### 3. Client Streaming (Stream of Requests, One Response)
Client sends multiple requests, server responds once.

```protobuf
// Example: Bulk transaction upload
rpc BulkUpload(stream TransactionRequest) returns (BulkUploadResponse);
```

### 4. **Bidirectional Streaming** (Stream of Requests and Responses)
Both client and server can send multiple messages independently.

```protobuf
rpc TransactionMonitor(stream MonitorCommand) returns (stream TransactionEvent);
rpc WebhookDebugger(stream WebhookDebugCommand) returns (stream WebhookDebugResponse);
rpc InteractiveReconciliation(stream ReconAction) returns (stream ReconResult);
```

---

## Bidirectional Streaming APIs

### 1. Real-time Transaction Monitoring

**Service**: PaymentService  
**Method**: `TransactionMonitor`

**Use Case**: Real-time dashboard for monitoring payment transactions with dynamic filtering capabilities.

#### Client Commands
```protobuf
message MonitorCommand {
  oneof command {
    StartMonitoring start_monitoring = 1;
    StopMonitoring stop_monitoring = 2;
    UpdateFilter update_filter = 3;
    GetStats get_stats = 4;
  }
}
```

#### Server Responses
```protobuf
message TransactionEvent {
  oneof event {
    PaymentUpdate payment_update = 1;
    MonitoringStats stats = 2;
    MonitoringAlert alert = 3;
    MonitoringStatus status = 4;
  }
}
```

#### Example Usage
```go
// Start monitoring all transactions for a user
startCmd := &payment.MonitorCommand{
    Command: &payment.MonitorCommand_StartMonitoring{
        StartMonitoring: &payment.StartMonitoring{
            UserId: "user_123",
            StatusFilter: []payment.PaymentStatus{
                payment.PaymentStatus_PAYMENT_STATUS_PROCESSING,
                payment.PaymentStatus_PAYMENT_STATUS_COMPLETED,
            },
            MinAmount: 100.0,
            CurrencyFilter: []string{"USD", "EUR"},
        },
    },
}

// Update filter dynamically
updateCmd := &payment.MonitorCommand{
    Command: &payment.MonitorCommand_UpdateFilter{
        UpdateFilter: &payment.UpdateFilter{
            NewFilter: &payment.StartMonitoring{
                UserId: "user_123",
                MinAmount: 500.0, // Only high-value transactions
            },
        },
    },
}
```

### 2. Live Webhook Debugging

**Service**: WebhookService  
**Method**: `WebhookDebugger`

**Use Case**: Real-time debugging and testing of webhook integrations with detailed request/response logging.

#### Client Commands
```protobuf
message WebhookDebugCommand {
  oneof command {
    StartDebugging start_debugging = 1;
    StopDebugging stop_debugging = 2;
    TestEndpoint test_endpoint = 3;
    UpdateConfig update_config = 4;
    RetryDelivery retry_delivery = 5;
  }
}
```

#### Server Responses
```protobuf
message WebhookDebugResponse {
  oneof response {
    DeliveryAttempt delivery_attempt = 1;
    DebugStats debug_stats = 2;
    DebugLog debug_log = 3;
    DebugStatus debug_status = 4;
  }
}
```

#### Example Usage
```go
// Start debugging a webhook
startDebugCmd := &webhook.WebhookDebugCommand{
    Command: &webhook.WebhookDebugCommand_StartDebugging{
        StartDebugging: &webhook.StartDebugging{
            WebhookId: "webhook_123",
            CaptureRequests: true,
            CaptureResponses: true,
            EnableVerboseLogging: true,
        },
    },
}

// Test an endpoint
testCmd := &webhook.WebhookDebugCommand{
    Command: &webhook.WebhookDebugCommand_TestEndpoint{
        TestEndpoint: &webhook.TestEndpoint{
            Url: "https://api.example.com/webhook",
            EventType: webhook.WebhookEventType_WEBHOOK_EVENT_TYPE_PAYMENT_COMPLETED,
            CustomPayload: `{"test": true, "payment_id": "pay_test_123"}`,
            CustomHeaders: map[string]string{
                "Authorization": "Bearer test_token",
            },
            TimeoutSeconds: 30,
        },
    },
}
```

### 3. Interactive Reconciliation

**Service**: ReconciliationService  
**Method**: `InteractiveReconciliation`

**Use Case**: Real-time reconciliation workflow where operators can resolve variances interactively.

#### Client Commands
```protobuf
message ReconAction {
  oneof action {
    StartReconciliation start_reconciliation = 1;
    ProcessVariance process_variance = 2;
    ApprovalRequest approval_request = 3;
    GetProgress get_progress = 4;
    CompleteReconciliation complete_reconciliation = 5;
  }
}
```

#### Server Responses
```protobuf
message ReconResult {
  oneof result {
    ReconciliationStarted reconciliation_started = 1;
    VarianceDetected variance_detected = 2;
    VarianceProcessed variance_processed = 3;
    ApprovalResponse approval_response = 4;
    ProgressUpdate progress_update = 5;
    ReconciliationCompleted reconciliation_completed = 6;
    ReconError recon_error = 7;
  }
}
```

#### Example Usage
```go
// Start reconciliation for a date range
startReconCmd := &reconciliation.ReconAction{
    Action: &reconciliation.ReconAction_StartReconciliation{
        StartReconciliation: &reconciliation.StartReconciliation{
            DateRangeStart: "2024-01-01",
            DateRangeEnd: "2024-01-31",
            AutoMatchEnabled: true,
            ToleranceAmount: 0.01, // $0.01 tolerance
        },
    },
}

// Process a variance
processCmd := &reconciliation.ReconAction{
    Action: &reconciliation.ReconAction_ProcessVariance{
        ProcessVariance: &reconciliation.ProcessVariance{
            VarianceId: "var_123",
            Action: reconciliation.ActionType_ACTION_TYPE_ADJUST,
            Notes: "Timing difference - valid transaction",
            AdjustmentAmount: 50.00,
            AdjustmentReason: "Late settlement",
        },
    },
}
```

---

## Service Definitions

### 🔄 Bidirectional Streaming Services

#### PaymentProcessingService
```protobuf
service PaymentProcessingService {
  // Real-time payment processing with status updates
  rpc ProcessPayments(stream PaymentRequest) returns (stream PaymentResponse);
}
```

#### RiskMonitoringService
```protobuf
service RiskMonitoringService {
  // Real-time risk assessment with dynamic rule updates
  rpc MonitorRisk(stream RiskCommand) returns (stream RiskEvent);
}
```

#### AccountSyncService
```protobuf
service AccountSyncService {
  // Real-time account balance synchronization
  rpc SyncAccountBalances(stream BalanceCommand) returns (stream BalanceUpdate);
}
```

### ⚡ High-Performance Simple Services

#### TransactionValidationService
```protobuf
service TransactionValidationService {
  // Validate a single transaction
  rpc ValidateTransaction(ValidateTransactionRequest) returns (ValidateTransactionResponse);
  
  // Batch validate multiple transactions
  rpc BatchValidateTransactions(BatchValidateRequest) returns (BatchValidateResponse);
}
```

#### PaymentRailService
```protobuf
service PaymentRailService {
  // Select optimal payment rail for a transaction
  rpc SelectPaymentRail(SelectRailRequest) returns (SelectRailResponse);
  
  // Get available rails for a route
  rpc GetAvailableRails(GetRailsRequest) returns (GetRailsResponse);
  
  // Get rail performance metrics
  rpc GetRailMetrics(GetRailMetricsRequest) returns (GetRailMetricsResponse);
}
```

#### AccountInfoService
```protobuf
service AccountInfoService {
  // Get account details
  rpc GetAccountInfo(GetAccountInfoRequest) returns (GetAccountInfoResponse);
  
  // Get account summary with balances
  rpc GetAccountSummary(GetAccountSummaryRequest) returns (GetAccountSummaryResponse);
  
  // Stream account transaction history (server streaming)
  rpc StreamTransactionHistory(TransactionHistoryRequest) returns (stream TransactionHistoryResponse);
}
```

### 🏛️ Legacy Services (for backward compatibility)

#### KYCService
```protobuf
service KYCService {
  rpc CreateProfile(CreateProfileRequest) returns (CreateProfileResponse);
  rpc GetProfile(GetProfileRequest) returns (GetProfileResponse);
}
```

#### LedgerService
```protobuf
service LedgerService {
  rpc CreateAccount(CreateAccountRequest) returns (CreateAccountResponse);
  rpc GetAccount(GetAccountRequest) returns (GetAccountResponse);
  rpc CreateTransaction(CreateTransactionRequest) returns (CreateTransactionResponse);
  rpc GetTransactionHistory(GetTransactionHistoryRequest) returns (GetTransactionHistoryResponse);
}
```

---

## Implementation Guide

### Server Setup

1. **Generate Proto Files**
```bash
make proto-gen
```

2. **Start gRPC Server**
```bash
# Development
make grpc-server

# Production
go run cmd/grpc-server/main.go
```

3. **Run Both REST and gRPC**
```bash
make run-all
```

### Handler Implementation Pattern

```go
// Example bidirectional streaming handler
func (h *Handler) BidirectionalMethod(stream grpc.BidiStreamingServer[RequestType, ResponseType]) error {
    sessionID := generateSessionID()
    session := &Session{
        ID: sessionID,
        EventChannel: make(chan *ResponseType, 100),
        StopChannel: make(chan bool, 1),
    }
    
    // Store and cleanup session
    h.sessions.Store(sessionID, session)
    defer h.sessions.Delete(sessionID)
    defer close(session.EventChannel)
    defer close(session.StopChannel)
    
    ctx := stream.Context()
    
    // Handle incoming requests
    go func() {
        for {
            req, err := stream.Recv()
            if err == io.EOF || err != nil {
                session.StopChannel <- true
                return
            }
            h.handleRequest(session, req)
        }
    }()
    
    // Send responses
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        case <-session.StopChannel:
            return nil
        case event := <-session.EventChannel:
            if err := stream.Send(event); err != nil {
                return err
            }
        }
    }
}
```

---

## Client Examples

### Go Client

```go
package main

import (
    "context"
    "io"
    "log"
    
    "google.golang.org/grpc"
    pb "fintech-backend/proto/gen/proto"
)

func main() {
    // Connect to server
    conn, err := grpc.Dial("localhost:50051", grpc.WithInsecure())
    if err != nil {
        log.Fatal(err)
    }
    defer conn.Close()
    
    client := pb.NewPaymentServiceClient(conn)
    
    // Bidirectional streaming example
    stream, err := client.TransactionMonitor(context.Background())
    if err != nil {
        log.Fatal(err)
    }
    
    // Send start monitoring command
    startCmd := &pb.MonitorCommand{
        Command: &pb.MonitorCommand_StartMonitoring{
            StartMonitoring: &pb.StartMonitoring{
                UserId: "user_123",
                MinAmount: 100.0,
            },
        },
    }
    
    if err := stream.Send(startCmd); err != nil {
        log.Fatal(err)
    }
    
    // Receive events
    go func() {
        for {
            event, err := stream.Recv()
            if err == io.EOF {
                return
            }
            if err != nil {
                log.Printf("Error: %v", err)
                return
            }
            
            switch e := event.Event.(type) {
            case *pb.TransactionEvent_PaymentUpdate:
                log.Printf("Payment Update: %+v", e.PaymentUpdate)
            case *pb.TransactionEvent_Stats:
                log.Printf("Stats: %+v", e.Stats)
            case *pb.TransactionEvent_Alert:
                log.Printf("Alert: %+v", e.Alert)
            }
        }
    }()
    
    // Keep connection alive
    select {}
}
```

### Node.js Client

```javascript
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('payment.proto');
const proto = grpc.loadPackageDefinition(packageDefinition);

const client = new proto.fintech.payment.v1.PaymentService(
    'localhost:50051',
    grpc.credentials.createInsecure()
);

// Bidirectional streaming
const stream = client.TransactionMonitor();

// Send commands
stream.write({
    start_monitoring: {
        user_id: 'user_123',
        min_amount: 100.0
    }
});

// Receive events
stream.on('data', (event) => {
    if (event.payment_update) {
        console.log('Payment Update:', event.payment_update);
    } else if (event.stats) {
        console.log('Stats:', event.stats);
    } else if (event.alert) {
        console.log('Alert:', event.alert);
    }
});

stream.on('error', (err) => {
    console.error('Stream error:', err);
});

stream.on('end', () => {
    console.log('Stream ended');
});
```

### Python Client

```python
import grpc
import payment_pb2
import payment_pb2_grpc

def run_transaction_monitor():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = payment_pb2_grpc.PaymentServiceStub(channel)
        
        def request_generator():
            # Start monitoring
            yield payment_pb2.MonitorCommand(
                start_monitoring=payment_pb2.StartMonitoring(
                    user_id='user_123',
                    min_amount=100.0
                )
            )
            
            # Send periodic stats requests
            import time
            while True:
                time.sleep(30)
                yield payment_pb2.MonitorCommand(
                    get_stats=payment_pb2.GetStats(
                        include_summary=True,
                        include_rail_breakdown=True
                    )
                )
        
        # Start bidirectional stream
        responses = stub.TransactionMonitor(request_generator())
        
        try:
            for response in responses:
                if response.HasField('payment_update'):
                    print(f"Payment Update: {response.payment_update}")
                elif response.HasField('stats'):
                    print(f"Stats: {response.stats}")
                elif response.HasField('alert'):
                    print(f"Alert: {response.alert}")
        except grpc.RpcError as e:
            print(f"RPC failed: {e}")

if __name__ == '__main__':
    run_transaction_monitor()
```

---

## Testing

### Comprehensive Test Client

We've created a complete test client for all bidirectional streaming APIs:

```bash
# Run the interactive test client
cd backend
go run cmd/test-bidirectional-streaming/main.go
```

The test client provides:
- **Interactive Menu**: Choose which API to test
- **Real-time Monitoring**: Watch events as they happen
- **Command Sequencing**: Automated command sending with delays
- **Error Handling**: Graceful error recovery and reporting

### Unit Testing

```go
func TestTransactionMonitor(t *testing.T) {
    // Setup test server
    server := grpc.NewServer()
    handler := &PaymentHandler{}
    payment.RegisterPaymentServiceServer(server, handler)
    
    listener, err := net.Listen("tcp", ":0")
    require.NoError(t, err)
    
    go server.Serve(listener)
    defer server.Stop()
    
    // Test client
    conn, err := grpc.Dial(listener.Addr().String(), grpc.WithInsecure())
    require.NoError(t, err)
    defer conn.Close()
    
    client := payment.NewPaymentServiceClient(conn)
    stream, err := client.TransactionMonitor(context.Background())
    require.NoError(t, err)
    
    // Test bidirectional communication
    err = stream.Send(&payment.MonitorCommand{
        Command: &payment.MonitorCommand_StartMonitoring{
            StartMonitoring: &payment.StartMonitoring{
                UserId: "test_user",
            },
        },
    })
    require.NoError(t, err)
    
    response, err := stream.Recv()
    require.NoError(t, err)
    assert.NotNil(t, response)
}
```

### Integration Testing with grpcurl

```bash
# List services
grpcurl -plaintext localhost:50051 list

# List methods for a service
grpcurl -plaintext localhost:50051 list fintech.payment.v1.PaymentService

# Test unary RPC
grpcurl -plaintext -d '{"payment_id": "pay_123"}' \
    localhost:50051 fintech.payment.v1.PaymentService/GetPayment

# Test server streaming
grpcurl -plaintext -d '{"user_id": "user_123"}' \
    localhost:50051 fintech.payment.v1.PaymentService/StreamPayments

# Note: Bidirectional streaming requires a proper client implementation
# Use our test client: go run cmd/test-bidirectional-streaming/main.go
```

### Load Testing

```bash
# Install ghz
go install github.com/bojand/ghz/cmd/ghz@latest

# Load test unary RPC
ghz --insecure \
    --proto payment.proto \
    --call fintech.payment.v1.PaymentService.GetPayment \
    --data '{"payment_id": "pay_123"}' \
    --connections 10 \
    --concurrency 50 \
    --total 1000 \
    localhost:50051
```

---

## Deployment

### Docker Configuration

```dockerfile
# Dockerfile
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o grpc-server cmd/grpc-server/main.go

FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /root/

COPY --from=builder /app/grpc-server .
EXPOSE 50051

CMD ["./grpc-server"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  grpc-server:
    build: .
    ports:
      - "50051:50051"
    environment:
      - GRPC_PORT=50051
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
      
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: fintech
      POSTGRES_USER: fintech
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Kubernetes Deployment

```yaml
# k8s/grpc-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grpc-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: grpc-server
  template:
    metadata:
      labels:
        app: grpc-server
    spec:
      containers:
      - name: grpc-server
        image: fintech/grpc-server:latest
        ports:
        - containerPort: 50051
        env:
        - name: GRPC_PORT
          value: "50051"
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi

---
apiVersion: v1
kind: Service
metadata:
  name: grpc-service
spec:
  selector:
    app: grpc-server
  ports:
  - port: 50051
    targetPort: 50051
  type: LoadBalancer
```

---

## Best Practices

### Performance Optimization

1. **Connection Pooling**
```go
// Client-side connection pooling
var pool = &sync.Pool{
    New: func() interface{} {
        conn, _ := grpc.Dial("localhost:50051", grpc.WithInsecure())
        return conn
    },
}

func getConnection() *grpc.ClientConn {
    return pool.Get().(*grpc.ClientConn)
}
```

2. **Server-side Optimizations**
```go
server := grpc.NewServer(
    grpc.MaxRecvMsgSize(4*1024*1024), // 4MB
    grpc.MaxSendMsgSize(4*1024*1024), // 4MB
    grpc.MaxConcurrentStreams(1000),
    grpc.KeepaliveParams(keepalive.ServerParameters{
        MaxConnectionIdle: 15 * time.Second,
        MaxConnectionAge:  30 * time.Second,
        Time:              5 * time.Second,
        Timeout:           1 * time.Second,
    }),
)
```

3. **Stream Management**
```go
// Proper session cleanup in bidirectional streaming
defer func() {
    h.sessions.Delete(sessionID)
    close(session.EventChannel)
    close(session.StopChannel)
}()
```

### Security Best Practices

1. **TLS Configuration**
```go
// Server TLS
creds, err := credentials.NewServerTLSFromFile("server.crt", "server.key")
if err != nil {
    log.Fatal(err)
}
server := grpc.NewServer(grpc.Creds(creds))

// Client TLS
creds, err := credentials.NewClientTLSFromFile("ca.crt", "")
if err != nil {
    log.Fatal(err)
}
conn, err := grpc.Dial("localhost:50051", grpc.WithTransportCredentials(creds))
```

2. **Authentication Interceptors**
```go
func authInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    token := extractToken(ctx)
    if !validateToken(token) {
        return nil, status.Error(codes.Unauthenticated, "invalid token")
    }
    return handler(ctx, req)
}

server := grpc.NewServer(grpc.UnaryInterceptor(authInterceptor))
```

3. **Rate Limiting**
```go
func rateLimitInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    clientIP := getClientIP(ctx)
    if !rateLimiter.Allow(clientIP) {
        return nil, status.Error(codes.ResourceExhausted, "rate limit exceeded")
    }
    return handler(ctx, req)
}
```

### Error Handling

1. **Structured Error Responses**
```go
// Use gRPC status codes appropriately
return nil, status.Errorf(codes.InvalidArgument, "invalid payment amount: %v", req.Amount)
return nil, status.Errorf(codes.NotFound, "payment not found: %s", req.PaymentId)
return nil, status.Errorf(codes.PermissionDenied, "insufficient permissions")
```

2. **Error Details**
```go
import "google.golang.org/genproto/googleapis/rpc/errdetails"

st := status.New(codes.InvalidArgument, "validation failed")
st, _ = st.WithDetails(&errdetails.BadRequest{
    FieldViolations: []*errdetails.BadRequest_FieldViolation{
        {
            Field:       "amount",
            Description: "must be greater than 0",
        },
    },
})
return nil, st.Err()
```

### Monitoring and Observability

1. **Metrics Collection**
```go
import "github.com/grpc-ecosystem/go-grpc-prometheus"

server := grpc.NewServer(
    grpc.UnaryInterceptor(grpc_prometheus.UnaryServerInterceptor),
    grpc.StreamInterceptor(grpc_prometheus.StreamServerInterceptor),
)
grpc_prometheus.Register(server)
```

2. **Distributed Tracing**
```go
import "go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"

server := grpc.NewServer(
    grpc.UnaryInterceptor(otelgrpc.UnaryServerInterceptor()),
    grpc.StreamInterceptor(otelgrpc.StreamServerInterceptor()),
)
```

3. **Logging**
```go
func loggingInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
    start := time.Now()
    resp, err := handler(ctx, req)
    
    log.WithFields(log.Fields{
        "method":   info.FullMethod,
        "duration": time.Since(start),
        "error":    err != nil,
    }).Info("gRPC request completed")
    
    return resp, err
}
```

---

## Troubleshooting

### Common Issues

1. **Connection Refused**
```bash
# Check if server is running
netstat -tulpn | grep :50051

# Test connectivity
grpcurl -plaintext localhost:50051 list
```

2. **Bidirectional Streaming Issues**
```bash
# Test with our comprehensive client
go run cmd/test-bidirectional-streaming/main.go

# Check server logs for session management
tail -f logs/grpc-server.log
```

3. **Session Management Problems**
- Ensure proper cleanup in handlers
- Check for goroutine leaks
- Verify context cancellation handling

4. **Proto Generation Issues**
```bash
# Install dependencies
make proto-deps

# Clean and regenerate
make clean
make proto-gen
```

5. **Import Path Issues**
```bash
# Check go.mod
go mod tidy

# Verify proto generated files
ls -la proto/gen/proto/
```

### Debugging Tools

1. **grpcurl** - CLI client for testing
```bash
# Install
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest

# Test reflection
grpcurl -plaintext localhost:50051 list
```

2. **Postman** - GUI for gRPC testing
- Import proto files
- Configure server URL
- Test unary and streaming RPCs

3. **Evans** - Interactive gRPC client
```bash
# Install
go install github.com/ktr0731/evans@latest

# Connect
evans --host localhost --port 50051 --reflection
```

### Performance Debugging

1. **Enable gRPC Logs**
```bash
export GRPC_GO_LOG_VERBOSITY_LEVEL=99
export GRPC_GO_LOG_SEVERITY_LEVEL=info
```

2. **Memory Profiling**
```go
import _ "net/http/pprof"

go func() {
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()
```

3. **Stream Monitoring**
```go
// Track active streams
type StreamMetrics struct {
    ActiveStreams int64
    TotalStreams  int64
}

func (s *StreamMetrics) IncrementActive() {
    atomic.AddInt64(&s.ActiveStreams, 1)
    atomic.AddInt64(&s.TotalStreams, 1)
}

func (s *StreamMetrics) DecrementActive() {
    atomic.AddInt64(&s.ActiveStreams, -1)
}
```

---

## Resources

### Official Documentation
- [gRPC Go Documentation](https://grpc.io/docs/languages/go/)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)
- [gRPC Status Codes](https://grpc.github.io/grpc/core/md_doc_statuscodes.html)

### Tools
- [grpcurl](https://github.com/fullstorydev/grpcurl) - CLI client
- [Evans](https://github.com/ktr0731/evans) - Interactive client
- [BloomRPC](https://github.com/bloomrpc/bloomrpc) - GUI client
- [ghz](https://github.com/bojand/ghz) - Load testing tool

### Libraries
- [grpc-go](https://github.com/grpc/grpc-go) - Go gRPC implementation
- [go-grpc-middleware](https://github.com/grpc-ecosystem/go-grpc-middleware) - Interceptors
- [grpc-gateway](https://github.com/grpc-ecosystem/grpc-gateway) - REST to gRPC proxy

---

## Contributing

1. **Adding New Services**
   - Define proto file in `proto/`
   - Generate Go code with `make proto-gen`
   - Implement handler in `internal/grpc/handlers/`
   - Register service in server
   - Add tests and documentation

2. **Extending Existing Services**
   - Update proto definition
   - Regenerate code
   - Update handler implementation
   - Add backward compatibility if needed

3. **Testing Guidelines**
   - Unit tests for handlers
   - Integration tests with real gRPC calls
   - Load tests for performance validation
   - End-to-end tests with client libraries

---

This comprehensive guide covers all aspects of our gRPC implementation, from basic usage to advanced bidirectional streaming patterns. For specific implementation details, refer to the code examples and test files in the repository. 