package handlers

import (
	"context"
	"fmt"

	"fintech-api/pkg/services"
	pb "fintech-api/proto/gen/transaction_validation"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
	"gorm.io/gorm"
)

// TransactionValidationHandler implements the TransactionValidationService
type TransactionValidationHandler struct {
	pb.UnimplementedTransactionValidationServiceServer
	db            *gorm.DB
	ledgerService *services.LedgerService
}

// NewTransactionValidationHandler creates a new transaction validation handler
func NewTransactionValidationHandler(db *gorm.DB) *TransactionValidationHandler {
	return &TransactionValidationHandler{
		db:            db,
		ledgerService: services.NewLedgerService(db),
	}
}

// ValidateTransaction validates a single transaction
func (h *TransactionValidationHandler) ValidateTransaction(ctx context.Context, req *pb.ValidateTransactionRequest) (*pb.ValidateTransactionResponse, error) {
	var validationErrors []*pb.ValidationError
	var warnings []string

	// Validate user ID
	userUUID, err := uuid.Parse(req.UserId)
	if err != nil {
		validationErrors = append(validationErrors, &pb.ValidationError{
			Field:        "user_id",
			ErrorCode:    "INVALID_UUID",
			ErrorMessage: "Invalid user ID format",
			Severity:     pb.ValidationSeverity_VALIDATION_SEVERITY_ERROR,
			Suggestion:   "Provide a valid UUID for user ID",
		})
	}

	// Validate account IDs
	fromAccountUUID, err := uuid.Parse(req.FromAccountId)
	if err != nil {
		validationErrors = append(validationErrors, &pb.ValidationError{
			Field:        "from_account_id",
			ErrorCode:    "INVALID_UUID",
			ErrorMessage: "Invalid from account ID format",
			Severity:     pb.ValidationSeverity_VALIDATION_SEVERITY_ERROR,
			Suggestion:   "Provide a valid UUID for from account ID",
		})
	}

	_, err = uuid.Parse(req.ToAccountId)
	if err != nil {
		validationErrors = append(validationErrors, &pb.ValidationError{
			Field:        "to_account_id",
			ErrorCode:    "INVALID_UUID",
			ErrorMessage: "Invalid to account ID format",
			Severity:     pb.ValidationSeverity_VALIDATION_SEVERITY_ERROR,
			Suggestion:   "Provide a valid UUID for to account ID",
		})
	}

	// Validate amount
	if req.Amount <= 0 {
		validationErrors = append(validationErrors, &pb.ValidationError{
			Field:        "amount",
			ErrorCode:    "INVALID_AMOUNT",
			ErrorMessage: "Amount must be greater than zero",
			Severity:     pb.ValidationSeverity_VALIDATION_SEVERITY_ERROR,
			Suggestion:   "Provide a positive amount",
		})
	}

	// Validate currency
	if req.Currency == "" {
		validationErrors = append(validationErrors, &pb.ValidationError{
			Field:        "currency",
			ErrorCode:    "MISSING_CURRENCY",
			ErrorMessage: "Currency is required",
			Severity:     pb.ValidationSeverity_VALIDATION_SEVERITY_ERROR,
			Suggestion:   "Provide a valid currency code (e.g., USD, EUR)",
		})
	}

	var availableBalance float64
	var estimatedFees *pb.TransactionFees
	var complianceCheck *pb.ComplianceCheck

	// If basic validation passes, check account balance and other details
	if len(validationErrors) == 0 {
		// Check account balance
		balance, err := h.ledgerService.GetAccountBalance(fromAccountUUID)
		if err != nil {
			validationErrors = append(validationErrors, &pb.ValidationError{
				Field:        "from_account_id",
				ErrorCode:    "ACCOUNT_NOT_FOUND",
				ErrorMessage: "Unable to retrieve account balance",
				Severity:     pb.ValidationSeverity_VALIDATION_SEVERITY_ERROR,
				Suggestion:   "Verify the account exists and is accessible",
			})
		} else {
			availableBalance = balance

			// Check sufficient balance
			if balance < req.Amount {
				validationErrors = append(validationErrors, &pb.ValidationError{
					Field:        "amount",
					ErrorCode:    "INSUFFICIENT_BALANCE",
					ErrorMessage: fmt.Sprintf("Insufficient balance: %.2f < %.2f", balance, req.Amount),
					Severity:     pb.ValidationSeverity_VALIDATION_SEVERITY_ERROR,
					Suggestion:   "Reduce the amount or add funds to the account",
				})
			}
		}

		// Calculate estimated fees (mock implementation)
		estimatedFees = calculateTransactionFees(req.Amount, req.Currency, req.TransactionType)

		// Perform compliance check (mock implementation)
		complianceCheck = performComplianceCheck(req.Amount, req.Currency, userUUID)

		// Add warnings for high amounts
		if req.Amount > 10000 {
			warnings = append(warnings, "High value transaction - may require additional verification")
		}

		if req.Amount > 50000 {
			warnings = append(warnings, "Very high value transaction - compliance review required")
		}
	}

	// Determine validation result
	result := pb.ValidationResult_VALIDATION_RESULT_VALID
	if len(validationErrors) > 0 {
		result = pb.ValidationResult_VALIDATION_RESULT_INVALID
	} else if complianceCheck != nil && complianceCheck.RequiresKyc {
		result = pb.ValidationResult_VALIDATION_RESULT_REQUIRES_APPROVAL
	}

	return &pb.ValidateTransactionResponse{
		Result:           result,
		ValidationErrors: validationErrors,
		AvailableBalance: availableBalance,
		EstimatedFees:    estimatedFees,
		EstimatedTotal:   req.Amount + (estimatedFees.GetTotalFee()),
		Warnings:         warnings,
		ComplianceCheck:  complianceCheck,
		ValidatedAt:      timestamppb.Now(),
		ValidationId:     uuid.New().String(),
	}, nil
}

// BatchValidateTransactions validates multiple transactions
func (h *TransactionValidationHandler) BatchValidateTransactions(ctx context.Context, req *pb.BatchValidateRequest) (*pb.BatchValidateResponse, error) {
	var results []pb.ValidationResult
	var validCount, invalidCount, warningCount int32
	var totalAmount, totalFees float64
	var batchWarnings []string

	for _, txn := range req.Transactions {
		resp, err := h.ValidateTransaction(ctx, txn)
		if err != nil {
			if req.StopOnFirstError {
				return nil, status.Errorf(codes.Internal, "validation failed: %v", err)
			}
			results = append(results, pb.ValidationResult_VALIDATION_RESULT_INVALID)
			invalidCount++
			continue
		}

		results = append(results, resp.Result)
		totalAmount += txn.Amount
		totalFees += resp.EstimatedFees.GetTotalFee()

		switch resp.Result {
		case pb.ValidationResult_VALIDATION_RESULT_VALID:
			validCount++
		case pb.ValidationResult_VALIDATION_RESULT_INVALID:
			invalidCount++
		case pb.ValidationResult_VALIDATION_RESULT_REQUIRES_APPROVAL:
			warningCount++
		}
	}

	// Add batch-level warnings
	if totalAmount > 100000 {
		batchWarnings = append(batchWarnings, "Batch total exceeds $100,000 - enhanced monitoring required")
	}

	if len(req.Transactions) > 50 {
		batchWarnings = append(batchWarnings, "Large batch size - consider splitting for better performance")
	}

	return &pb.BatchValidateResponse{
		Results:          results,
		ValidCount:       validCount,
		InvalidCount:     invalidCount,
		WarningCount:     warningCount,
		TotalAmount:      totalAmount,
		TotalFees:        totalFees,
		BatchWarnings:    batchWarnings,
		BatchValidatedAt: timestamppb.Now(),
	}, nil
}

// calculateTransactionFees calculates estimated fees for a transaction
func calculateTransactionFees(amount float64, currency string, transactionType string) *pb.TransactionFees {
	var baseFee, processingFee, fxFee, complianceFee float64

	// Mock fee calculation
	switch transactionType {
	case "transfer":
		baseFee = 2.0
		processingFee = amount * 0.001 // 0.1%
	case "payment":
		baseFee = 1.0
		processingFee = amount * 0.005 // 0.5%
	case "withdrawal":
		baseFee = 5.0
		processingFee = amount * 0.002 // 0.2%
	default:
		baseFee = 1.0
		processingFee = amount * 0.001
	}

	// FX fee for non-USD
	if currency != "USD" {
		fxFee = amount * 0.01 // 1% FX fee
	}

	// Compliance fee for large amounts
	if amount > 10000 {
		complianceFee = 10.0
	}

	totalFee := baseFee + processingFee + fxFee + complianceFee

	return &pb.TransactionFees{
		BaseFee:       baseFee,
		ProcessingFee: processingFee,
		FxFee:         fxFee,
		ComplianceFee: complianceFee,
		TotalFee:      totalFee,
		Currency:      currency,
		FeeComponents: []*pb.FeeComponent{
			{Name: "Base Fee", Amount: baseFee, Description: "Fixed base transaction fee", Type: "fixed"},
			{Name: "Processing Fee", Amount: processingFee, Description: "Variable processing fee", Type: "percentage"},
			{Name: "FX Fee", Amount: fxFee, Description: "Foreign exchange fee", Type: "percentage"},
			{Name: "Compliance Fee", Amount: complianceFee, Description: "Compliance screening fee", Type: "fixed"},
		},
	}
}

// performComplianceCheck performs a compliance check on the transaction
func performComplianceCheck(amount float64, currency string, userID uuid.UUID) *pb.ComplianceCheck {
	var flags []string
	riskScore := int32(10) // Base risk score

	// Risk factors
	if amount > 10000 {
		flags = append(flags, "high_value")
		riskScore += 20
	}

	if currency != "USD" {
		flags = append(flags, "foreign_currency")
		riskScore += 10
	}

	// Determine compliance level
	var complianceLevel string
	var requiresKyc bool
	var requiredDocuments []string

	if riskScore < 30 {
		complianceLevel = "low"
	} else if riskScore < 60 {
		complianceLevel = "medium"
		if amount > 5000 {
			requiresKyc = true
			requiredDocuments = append(requiredDocuments, "identity_verification")
		}
	} else {
		complianceLevel = "high"
		requiresKyc = true
		requiredDocuments = append(requiredDocuments, "identity_verification", "source_of_funds")
	}

	return &pb.ComplianceCheck{
		Passed:            riskScore < 80,
		ComplianceLevel:   complianceLevel,
		Flags:             flags,
		RiskScore:         riskScore,
		RequiresKyc:       requiresKyc,
		RequiredDocuments: requiredDocuments,
	}
}
