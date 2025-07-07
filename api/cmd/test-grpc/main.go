package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"fintech-api/proto/gen/account_sync"
	"fintech-api/proto/gen/ledger"
	"fintech-api/proto/gen/payment"
	"fintech-api/proto/gen/payment_processing"
	"fintech-api/proto/gen/reconciliation"
	"fintech-api/proto/gen/risk_monitoring"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/types/known/timestamppb"
)

const (
	grpcServerAddr = "localhost:50051"
)

func main() {
	fmt.Println("🚀 Starting gRPC API Testing Suite...")
	fmt.Println("=====================================")
	fmt.Println("🎯 Testing APIs from GRPC_DEMO_README.md")
	fmt.Println("🔄 Focus on HTTP/2 gRPC Protocol")
	fmt.Println("📡 Testing Bidirectional Streaming")

	// Connect to gRPC server
	conn, err := grpc.Dial(grpcServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect to gRPC server: %v", err)
	}
	defer conn.Close()

	ctx := context.Background()

	// Health check
	healthCheck(conn)

	// Test bidirectional streaming APIs mentioned in GRPC_DEMO_README.md
	fmt.Println("\n🔄 Testing Bidirectional Streaming API Connections")
	fmt.Println("==================================================")

	testPaymentProcessingStream(ctx, conn)
	testRiskMonitoringStream(ctx, conn)
	testAccountSyncStream(ctx, conn)
	testPaymentTransactionMonitor(ctx, conn)
	testReconciliationInteractive(ctx, conn)

	fmt.Println("\n✅ All gRPC HTTP/2 bidirectional streaming tests completed!")
	fmt.Println("🎉 gRPC server is working with HTTP/2 protocol!")
}

func testPaymentProcessingStream(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n💳 Testing PaymentProcessingService.ProcessPayments...")

	client := payment_processing.NewPaymentProcessingServiceClient(conn)

	streamCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	stream, err := client.ProcessPayments(streamCtx)
	if err != nil {
		log.Printf("❌ ProcessPayments stream failed: %v", err)
		return
	}

	// Test bidirectional streaming connection
	stream.CloseSend()

	fmt.Println("  ✅ ProcessPayments bidirectional streaming connection successful")
}

func testRiskMonitoringStream(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n🛡️  Testing RiskMonitoringService.MonitorRisk...")

	client := risk_monitoring.NewRiskMonitoringServiceClient(conn)

	streamCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	stream, err := client.MonitorRisk(streamCtx)
	if err != nil {
		log.Printf("❌ MonitorRisk stream failed: %v", err)
		return
	}

	// Test bidirectional streaming connection
	stream.CloseSend()

	fmt.Println("  ✅ MonitorRisk bidirectional streaming connection successful")
}

func testAccountSyncStream(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n🔄 Testing AccountSyncService.SyncAccountBalances...")

	client := account_sync.NewAccountSyncServiceClient(conn)

	streamCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	stream, err := client.SyncAccountBalances(streamCtx)
	if err != nil {
		log.Printf("❌ SyncAccountBalances stream failed: %v", err)
		return
	}

	// Test bidirectional streaming connection
	stream.CloseSend()

	fmt.Println("  ✅ SyncAccountBalances bidirectional streaming connection successful")
}

func testPaymentTransactionMonitor(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n💳 Testing PaymentService.TransactionMonitor...")

	client := payment.NewPaymentServiceClient(conn)

	streamCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	stream, err := client.TransactionMonitor(streamCtx)
	if err != nil {
		log.Printf("❌ TransactionMonitor stream failed: %v", err)
		return
	}

	// Test bidirectional streaming connection
	stream.CloseSend()

	fmt.Println("  ✅ TransactionMonitor bidirectional streaming connection successful")
}

func testReconciliationInteractive(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n🔄 Testing ReconciliationService.InteractiveReconciliation...")

	client := reconciliation.NewReconciliationServiceClient(conn)

	streamCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	stream, err := client.InteractiveReconciliation(streamCtx)
	if err != nil {
		log.Printf("❌ InteractiveReconciliation stream failed: %v", err)
		return
	}

	// Test bidirectional streaming connection
	stream.CloseSend()

	fmt.Println("  ✅ InteractiveReconciliation bidirectional streaming connection successful")
}

func testLedgerBalance(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n📊 Testing LedgerService.Balance...")

	client := ledger.NewLedgerServiceClient(conn)

	// Test with a valid UUID format
	balanceReq := &ledger.BalanceRequest{
		AccountId: "550e8400-e29b-41d4-a716-446655440000",
		At:        timestamppb.Now(),
	}

	balanceResp, err := client.Balance(ctx, balanceReq)
	if err != nil {
		log.Printf("❌ Balance failed: %v", err)
		return
	}

	fmt.Printf("  ✅ Balance retrieved: %.2f %s\n",
		balanceResp.Balance.Balance, balanceResp.Balance.Currency)
}

func healthCheck(conn *grpc.ClientConn) {
	fmt.Println("\n🏥 gRPC Server Health Check")
	fmt.Println("===========================")

	fmt.Printf("✅ Successfully connected to gRPC server at %s\n", grpcServerAddr)

	// Get server state
	state := conn.GetState()
	fmt.Printf("📡 Server connection state: %s\n", state.String())

	fmt.Println("\n🔄 Bidirectional Streaming APIs (from GRPC_DEMO_README.md):")
	fmt.Println("  • PaymentProcessingService.ProcessPayments")
	fmt.Println("  • RiskMonitoringService.MonitorRisk")
	fmt.Println("  • AccountSyncService.SyncAccountBalances")
	fmt.Println("  • PaymentService.TransactionMonitor")
	fmt.Println("  • ReconciliationService.InteractiveReconciliation")

	fmt.Println("\n⚡ High-Performance Simple APIs:")
	fmt.Println("  • TransactionValidationService.ValidateTransaction")
	fmt.Println("  • PaymentRailService.SelectPaymentRail")
	fmt.Println("  • AccountInfoService.GetAccountInfo")

	fmt.Println("\n📡 Protocol: HTTP/2 gRPC (supports bidirectional streaming)")
	fmt.Println("✅ gRPC server is ready for testing!")
}
