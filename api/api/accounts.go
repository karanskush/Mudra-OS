package api

import (
	"fmt"
	"math/rand"
	"time"

	"fintech-api/pkg/database"
	"fintech-api/pkg/middleware"
	"fintech-api/pkg/models"
	"fintech-api/pkg/response"

	"github.com/gin-gonic/gin"
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

// ListAccounts handles listing user accounts
func ListAccounts(c *gin.Context) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(c)
	if err != nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	service := getLedgerService()
	if service == nil {
		response.InternalServerError(c, "Database not initialized")
		return
	}

	// Get accounts from ledger system for the authenticated user
	ledgerAccounts, err := service.GetAccounts(user.UserID)
	if err != nil {
		response.InternalServerError(c, fmt.Sprintf("Failed to get accounts: %v", err))
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

	response.Success(c, accounts, "Accounts retrieved successfully")
}

// CreateAccount handles creating a new account
func CreateAccount(c *gin.Context) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(c)
	if err != nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	var req CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request body: "+err.Error())
		return
	}

	service := getLedgerService()
	if service == nil {
		response.InternalServerError(c, "Database not initialized")
		return
	}

	// Validate the request
	validate := validator.New()
	if err := validate.Struct(req); err != nil {
		response.BadRequest(c, fmt.Sprintf("Validation failed: %v", err))
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
		response.InternalServerError(c, fmt.Sprintf("Failed to create account: %v", err))
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

	response.Created(c, newAccount, "Account created successfully")
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
		return models.LedgerAccountTypeLiability
	default:
		return models.LedgerAccountTypeBank
	}
}

// GetAccount handles getting a specific account
func GetAccount(c *gin.Context) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(c)
	if err != nil {
		response.Unauthorized(c, "Authentication required")
		return
	}

	service := getLedgerService()
	if service == nil {
		response.InternalServerError(c, "Database not initialized")
		return
	}

	// Get accounts from ledger system for the authenticated user
	ledgerAccounts, err := service.GetAccounts(user.UserID)
	if err != nil {
		response.InternalServerError(c, fmt.Sprintf("Failed to get accounts: %v", err))
		return
	}

	if len(ledgerAccounts) == 0 {
		response.NotFound(c, "No accounts found")
		return
	}

	// Use the first account as an example
	// In a real application, you would use c.Param("id") to get the specific account
	ledgerAccount := ledgerAccounts[0]
	balance, err := service.GetAccountBalance(ledgerAccount.ID)
	if err != nil {
		balance = 0
	}

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

	response.Success(c, account, "Account retrieved successfully")
}

// SetupAccountRoutes sets up the routes for the accounts API
func SetupAccountRoutes(router *gin.RouterGroup) {
	// Add routes for accounts API
	router.GET("/accounts", ListAccounts)
	router.POST("/accounts", CreateAccount)
	router.GET("/accounts/:id", GetAccount)
}
