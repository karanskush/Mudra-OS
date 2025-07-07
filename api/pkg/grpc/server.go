package grpc

import (
	"fintech-api/pkg/database"
	"fintech-api/pkg/grpc/handlers"
	"fintech-api/pkg/repository"
	"fintech-api/pkg/services"
	compliancepb "fintech-api/proto/gen/compliance"
	kycpb "fintech-api/proto/gen/kyc"
	ledgerpb "fintech-api/proto/gen/ledger"
	paymentpb "fintech-api/proto/gen/payment"
	paymentprocessingpb "fintech-api/proto/gen/payment_processing"
	reconpb "fintech-api/proto/gen/reconciliation"
	webhookpb "fintech-api/proto/gen/webhook"

	"google.golang.org/grpc"
)

// RegisterServices registers all gRPC services with the server
func RegisterServices(s *grpc.Server) {
	db := database.GetDB()
	if db == nil {
		panic("Database not initialized")
	}

	// Initialize services
	ledgerService := services.NewLedgerService(db)
	kycRepo := repository.NewKYCRepository(db)
	kycService := services.NewKYCService(kycRepo)

	// Initialize gRPC handlers
	ledgerHandler := handlers.NewLedgerHandler(ledgerService)
	paymentHandler := handlers.NewPaymentHandler(ledgerService)
	paymentProcessingHandler := handlers.NewPaymentProcessingHandler(ledgerService)
	kycHandler := handlers.NewKYCHandler(kycService)
	reconHandler := handlers.NewReconciliationHandler(db)
	complianceHandler := handlers.NewComplianceHandler(db)
	webhookHandler := handlers.NewWebhookHandler(db)

	// Register services
	ledgerpb.RegisterLedgerServiceServer(s, ledgerHandler)
	paymentpb.RegisterPaymentServiceServer(s, paymentHandler)
	paymentprocessingpb.RegisterPaymentProcessingServiceServer(s, paymentProcessingHandler)
	kycpb.RegisterKYCServiceServer(s, kycHandler)
	reconpb.RegisterReconciliationServiceServer(s, reconHandler)
	compliancepb.RegisterComplianceServiceServer(s, complianceHandler)
	webhookpb.RegisterWebhookServiceServer(s, webhookHandler)
}
