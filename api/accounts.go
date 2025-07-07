package handler

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"api/pkg/database"
	"api/pkg/middleware"
	"api/pkg/models"
	"api/pkg/response"

	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

// Initialize random seed
func init() {
	rand.Seed(time.Now().UnixNano())
}

// CreateAccountRequest represents the account creation request
type CreateAccountRequest struct {
	Type           string  `json:"type" validate:"required"`
	Name           string  `json:"name" validate:"required"`
	Description    string  `json:"description"`
	Currency       string  `json:"currency" validate:"required"`
	InitialBalance float64 `json:"initial_balance"`
}

// AccountData represents account data in response
type AccountData struct {
	ID            string    `json:"id"`
	AccountNumber string    `json:"account_number"`
	Type          string    `json:"type"`
	Status        string    `json:"status"`
	Balance       float64   `json:"balance"`
	Currency      string    `json:"currency"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	CreatedAt     time.Time `json:"created_at"`
}

// getDB returns the database connection
func getDB() *gorm.DB {
	// Import database connection from the database package
	return database.GetDB()
}

// ListAccountsHTTP handles listing user accounts
func ListAccountsHTTP(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	service := getLedgerService()
	if service == nil {
		response.InternalError(w, "Database not initialized")
		return
	}

	// Get accounts from ledger system for the authenticated user
	ledgerAccounts, err := service.GetAccounts(user.UserID)
	if err != nil {
		response.InternalError(w, fmt.Sprintf("Failed to get accounts: %v", err))
		return
	}

	// Convert ledger accounts to AccountData format
	accounts := make([]AccountData, len(ledgerAccounts))
	for i, ledgerAccount := range ledgerAccounts {
		balance, err := service.GetAccountBalance(ledgerAccount.ID)
		if err != nil {
			balance = 0 // Default to 0 if balance calculation fails
		}

		accounts[i] = AccountData{
			ID:            ledgerAccount.ID.String(),
			AccountNumber: ledgerAccount.AccountNumber,
			Type:          string(ledgerAccount.Type),
			Status:        string(ledgerAccount.Status),
			Balance:       balance,
			Currency:      ledgerAccount.Currency,
			Name:          ledgerAccount.Name,
			Description:   ledgerAccount.Description,
			CreatedAt:     ledgerAccount.CreatedAt,
		}
	}

	response.Success(w, "Accounts retrieved successfully", accounts)
}

// CreateAccountHTTP handles creating a new account
func CreateAccountHTTP(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	var req CreateAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.ValidationError(w, "Invalid request body: "+err.Error())
		return
	}

	service := getLedgerService()
	if service == nil {
		response.InternalError(w, "Database not initialized")
		return
	}

	// Validate the request
	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		response.ValidationError(w, fmt.Sprintf("Validation failed: %v", err))
		return
	}

	// Set default currency if not provided
	currency := req.Currency
	if currency == "" {
		currency = "USD"
	}

	// Generate unique account number
	accountNumber := generateAccountNumber()

	// Convert account type to ledger account type
	ledgerAccountType := convertToLedgerAccountType(req.Type)

	// Create account for the authenticated user
	ledgerAccount, err := service.CreateAccount(
		user.UserID, // Use authenticated user's ID
		accountNumber,
		req.Name,
		req.Description,
		currency,
		ledgerAccountType,
		nil, // No parent account for now
	)
	if err != nil {
		response.InternalError(w, fmt.Sprintf("Failed to create account: %v", err))
		return
	}

	// If initial balance is provided, create a deposit transaction
	if req.InitialBalance > 0 {
		_, err := service.CreateDeposit(
			user.UserID,
			ledgerAccount.ID,
			req.InitialBalance,
			currency,
			"Initial deposit",
			"INIT-"+accountNumber,
		)
		if err != nil {
			// Log the error but don't fail the account creation
			fmt.Printf("Warning: Failed to create initial deposit: %v\n", err)
		}
	}

	// Convert to AccountData format
	newAccount := AccountData{
		ID:            ledgerAccount.ID.String(),
		AccountNumber: ledgerAccount.AccountNumber,
		Type:          string(ledgerAccount.Type),
		Status:        string(ledgerAccount.Status),
		Balance:       req.InitialBalance,
		Currency:      ledgerAccount.Currency,
		Name:          ledgerAccount.Name,
		Description:   ledgerAccount.Description,
		CreatedAt:     ledgerAccount.CreatedAt,
	}

	response.Success(w, "Account created successfully", newAccount)
}

// GetAccountHTTP handles retrieving a specific account
func GetAccountHTTP(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, "Authentication required")
		return
	}

	// Get account ID from path
	accountID := r.URL.Path[len("/api/v1/accounts/"):]
	if accountID == "" {
		response.ValidationError(w, "Account ID is required")
		return
	}

	service := getLedgerService()
	if service == nil {
		response.InternalError(w, "Database not initialized")
		return
	}

	// Get account from ledger system
	ledgerAccount, err := service.GetAccount(accountID)
	if err != nil {
		response.NotFound(w, "Account not found")
		return
	}

	// Check if the account belongs to the authenticated user
	if ledgerAccount.UserID != user.UserID {
		response.Error(w, http.StatusForbidden, "Access denied")
		return
	}

	// Get account balance
	balance, err := service.GetAccountBalance(ledgerAccount.ID)
	if err != nil {
		balance = 0 // Default to 0 if balance calculation fails
	}

	// Convert to AccountData format
	account := AccountData{
		ID:            ledgerAccount.ID.String(),
		AccountNumber: ledgerAccount.AccountNumber,
		Type:          string(ledgerAccount.Type),
		Status:        string(ledgerAccount.Status),
		Balance:       balance,
		Currency:      ledgerAccount.Currency,
		Name:          ledgerAccount.Name,
		Description:   ledgerAccount.Description,
		CreatedAt:     ledgerAccount.CreatedAt,
	}

	response.Success(w, "Account retrieved successfully", account)
}

// generateAccountNumber generates a random 10-digit account number
func generateAccountNumber() string {
	// Generate a 10-digit number
	accountNum := rand.Intn(9000000000) + 1000000000 // Range: 1000000000-9999999999
	return fmt.Sprintf("%d", accountNum)
}

// convertToLedgerAccountType converts string account type to ledger account type
func convertToLedgerAccountType(accountType string) models.LedgerAccountType {
	switch accountType {
	case "checking":
		return models.LedgerAccountTypeBank
	case "savings":
		return models.LedgerAccountTypeBank
	case "investment":
		return models.LedgerAccountTypeInvestment
	case "credit":
		return models.LedgerAccountTypeCredit
	default:
		return models.LedgerAccountTypeBank
	}
}
