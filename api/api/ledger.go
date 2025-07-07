package api

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"fintech-api/internal/database"
	"fintech-api/internal/handlers"
	"fintech-api/internal/middleware"
	"fintech-api/internal/models"
	"fintech-api/internal/services"

	"github.com/google/uuid"
)

// Initialize ledger service and handler with lazy initialization
var (
	ledgerService *services.LedgerService
	ledgerHandler *handlers.LedgerHandler
	initOnce      sync.Once
)

// getLedgerService returns the ledger service, initializing it if necessary
func getLedgerService() *services.LedgerService {
	initOnce.Do(func() {
		db := database.GetDB()
		if db != nil {
			ledgerService = services.NewLedgerService(db)
			ledgerHandler = handlers.NewLedgerHandler(ledgerService)
		} else {
			log.Printf("Warning: Database not initialized, ledger service will be nil")
		}
	})
	return ledgerService
}

// getLedgerHandler returns the ledger handler, initializing it if necessary
func getLedgerHandler() *handlers.LedgerHandler {
	initOnce.Do(func() {
		db := database.GetDB()
		if db != nil {
			ledgerService = services.NewLedgerService(db)
			ledgerHandler = handlers.NewLedgerHandler(ledgerService)
		} else {
			log.Printf("Warning: Database not initialized, ledger handler will be nil")
		}
	})
	return ledgerHandler
}

// LedgerHandler is the main entry point for ledger API requests
func LedgerHandler(w http.ResponseWriter, r *http.Request) {
	// Add CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Parse the path
	path := strings.TrimPrefix(r.URL.Path, "/")
	pathParts := strings.Split(path, "/")

	// Debug logging
	log.Printf("LedgerHandler called with path: %s, method: %s, pathParts: %v", path, r.Method, pathParts)

	// Route based on path
	switch {
	case strings.HasPrefix(path, "api/ledger/accounts"):
		log.Printf("Routing to handleLedgerAccountRoutes")
		handleLedgerAccountRoutes(w, r, pathParts)
	case strings.HasPrefix(path, "api/ledger/transactions"):
		handleLedgerTransactionRoutes(w, r, pathParts)
	case strings.HasPrefix(path, "api/ledger/trial-balance"):
		handleTrialBalance(w, r)
	default:
		log.Printf("No matching route found, returning 404")
		http.NotFound(w, r)
	}
}

// handleLedgerAccountRoutes routes account management requests
func handleLedgerAccountRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	if len(pathParts) < 3 {
		http.NotFound(w, r)
		return
	}

	switch {
	case len(pathParts) == 3 && pathParts[2] == "accounts":
		if r.Method == http.MethodGet {
			listLedgerAccounts(w, r)
		} else if r.Method == http.MethodPost {
			createLedgerAccount(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	case len(pathParts) == 4 && pathParts[3] == "available":
		if r.Method == http.MethodGet {
			getAvailableAccounts(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	case len(pathParts) >= 4 && pathParts[2] == "accounts":
		accountID := pathParts[3]
		if len(pathParts) >= 5 {
			switch pathParts[4] {
			case "balance":
				if r.Method == http.MethodGet {
					getLedgerAccountBalance(w, r, accountID)
				} else {
					http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
				}
			case "transactions":
				if r.Method == http.MethodGet {
					getLedgerAccountTransactions(w, r, accountID)
				} else {
					http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
				}
			default:
				http.NotFound(w, r)
			}
		} else {
			http.NotFound(w, r)
		}
	default:
		http.NotFound(w, r)
	}
}

// handleLedgerTransactionRoutes routes transaction requests
func handleLedgerTransactionRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	if len(pathParts) < 3 {
		http.NotFound(w, r)
		return
	}

	switch {
	case len(pathParts) >= 4 && pathParts[2] == "transactions":
		switch pathParts[3] {
		case "transfer":
			if r.Method == http.MethodPost {
				createLedgerTransfer(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		case "deposit":
			if r.Method == http.MethodPost {
				createLedgerDeposit(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		case "test-balance":
			if r.Method == http.MethodPost {
				createTestBalance(w, r)
			} else {
				http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		default:
			// Handle transaction ID-based routes
			if len(pathParts) >= 5 && pathParts[4] == "post" {
				if r.Method == http.MethodPost {
					postLedgerTransaction(w, r, pathParts[3])
				} else {
					http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
				}
			} else {
				http.NotFound(w, r)
			}
		}
	default:
		http.NotFound(w, r)
	}
}

// createLedgerAccount creates a new ledger account
func createLedgerAccount(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		http.Error(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	var req handlers.CreateAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Generate account number automatically using the existing function
	accountNumber := generateAccountNumber()

	account, err := service.CreateAccount(
		user.UserID,   // Use authenticated user's ID
		accountNumber, // Use generated account number
		req.Name,
		req.Description,
		req.Currency,
		req.Type,
		req.ParentID,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(account)
}

// listLedgerAccounts lists all ledger accounts
func listLedgerAccounts(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		http.Error(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	accounts, err := service.GetUserAccounts(user.UserID) // Use GetUserAccounts to exclude system accounts
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(accounts)
}

// createLedgerTransfer creates a transfer transaction
func createLedgerTransfer(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		http.Error(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	var req handlers.CreateTransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	transaction, err := service.CreateTransfer(
		user.UserID, // Use authenticated user's ID
		req.FromAccountID,
		req.ToAccountID,
		req.Amount,
		req.Currency,
		req.Description,
		req.Reference,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(transaction)
}

// createLedgerDeposit creates a deposit transaction
func createLedgerDeposit(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		http.Error(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	var req handlers.CreateDepositRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	transaction, err := service.CreateDeposit(
		user.UserID, // Use authenticated user's ID
		req.AccountID,
		req.Amount,
		req.Currency,
		req.Description,
		req.Reference,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Automatically post the transaction so the balance is immediately updated
	if err := service.PostTransaction(transaction.ID); err != nil {
		http.Error(w, fmt.Sprintf("Transaction created but failed to post: %v", err), http.StatusInternalServerError)
		return
	}

	// Mark the transaction as posted in the response
	transaction.Status = models.LedgerTransactionStatusPosted
	now := time.Now()
	transaction.PostedAt = &now

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(transaction)
}

// createTestBalance creates a test balance transaction without validation
func createTestBalance(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		http.Error(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	var req handlers.CreateDepositRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	transaction, err := service.CreateTestBalance(
		user.UserID, // Use authenticated user's ID
		req.AccountID,
		req.Amount,
		req.Currency,
		req.Description,
		req.Reference,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Automatically post the transaction so the balance is immediately updated
	if err := service.PostTransaction(transaction.ID); err != nil {
		http.Error(w, fmt.Sprintf("Transaction created but failed to post: %v", err), http.StatusInternalServerError)
		return
	}

	// Mark the transaction as posted in the response
	transaction.Status = models.LedgerTransactionStatusPosted
	now := time.Now()
	transaction.PostedAt = &now

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(transaction)
}

// postLedgerTransaction posts a transaction to the ledger
func postLedgerTransaction(w http.ResponseWriter, r *http.Request, transactionIDStr string) {
	service := getLedgerService()
	if service == nil {
		http.Error(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	transactionID, err := uuid.Parse(transactionIDStr)
	if err != nil {
		http.Error(w, "Invalid transaction ID", http.StatusBadRequest)
		return
	}

	if err := service.PostTransaction(transactionID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Transaction posted successfully"})
}

// getLedgerAccountBalance returns the balance of an account
func getLedgerAccountBalance(w http.ResponseWriter, r *http.Request, accountIDStr string) {
	service := getLedgerService()
	if service == nil {
		http.Error(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		http.Error(w, "Invalid account ID", http.StatusBadRequest)
		return
	}

	balance, err := service.GetAccountBalance(accountID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]float64{"balance": balance})
}

// getLedgerAccountTransactions returns transactions for an account
func getLedgerAccountTransactions(w http.ResponseWriter, r *http.Request, accountIDStr string) {
	service := getLedgerService()
	if service == nil {
		http.Error(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		http.Error(w, "Invalid account ID", http.StatusBadRequest)
		return
	}

	// Get pagination parameters
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 50
	offset := 0

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	if offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil {
			offset = o
		}
	}

	transactions, err := service.GetAccountTransactions(accountID, limit, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transactions)
}

// handleTrialBalance returns a trial balance for all user accounts (excluding system accounts)
func handleTrialBalance(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		http.Error(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	// Get user accounts (excluding system accounts)
	accounts, err := service.GetUserAccounts(user.UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Get balances for user accounts only
	balances, err := service.GetAccountBalancesBatch(accounts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(balances)
}

// getAvailableAccounts returns available accounts for transfers
func getAvailableAccounts(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		http.Error(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	accounts, err := service.GetUserAccounts(user.UserID) // Use GetUserAccounts to exclude system accounts
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Filter only active accounts
	var activeAccounts []models.LedgerAccount
	for _, account := range accounts {
		if account.IsActive() {
			activeAccounts = append(activeAccounts, account)
		}
	}

	// Get all balances in a single optimized query
	balances, err := service.GetAccountBalancesBatch(activeAccounts)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Build response
	responseAccounts := make([]map[string]interface{}, 0)
	for _, account := range activeAccounts {
		balance := balances[account.ID]
		responseAccounts = append(responseAccounts, map[string]interface{}{
			"id":             account.ID.String(),
			"account_number": account.AccountNumber,
			"name":           account.Name,
			"type":           string(account.Type),
			"currency":       account.Currency,
			"balance":        balance,
			"description":    account.Description,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"accounts": responseAccounts,
		"count":    len(responseAccounts),
	})

	// Log performance metrics
	duration := time.Since(start)
	fmt.Printf("getAvailableAccounts: processed %d accounts in %v\n", len(responseAccounts), duration)
}
