package handlers

import (
	"context"

	"fintech-backend/internal/services"
	ledgerpb "fintech-backend/proto/gen/proto"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// LedgerHandler implements the LedgerServiceServer
type LedgerHandler struct {
	ledgerpb.UnimplementedLedgerServiceServer
	ledgerService *services.LedgerService
}

// NewLedgerHandler creates a new ledger handler
func NewLedgerHandler(ledgerService *services.LedgerService) *LedgerHandler {
	return &LedgerHandler{
		ledgerService: ledgerService,
	}
}

// CreateAccount creates a new GL account
func (h *LedgerHandler) CreateAccount(ctx context.Context, req *ledgerpb.CreateAccountRequest) (*ledgerpb.CreateAccountResponse, error) {
	// For now, return an error indicating this needs implementation
	return nil, status.Errorf(codes.Unimplemented, "CreateAccount not yet implemented")
}

// GetAccount retrieves account metadata
func (h *LedgerHandler) GetAccount(ctx context.Context, req *ledgerpb.GetAccountRequest) (*ledgerpb.GetAccountResponse, error) {
	// For now, return an error indicating this needs implementation
	return nil, status.Errorf(codes.Unimplemented, "GetAccount not yet implemented")
}

// Balance retrieves point-in-time balance
func (h *LedgerHandler) Balance(ctx context.Context, req *ledgerpb.BalanceRequest) (*ledgerpb.BalanceResponse, error) {
	// Parse account ID
	accountID, err := uuid.Parse(req.AccountId)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid account_id: %v", err)
	}

	// Get current balance
	balance, err := h.ledgerService.GetAccountBalance(accountID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get balance: %v", err)
	}

	// Return current balance
	balanceResponse := &ledgerpb.Balance{
		AccountId: req.AccountId,
		Balance:   balance,
		Currency:  "USD", // TODO: Get from account
		AsOf:      timestamppb.Now(),
	}

	return &ledgerpb.BalanceResponse{
		Balance: balanceResponse,
	}, nil
}
