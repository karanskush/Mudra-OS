package handlers

import (
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"fintech-api/pkg/models"
	"fintech-api/pkg/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Initialize random seed
func init() {
	rand.Seed(time.Now().UnixNano())
}

// LedgerHandler handles ledger-related HTTP requests
type LedgerHandler struct {
	ledgerService *services.LedgerService
}

// NewLedgerHandler creates a new ledger handler
func NewLedgerHandler(ledgerService *services.LedgerService) *LedgerHandler {
	return &LedgerHandler{
		ledgerService: ledgerService,
	}
}

// CreateAccountRequest represents the request to create a ledger account
type CreateAccountRequest struct {
	AccountNumber string                   `json:"account_number"`
	Name          string                   `json:"name" binding:"required"`
	Description   string                   `json:"description"`
	Currency      string                   `json:"currency" binding:"required"`
	Type          models.LedgerAccountType `json:"type" binding:"required"`
	ParentID      *uuid.UUID               `json:"parent_id"`
}

// CreateAccount creates a new ledger account
func (h *LedgerHandler) CreateAccount(c *gin.Context) {
	var req CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (assuming it's set by auth middleware)
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	account, err := h.ledgerService.CreateAccount(
		userID,
		generateAccountNumber(),
		req.Name,
		req.Description,
		req.Currency,
		req.Type,
		req.ParentID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, account)
}

// generateAccountNumber generates a random 10-digit account number
func generateAccountNumber() string {
	// Generate a 10-digit number
	accountNum := rand.Intn(9000000000) + 1000000000 // Range: 1000000000-9999999999
	return fmt.Sprintf("%d", accountNum)
}

// CreateTransferRequest represents the request to create a transfer
type CreateTransferRequest struct {
	FromAccountID uuid.UUID `json:"from_account_id" binding:"required"`
	ToAccountID   uuid.UUID `json:"to_account_id" binding:"required"`
	Amount        float64   `json:"amount" binding:"required,gt=0"`
	Currency      string    `json:"currency" binding:"required"`
	Description   string    `json:"description"`
	Reference     string    `json:"reference"`
}

// CreateTransfer creates a transfer between two accounts
func (h *LedgerHandler) CreateTransfer(c *gin.Context) {
	var req CreateTransferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	response, err := h.ledgerService.CreateTransfer(
		userID,
		req.FromAccountID,
		req.ToAccountID,
		req.Amount,
		req.Currency,
		req.Description,
		req.Reference,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, response)
}

// CreateDepositRequest represents the request to create a deposit
type CreateDepositRequest struct {
	AccountID   uuid.UUID `json:"account_id" binding:"required"`
	Amount      float64   `json:"amount" binding:"required,gt=0"`
	Currency    string    `json:"currency" binding:"required"`
	Description string    `json:"description" binding:"required"`
	Reference   string    `json:"reference" binding:"required"`
}

// CreateDeposit creates a deposit transaction
func (h *LedgerHandler) CreateDeposit(c *gin.Context) {
	var req CreateDepositRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	transaction, err := h.ledgerService.CreateDeposit(
		userID,
		req.AccountID,
		req.Amount,
		req.Currency,
		req.Description,
		req.Reference,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}

// CreateTestBalance creates a test balance transaction without validation
func (h *LedgerHandler) CreateTestBalance(c *gin.Context) {
	var req CreateDepositRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context
	userIDStr := c.GetString("user_id")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	transaction, err := h.ledgerService.CreateTestBalance(
		userID,
		req.AccountID,
		req.Amount,
		req.Currency,
		req.Description,
		req.Reference,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}

// PostTransaction posts a transaction to the ledger
func (h *LedgerHandler) PostTransaction(c *gin.Context) {
	transactionIDStr := c.Param("id")
	transactionID, err := uuid.Parse(transactionIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid transaction ID"})
		return
	}

	if err := h.ledgerService.PostTransaction(transactionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction posted successfully"})
}

// GetAccountBalance returns the balance of an account
func (h *LedgerHandler) GetAccountBalance(c *gin.Context) {
	accountIDStr := c.Param("id")
	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account ID"})
		return
	}

	balance, err := h.ledgerService.GetAccountBalance(accountID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"balance": balance})
}

// GetAccountTransactions returns transactions for an account
func (h *LedgerHandler) GetAccountTransactions(c *gin.Context) {
	accountIDStr := c.Param("id")
	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid account ID"})
		return
	}

	// Get pagination parameters
	limitStr := c.DefaultQuery("limit", "50")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid limit parameter"})
		return
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid offset parameter"})
		return
	}

	transactions, err := h.ledgerService.GetAccountTransactions(accountID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, transactions)
}

// GetTrialBalance returns a trial balance for all accounts
func (h *LedgerHandler) GetTrialBalance(c *gin.Context) {
	trialBalance, err := h.ledgerService.GetTrialBalance()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, trialBalance)
}
