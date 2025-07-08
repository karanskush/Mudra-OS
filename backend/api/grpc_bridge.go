package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"fintech-backend/pkg/logger"

	kycpb "fintech-backend/proto/gen/kyc"
	paymentpb "fintech-backend/proto/gen/payment"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

// gRPC client connections
var (
	kycGRPCClient     kycpb.KYCServiceClient
	paymentGRPCClient paymentpb.PaymentServiceClient
	grpcConn          *grpc.ClientConn
)

// Initialize gRPC connections
func initGRPCClients() error {
	if grpcConn != nil {
		return nil
	}

	var err error
	grpcConn, err = grpc.Dial("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return fmt.Errorf("failed to connect to gRPC server: %v", err)
	}

	kycGRPCClient = kycpb.NewKYCServiceClient(grpcConn)
	paymentGRPCClient = paymentpb.NewPaymentServiceClient(grpcConn)

	logger.Info("gRPC clients initialized successfully")
	return nil
}

// handleGRPCKYCRoutes handles KYC gRPC bridge routes
func handleGRPCKYCRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	// Initialize gRPC clients if needed
	if err := initGRPCClients(); err != nil {
		http.Error(w, "Failed to initialize gRPC clients", http.StatusInternalServerError)
		return
	}

	// Set Content-Type for JSON responses
	w.Header().Set("Content-Type", "application/json")

	// Route based on path and method
	switch {
	case r.Method == "POST" && len(pathParts) >= 3 && pathParts[2] == "profiles":
		handleCreateKYCProfile(w, r)
	case r.Method == "GET" && len(pathParts) >= 4 && pathParts[2] == "profiles":
		handleGetKYCProfile(w, r, pathParts[3])
	default:
		http.Error(w, "Not found", http.StatusNotFound)
	}
}

// handleGRPCPaymentRoutes handles Payment gRPC bridge routes
func handleGRPCPaymentRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	// Initialize gRPC clients if needed
	if err := initGRPCClients(); err != nil {
		http.Error(w, "Failed to initialize gRPC clients", http.StatusInternalServerError)
		return
	}

	// Set Content-Type for JSON responses
	w.Header().Set("Content-Type", "application/json")

	// Route based on path and method
	switch {
	case r.Method == "POST" && len(pathParts) >= 3 && pathParts[2] == "":
		handleCreatePayment(w, r)
	case r.Method == "GET" && len(pathParts) >= 4 && pathParts[2] == "":
		handleGetPayment(w, r, pathParts[3])
	case r.Method == "GET" && len(pathParts) >= 4 && pathParts[3] == "stream":
		handleStreamPayments(w, r)
	default:
		http.Error(w, "Not found", http.StatusNotFound)
	}
}

// handleCreateKYCProfile handles KYC profile creation via gRPC
func handleCreateKYCProfile(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserId    string            `json:"userId"`
		Name      string            `json:"name"`
		Email     string            `json:"email"`
		Phone     string            `json:"phone"`
		Country   string            `json:"country"`
		Location  string            `json:"location"`
		Amount    int64             `json:"amount"`
		Documents map[string]string `json:"documents"`
		Avatar    string            `json:"avatar"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create gRPC request
	grpcReq := &kycpb.CreateProfileRequest{
		UserId:    req.UserId,
		Name:      req.Name,
		Email:     req.Email,
		Phone:     req.Phone,
		Country:   req.Country,
		Location:  req.Location,
		Amount:    req.Amount,
		Documents: req.Documents,
		Avatar:    req.Avatar,
	}

	// Call gRPC service
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	grpcResp, err := kycGRPCClient.CreateProfile(ctx, grpcReq)
	if err != nil {
		logger.Errorf("gRPC CreateProfile failed: %v", err)
		http.Error(w, "Failed to create KYC profile", http.StatusInternalServerError)
		return
	}

	// Convert gRPC response to REST response
	restResp := map[string]interface{}{
		"success": true,
		"profile": map[string]interface{}{
			"profileId":          grpcResp.Profile.ProfileId,
			"userId":             grpcResp.Profile.UserId,
			"name":               grpcResp.Profile.Name,
			"email":              grpcResp.Profile.Email,
			"phone":              grpcResp.Profile.Phone,
			"country":            grpcResp.Profile.Country,
			"location":           grpcResp.Profile.Location,
			"status":             grpcResp.Profile.Status.String(),
			"priority":           grpcResp.Profile.Priority.String(),
			"riskScore":          grpcResp.Profile.RiskScore,
			"amount":             grpcResp.Profile.Amount,
			"documents":          grpcResp.Profile.Documents,
			"complianceFlags":    grpcResp.Profile.ComplianceFlags,
			"verificationMethod": grpcResp.Profile.VerificationMethod,
			"processingTime":     grpcResp.Profile.ProcessingTime,
			"lastActivity":       grpcResp.Profile.LastActivity,
			"avatar":             grpcResp.Profile.Avatar,
			"submittedAt":        grpcResp.Profile.SubmittedAt.AsTime().Format(time.RFC3339),
			"updatedAt":          grpcResp.Profile.UpdatedAt.AsTime().Format(time.RFC3339),
		},
		"riskAssessment": map[string]interface{}{
			"overallScore": grpcResp.RiskAssessment.OverallScore,
			"riskLevel":    grpcResp.RiskAssessment.RiskLevel,
			"flags":        grpcResp.RiskAssessment.Flags,
			"factorScores": grpcResp.RiskAssessment.FactorScores,
		},
		"policyEvaluation": map[string]interface{}{
			"verdict":       grpcResp.PolicyEvaluation.Verdict,
			"policyVersion": grpcResp.PolicyEvaluation.PolicyVersion,
			"violatedRules": grpcResp.PolicyEvaluation.ViolatedRules,
			"policyContext": grpcResp.PolicyEvaluation.PolicyContext,
		},
		"message": grpcResp.Message,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(restResp)
}

// handleGetKYCProfile handles KYC profile retrieval via gRPC
func handleGetKYCProfile(w http.ResponseWriter, r *http.Request, profileId string) {
	// Create gRPC request
	grpcReq := &kycpb.GetProfileRequest{
		ProfileId: profileId,
	}

	// Call gRPC service
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	grpcResp, err := kycGRPCClient.GetProfile(ctx, grpcReq)
	if err != nil {
		logger.Errorf("gRPC GetProfile failed: %v", err)
		http.Error(w, "Failed to get KYC profile", http.StatusInternalServerError)
		return
	}

	// Convert gRPC response to REST response
	restResp := map[string]interface{}{
		"success": true,
		"profile": map[string]interface{}{
			"profileId":          grpcResp.Profile.ProfileId,
			"userId":             grpcResp.Profile.UserId,
			"name":               grpcResp.Profile.Name,
			"email":              grpcResp.Profile.Email,
			"phone":              grpcResp.Profile.Phone,
			"country":            grpcResp.Profile.Country,
			"location":           grpcResp.Profile.Location,
			"status":             grpcResp.Profile.Status.String(),
			"priority":           grpcResp.Profile.Priority.String(),
			"riskScore":          grpcResp.Profile.RiskScore,
			"amount":             grpcResp.Profile.Amount,
			"documents":          grpcResp.Profile.Documents,
			"complianceFlags":    grpcResp.Profile.ComplianceFlags,
			"verificationMethod": grpcResp.Profile.VerificationMethod,
			"processingTime":     grpcResp.Profile.ProcessingTime,
			"lastActivity":       grpcResp.Profile.LastActivity,
			"avatar":             grpcResp.Profile.Avatar,
			"submittedAt":        grpcResp.Profile.SubmittedAt.AsTime().Format(time.RFC3339),
			"updatedAt":          grpcResp.Profile.UpdatedAt.AsTime().Format(time.RFC3339),
		},
		"riskAssessment": map[string]interface{}{
			"overallScore": grpcResp.RiskAssessment.OverallScore,
			"riskLevel":    grpcResp.RiskAssessment.RiskLevel,
			"flags":        grpcResp.RiskAssessment.Flags,
			"factorScores": grpcResp.RiskAssessment.FactorScores,
		},
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(restResp)
}

// handleCreatePayment handles payment creation via gRPC
func handleCreatePayment(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserId        string  `json:"userId"`
		FromAccountId string  `json:"fromAccountId"`
		ToAccountId   string  `json:"toAccountId"`
		Amount        float64 `json:"amount"`
		Currency      string  `json:"currency"`
		Description   string  `json:"description"`
		Reference     string  `json:"reference"`
		ForceRail     bool    `json:"forceRail"`
		PreferredRail string  `json:"preferredRail"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert preferred rail string to enum
	var preferredRail paymentpb.PaymentRail
	switch strings.ToUpper(req.PreferredRail) {
	case "UPI":
		preferredRail = paymentpb.PaymentRail_PAYMENT_RAIL_UPI
	case "SEPA":
		preferredRail = paymentpb.PaymentRail_PAYMENT_RAIL_SEPA
	case "CRYPTO":
		preferredRail = paymentpb.PaymentRail_PAYMENT_RAIL_CRYPTO
	case "ACH":
		preferredRail = paymentpb.PaymentRail_PAYMENT_RAIL_ACH
	case "SWIFT":
		preferredRail = paymentpb.PaymentRail_PAYMENT_RAIL_SWIFT
	case "PIX":
		preferredRail = paymentpb.PaymentRail_PAYMENT_RAIL_PIX
	case "FASTER_PAYMENTS":
		preferredRail = paymentpb.PaymentRail_PAYMENT_RAIL_FASTER_PAYMENTS
	default:
		preferredRail = paymentpb.PaymentRail_PAYMENT_RAIL_UNSPECIFIED
	}

	// Create gRPC request
	grpcReq := &paymentpb.CreatePaymentRequest{
		UserId:        req.UserId,
		FromAccountId: req.FromAccountId,
		ToAccountId:   req.ToAccountId,
		Amount:        req.Amount,
		Currency:      req.Currency,
		Description:   req.Description,
		Reference:     req.Reference,
		ForceRail:     req.ForceRail,
		PreferredRail: preferredRail,
	}

	// Call gRPC service
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	grpcResp, err := paymentGRPCClient.CreatePayment(ctx, grpcReq)
	if err != nil {
		logger.Errorf("gRPC CreatePayment failed: %v", err)
		http.Error(w, "Failed to create payment", http.StatusInternalServerError)
		return
	}

	// Convert gRPC response to REST response
	restResp := map[string]interface{}{
		"success": true,
		"payment": map[string]interface{}{
			"paymentId":     grpcResp.Payment.PaymentId,
			"userId":        grpcResp.Payment.UserId,
			"fromAccountId": grpcResp.Payment.FromAccountId,
			"toAccountId":   grpcResp.Payment.ToAccountId,
			"amount":        grpcResp.Payment.Amount,
			"currency":      grpcResp.Payment.Currency,
			"description":   grpcResp.Payment.Description,
			"reference":     grpcResp.Payment.Reference,
			"status":        grpcResp.Payment.Status.String(),
			"chosenRail":    grpcResp.Payment.ChosenRail.String(),
			"fee":           grpcResp.Payment.Fee,
			"fxRate":        grpcResp.Payment.FxRate,
			"latency":       grpcResp.Payment.Latency,
			"amountSaved":   grpcResp.Payment.AmountSaved,
			"createdAt":     grpcResp.Payment.CreatedAt.AsTime().Format(time.RFC3339),
			"updatedAt":     grpcResp.Payment.UpdatedAt.AsTime().Format(time.RFC3339),
			"failureReason": grpcResp.Payment.FailureReason,
		},
		"kycCheck": map[string]interface{}{
			"passed":    grpcResp.KycCheck.Passed,
			"riskLevel": grpcResp.KycCheck.RiskLevel,
			"flags":     grpcResp.KycCheck.Flags,
		},
		"journalEntryId": grpcResp.JournalEntryId,
		"message":        grpcResp.Message,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(restResp)
}

// handleGetPayment handles payment retrieval via gRPC
func handleGetPayment(w http.ResponseWriter, r *http.Request, paymentId string) {
	// Create gRPC request
	grpcReq := &paymentpb.GetPaymentRequest{
		PaymentId: paymentId,
	}

	// Call gRPC service
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	grpcResp, err := paymentGRPCClient.GetPayment(ctx, grpcReq)
	if err != nil {
		logger.Errorf("gRPC GetPayment failed: %v", err)
		http.Error(w, "Failed to get payment", http.StatusInternalServerError)
		return
	}

	// Convert gRPC response to REST response
	restResp := map[string]interface{}{
		"success": true,
		"payment": map[string]interface{}{
			"paymentId":     grpcResp.Payment.PaymentId,
			"userId":        grpcResp.Payment.UserId,
			"fromAccountId": grpcResp.Payment.FromAccountId,
			"toAccountId":   grpcResp.Payment.ToAccountId,
			"amount":        grpcResp.Payment.Amount,
			"currency":      grpcResp.Payment.Currency,
			"description":   grpcResp.Payment.Description,
			"reference":     grpcResp.Payment.Reference,
			"status":        grpcResp.Payment.Status.String(),
			"chosenRail":    grpcResp.Payment.ChosenRail.String(),
			"fee":           grpcResp.Payment.Fee,
			"fxRate":        grpcResp.Payment.FxRate,
			"latency":       grpcResp.Payment.Latency,
			"amountSaved":   grpcResp.Payment.AmountSaved,
			"createdAt":     grpcResp.Payment.CreatedAt.AsTime().Format(time.RFC3339),
			"updatedAt":     grpcResp.Payment.UpdatedAt.AsTime().Format(time.RFC3339),
			"failureReason": grpcResp.Payment.FailureReason,
		},
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(restResp)
}

// handleStreamPayments handles payment streaming via Server-Sent Events
func handleStreamPayments(w http.ResponseWriter, r *http.Request) {
	// Set headers for Server-Sent Events
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Cache-Control")

	// Get query parameters
	userId := r.URL.Query().Get("user_id")
	statusFilters := r.URL.Query()["status_filter"]

	// Create gRPC request
	grpcReq := &paymentpb.StreamPaymentsRequest{
		UserId: userId,
	}

	// Convert status filters to enum
	for _, status := range statusFilters {
		switch strings.ToUpper(status) {
		case "PENDING":
			grpcReq.StatusFilter = append(grpcReq.StatusFilter, paymentpb.PaymentStatus_PAYMENT_STATUS_PENDING)
		case "PROCESSING":
			grpcReq.StatusFilter = append(grpcReq.StatusFilter, paymentpb.PaymentStatus_PAYMENT_STATUS_PROCESSING)
		case "COMPLETED":
			grpcReq.StatusFilter = append(grpcReq.StatusFilter, paymentpb.PaymentStatus_PAYMENT_STATUS_COMPLETED)
		case "FAILED":
			grpcReq.StatusFilter = append(grpcReq.StatusFilter, paymentpb.PaymentStatus_PAYMENT_STATUS_FAILED)
		case "CANCELLED":
			grpcReq.StatusFilter = append(grpcReq.StatusFilter, paymentpb.PaymentStatus_PAYMENT_STATUS_CANCELLED)
		case "REFUNDED":
			grpcReq.StatusFilter = append(grpcReq.StatusFilter, paymentpb.PaymentStatus_PAYMENT_STATUS_REFUNDED)
		}
	}

	// Call gRPC streaming service
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	stream, err := paymentGRPCClient.StreamPayments(ctx, grpcReq)
	if err != nil {
		logger.Errorf("gRPC StreamPayments failed: %v", err)
		fmt.Fprintf(w, "data: %s\n\n", `{"error": "Failed to start payment stream"}`)
		return
	}

	// Stream responses
	for {
		update, err := stream.Recv()
		if err != nil {
			logger.Errorf("Error receiving payment update: %v", err)
			break
		}

		// Convert to JSON and send as SSE
		updateData := map[string]interface{}{
			"payment": map[string]interface{}{
				"paymentId":     update.Payment.PaymentId,
				"userId":        update.Payment.UserId,
				"fromAccountId": update.Payment.FromAccountId,
				"toAccountId":   update.Payment.ToAccountId,
				"amount":        update.Payment.Amount,
				"currency":      update.Payment.Currency,
				"description":   update.Payment.Description,
				"reference":     update.Payment.Reference,
				"status":        update.Payment.Status.String(),
				"chosenRail":    update.Payment.ChosenRail.String(),
				"fee":           update.Payment.Fee,
				"fxRate":        update.Payment.FxRate,
				"latency":       update.Payment.Latency,
				"amountSaved":   update.Payment.AmountSaved,
				"createdAt":     update.Payment.CreatedAt.AsTime().Format(time.RFC3339),
				"updatedAt":     update.Payment.UpdatedAt.AsTime().Format(time.RFC3339),
				"failureReason": update.Payment.FailureReason,
			},
			"updateType": update.UpdateType,
			"timestamp":  update.Timestamp.AsTime().Format(time.RFC3339),
		}

		jsonData, _ := json.Marshal(updateData)
		fmt.Fprintf(w, "data: %s\n\n", jsonData)
		w.(http.Flusher).Flush()
	}
}
