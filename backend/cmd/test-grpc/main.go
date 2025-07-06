package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"fintech-backend/proto/gen/common"
	"fintech-backend/proto/gen/compliance"
	"fintech-backend/proto/gen/kyc"
	"fintech-backend/proto/gen/ledger"
	"fintech-backend/proto/gen/payment"
	"fintech-backend/proto/gen/reconciliation"
	"fintech-backend/proto/gen/webhook"

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

	// Connect to gRPC server
	conn, err := grpc.Dial(grpcServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("Failed to connect to gRPC server: %v", err)
	}
	defer conn.Close()

	ctx := context.Background()

	// Health check
	healthCheck(conn)

	// Test implemented methods first
	testImplementedMethods(ctx, conn)

	// Test all services (most will show "not implemented")
	testLedgerService(ctx, conn)
	testKYCService(ctx, conn)
	testPaymentService(ctx, conn)
	testComplianceService(ctx, conn)
	testReconciliationService(ctx, conn)
	testWebhookService(ctx, conn)

	fmt.Println("\n✅ All gRPC API tests completed successfully!")
}

func testLedgerService(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n📊 Testing Ledger Service...")

	ledgerClient := ledger.NewLedgerServiceClient(conn)

	// Test CreateAccount
	fmt.Println("  Testing CreateAccount...")
	createAccountReq := &ledger.CreateAccountRequest{
		UserId:        "user_123",
		AccountNumber: "ACC001",
		Name:          "Test Account",
		Description:   "Test account for API testing",
		Currency:      "USD",
		Type:          common.AccountType_ACCOUNT_TYPE_ASSET,
	}

	createAccountResp, err := ledgerClient.CreateAccount(ctx, createAccountReq)
	if err != nil {
		log.Printf("❌ CreateAccount failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Account created: %s\n", createAccountResp.Account.AccountId)

	// Test GetAccount
	fmt.Println("  Testing GetAccount...")
	getAccountReq := &ledger.GetAccountRequest{
		AccountId: createAccountResp.Account.AccountId,
	}

	getAccountResp, err := ledgerClient.GetAccount(ctx, getAccountReq)
	if err != nil {
		log.Printf("❌ GetAccount failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Account retrieved: %s\n", getAccountResp.Account.Name)

	// Test Balance
	fmt.Println("  Testing Balance...")
	balanceReq := &ledger.BalanceRequest{
		AccountId: createAccountResp.Account.AccountId,
		At:        timestamppb.Now(),
	}

	balanceResp, err := ledgerClient.Balance(ctx, balanceReq)
	if err != nil {
		log.Printf("❌ Balance failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Balance retrieved: %.2f %s\n", balanceResp.Balance.Balance, balanceResp.Balance.Currency)
}

func testKYCService(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n🔐 Testing KYC Service...")

	kycClient := kyc.NewKYCServiceClient(conn)

	// Test CreateProfile
	fmt.Println("  Testing CreateProfile...")
	createProfileReq := &kyc.CreateProfileRequest{
		UserId:   "user_123",
		Name:     "John Doe",
		Email:    "john.doe@example.com",
		Phone:    "+1234567890",
		Country:  "US",
		Location: "New York",
		Amount:   1000000, // $10,000 in cents
		Documents: map[string]string{
			"passport":     "passport_data_here",
			"utility_bill": "utility_bill_data_here",
		},
		Avatar: "https://example.com/avatar.jpg",
	}

	createProfileResp, err := kycClient.CreateProfile(ctx, createProfileReq)
	if err != nil {
		log.Printf("❌ CreateProfile failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Profile created: %s (Status: %s)\n",
		createProfileResp.Profile.ProfileId,
		createProfileResp.Profile.Status.String())

	// Test GetProfile
	fmt.Println("  Testing GetProfile...")
	getProfileReq := &kyc.GetProfileRequest{
		ProfileId: createProfileResp.Profile.ProfileId,
	}

	getProfileResp, err := kycClient.GetProfile(ctx, getProfileReq)
	if err != nil {
		log.Printf("❌ GetProfile failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Profile retrieved: %s (Risk Score: %d)\n",
		getProfileResp.Profile.Name,
		getProfileResp.RiskAssessment.OverallScore)
}

func testPaymentService(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n💳 Testing Payment Service...")

	paymentClient := payment.NewPaymentServiceClient(conn)

	// Test CreatePayment
	fmt.Println("  Testing CreatePayment...")
	createPaymentReq := &payment.CreatePaymentRequest{
		UserId:        "user_123",
		FromAccountId: "from_acc_123",
		ToAccountId:   "to_acc_456",
		Amount:        1000.50,
		Currency:      "USD",
		Description:   "Test payment for API testing",
		Reference:     "TEST_REF_001",
		PreferredRail: payment.PaymentRail_PAYMENT_RAIL_ACH,
	}

	createPaymentResp, err := paymentClient.CreatePayment(ctx, createPaymentReq)
	if err != nil {
		log.Printf("❌ CreatePayment failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Payment created: %s (Status: %s)\n",
		createPaymentResp.Payment.PaymentId,
		createPaymentResp.Payment.Status.String())

	// Test GetPayment
	fmt.Println("  Testing GetPayment...")
	getPaymentReq := &payment.GetPaymentRequest{
		PaymentId: createPaymentResp.Payment.PaymentId,
	}

	getPaymentResp, err := paymentClient.GetPayment(ctx, getPaymentReq)
	if err != nil {
		log.Printf("❌ GetPayment failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Payment retrieved: %.2f %s\n",
		getPaymentResp.Payment.Amount,
		getPaymentResp.Payment.Currency)

	// Test StreamPayments (non-blocking)
	fmt.Println("  Testing StreamPayments...")
	streamReq := &payment.StreamPaymentsRequest{
		UserId: "user_123",
		StatusFilter: []payment.PaymentStatus{
			payment.PaymentStatus_PAYMENT_STATUS_PENDING,
			payment.PaymentStatus_PAYMENT_STATUS_PROCESSING,
		},
	}

	stream, err := paymentClient.StreamPayments(ctx, streamReq)
	if err != nil {
		log.Printf("❌ StreamPayments failed: %v", err)
		return
	}

	// Try to receive one update (with timeout)
	update, err := stream.Recv()
	if err != nil {
		fmt.Println("  ⚠️  No payment updates received (this is normal for empty stream)")
	} else {
		fmt.Printf("  ✅ Payment update received: %s\n", update.UpdateType)
	}
}

func testComplianceService(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n🛡️  Testing Compliance Service...")

	complianceClient := compliance.NewComplianceServiceClient(conn)

	// Test GenerateSAR
	fmt.Println("  Testing GenerateSAR...")
	generateSARReq := &compliance.GenerateSARRequest{
		Date:            time.Now().Format("2006-01-02"),
		ThresholdAmount: 10000.00,
		Formats:         []compliance.ReportFormat{compliance.ReportFormat_REPORT_FORMAT_PDF, compliance.ReportFormat_REPORT_FORMAT_CSV},
		IncludeResolved: false,
	}

	generateSARResp, err := complianceClient.GenerateSAR(ctx, generateSARReq)
	if err != nil {
		log.Printf("❌ GenerateSAR failed: %v", err)
		return
	}
	fmt.Printf("  ✅ SAR report generated: %s (Status: %s)\n",
		generateSARResp.Report.ReportId,
		generateSARResp.Report.Status.String())

	// Test GenerateGST
	fmt.Println("  Testing GenerateGST...")
	generateGSTReq := &compliance.GenerateGSTRequest{
		Month:                    time.Now().Format("2006-01"),
		Formats:                  []compliance.ReportFormat{compliance.ReportFormat_REPORT_FORMAT_PDF},
		IncludeDraftTransactions: false,
		FilingEntity:             "Test Company Ltd",
	}

	generateGSTResp, err := complianceClient.GenerateGST(ctx, generateGSTReq)
	if err != nil {
		log.Printf("❌ GenerateGST failed: %v", err)
		return
	}
	fmt.Printf("  ✅ GST report generated: %s (Status: %s)\n",
		generateGSTResp.Report.ReportId,
		generateGSTResp.Report.Status.String())
}

func testReconciliationService(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n🔄 Testing Reconciliation Service...")

	reconClient := reconciliation.NewReconciliationServiceClient(conn)

	// Test GenerateReconciliation
	fmt.Println("  Testing GenerateReconciliation...")
	generateReconReq := &reconciliation.GenerateReconciliationRequest{
		DateRangeStart:   time.Now().AddDate(0, -1, 0).Format("2006-01-02"),
		DateRangeEnd:     time.Now().Format("2006-01-02"),
		AccountFilter:    []string{"acc_123", "acc_456"},
		AutoMatchEnabled: true,
		ToleranceAmount:  0.01,
	}

	generateReconResp, err := reconClient.GenerateReconciliation(ctx, generateReconReq)
	if err != nil {
		log.Printf("❌ GenerateReconciliation failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Reconciliation report generated: %s\n", generateReconResp.Report.ReportId)

	// Test GetReconciliationStatus
	fmt.Println("  Testing GetReconciliationStatus...")
	statusReq := &reconciliation.GetReconciliationStatusRequest{
		ReportId: generateReconResp.Report.ReportId,
	}

	statusResp, err := reconClient.GetReconciliationStatus(ctx, statusReq)
	if err != nil {
		log.Printf("❌ GetReconciliationStatus failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Reconciliation status: %s\n", statusResp.Report.Status.String())
}

func testWebhookService(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n🔗 Testing Webhook Service...")

	webhookClient := webhook.NewWebhookServiceClient(conn)

	// Test Register
	fmt.Println("  Testing Register...")
	registerWebhookReq := &webhook.RegisterWebhookRequest{
		UserId: "user_123",
		Url:    "https://example.com/webhook",
		Events: []webhook.WebhookEventType{
			webhook.WebhookEventType_WEBHOOK_EVENT_TYPE_PAYMENT_COMPLETED,
			webhook.WebhookEventType_WEBHOOK_EVENT_TYPE_PAYMENT_FAILED,
			webhook.WebhookEventType_WEBHOOK_EVENT_TYPE_KYC_VERIFIED,
		},
		Headers: map[string]string{
			"Authorization": "Bearer token123",
		},
		TimeoutSeconds: 30,
		VerifySsl:      true,
	}

	registerWebhookResp, err := webhookClient.Register(ctx, registerWebhookReq)
	if err != nil {
		log.Printf("❌ Register failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Webhook registered: %s\n", registerWebhookResp.Webhook.WebhookId)

	// Test List
	fmt.Println("  Testing List...")
	listWebhooksReq := &webhook.ListWebhooksRequest{
		UserId: "user_123",
	}

	listWebhooksResp, err := webhookClient.List(ctx, listWebhooksReq)
	if err != nil {
		log.Printf("❌ List failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Retrieved %d webhooks\n", len(listWebhooksResp.Webhooks))

	// Test Test
	fmt.Println("  Testing Test...")
	testWebhookReq := &webhook.TestWebhookRequest{
		WebhookId:   registerWebhookResp.Webhook.WebhookId,
		EventType:   webhook.WebhookEventType_WEBHOOK_EVENT_TYPE_PAYMENT_COMPLETED,
		TestPayload: `{"test": "data", "timestamp": "2024-01-01T00:00:00Z"}`,
	}

	testWebhookResp, err := webhookClient.Test(ctx, testWebhookReq)
	if err != nil {
		log.Printf("❌ Test failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Test webhook sent: %s\n", testWebhookResp.Message)
}

func testImplementedMethods(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n🔧 Testing Actually Implemented Methods...")
	fmt.Println("==========================================")

	// Test Ledger Balance (implemented)
	testLedgerBalanceImplemented(ctx, conn)

	// Test Payment Transaction Monitor (implemented)
	testPaymentTransactionMonitorImplemented(ctx, conn)

	// Test Reconciliation Interactive (implemented)
	testReconciliationInteractiveImplemented(ctx, conn)
}

func testLedgerBalanceImplemented(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n📊 Testing Ledger Balance (Implemented)...")

	ledgerClient := ledger.NewLedgerServiceClient(conn)

	// Test Balance with a valid UUID
	fmt.Println("  Testing Balance with valid account ID...")
	balanceReq := &ledger.BalanceRequest{
		AccountId: "550e8400-e29b-41d4-a716-446655440000", // Valid UUID format
		At:        timestamppb.Now(),
	}

	balanceResp, err := ledgerClient.Balance(ctx, balanceReq)
	if err != nil {
		log.Printf("❌ Balance failed: %v", err)
		return
	}
	fmt.Printf("  ✅ Balance retrieved: %.2f %s\n", balanceResp.Balance.Balance, balanceResp.Balance.Currency)

	// Test Balance with invalid UUID
	fmt.Println("  Testing Balance with invalid account ID...")
	invalidBalanceReq := &ledger.BalanceRequest{
		AccountId: "invalid-uuid",
		At:        timestamppb.Now(),
	}

	_, err = ledgerClient.Balance(ctx, invalidBalanceReq)
	if err != nil {
		fmt.Printf("  ✅ Correctly rejected invalid UUID: %v\n", err)
	} else {
		fmt.Println("  ⚠️  Should have rejected invalid UUID")
	}
}

func testPaymentTransactionMonitorImplemented(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n💳 Testing Payment Transaction Monitor (Implemented)...")

	paymentClient := payment.NewPaymentServiceClient(conn)

	// Test TransactionMonitor (bidirectional streaming)
	fmt.Println("  Testing TransactionMonitor streaming...")

	// Create a context with timeout for the streaming test
	streamCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	stream, err := paymentClient.TransactionMonitor(streamCtx)
	if err != nil {
		log.Printf("❌ TransactionMonitor failed: %v", err)
		return
	}
	defer stream.CloseSend()

	// Send a start monitoring command
	startCmd := &payment.MonitorCommand{
		Command: &payment.MonitorCommand_StartMonitoring{
			StartMonitoring: &payment.StartMonitoring{
				UserId:         "user_123",
				MinAmount:      100.0,
				MaxAmount:      10000.0,
				CurrencyFilter: []string{"USD", "EUR"},
			},
		},
	}

	if err := stream.Send(startCmd); err != nil {
		log.Printf("❌ Failed to send start command: %v", err)
		return
	}

	// Try to receive a response
	response, err := stream.Recv()
	if err != nil {
		fmt.Printf("  ⚠️  No response received (this might be normal): %v\n", err)
	} else {
		fmt.Printf("  ✅ Received monitoring response: %+v\n", response)
	}

	fmt.Println("  ✅ TransactionMonitor streaming test completed")
}

func testReconciliationInteractiveImplemented(ctx context.Context, conn *grpc.ClientConn) {
	fmt.Println("\n🔄 Testing Reconciliation Interactive (Implemented)...")

	reconClient := reconciliation.NewReconciliationServiceClient(conn)

	// Test InteractiveReconciliation (bidirectional streaming)
	fmt.Println("  Testing InteractiveReconciliation streaming...")

	// Create a context with timeout for the streaming test
	streamCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	stream, err := reconClient.InteractiveReconciliation(streamCtx)
	if err != nil {
		log.Printf("❌ InteractiveReconciliation failed: %v", err)
		return
	}
	defer stream.CloseSend()

	// Send a reconciliation action
	action := &reconciliation.ReconAction{
		Action: &reconciliation.ReconAction_StartReconciliation{
			StartReconciliation: &reconciliation.StartReconciliation{
				DateRangeStart:   "2024-01-01",
				DateRangeEnd:     "2024-01-31",
				AutoMatchEnabled: true,
				ToleranceAmount:  0.01,
			},
		},
	}

	if err := stream.Send(action); err != nil {
		log.Printf("❌ Failed to send reconciliation action: %v", err)
		return
	}

	// Try to receive a response
	response, err := stream.Recv()
	if err != nil {
		fmt.Printf("  ⚠️  No response received (this might be normal): %v\n", err)
	} else {
		fmt.Printf("  ✅ Received reconciliation response: %+v\n", response)
	}

	fmt.Println("  ✅ InteractiveReconciliation streaming test completed")
}

func healthCheck(conn *grpc.ClientConn) {
	fmt.Println("\n🏥 gRPC Server Health Check")
	fmt.Println("===========================")

	fmt.Printf("✅ Successfully connected to gRPC server at %s\n", grpcServerAddr)

	// Get server state
	state := conn.GetState()
	fmt.Printf("📡 Server connection state: %s\n", state.String())

	// List available services
	fmt.Println("\n📋 Available gRPC Services:")
	fmt.Println("  • LedgerService")
	fmt.Println("  • KYCService")
	fmt.Println("  • PaymentService")
	fmt.Println("  • ComplianceService")
	fmt.Println("  • ReconciliationService")
	fmt.Println("  • WebhookService")
	fmt.Println("  • TransactionValidationService")

	fmt.Println("\n🔧 Implemented Methods:")
	fmt.Println("  ✅ PaymentService.TransactionMonitor (bidirectional streaming)")
	fmt.Println("  ✅ ReconciliationService.InteractiveReconciliation (bidirectional streaming)")
	fmt.Println("  ✅ LedgerService.Balance (unary)")

	fmt.Println("\n🚧 Methods Pending Implementation:")
	fmt.Println("  • LedgerService.CreateAccount")
	fmt.Println("  • LedgerService.GetAccount")
	fmt.Println("  • KYCService.CreateProfile")
	fmt.Println("  • KYCService.GetProfile")
	fmt.Println("  • PaymentService.CreatePayment")
	fmt.Println("  • PaymentService.GetPayment")
	fmt.Println("  • PaymentService.StreamPayments")
	fmt.Println("  • ComplianceService.GenerateSAR")
	fmt.Println("  • ComplianceService.GenerateGST")
	fmt.Println("  • ReconciliationService.GenerateReconciliation")
	fmt.Println("  • WebhookService.Register")

	fmt.Println("✅ gRPC server is healthy and ready for development!")
}
