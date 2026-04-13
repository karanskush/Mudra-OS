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

	"fintech-backend/internal/database"
	"fintech-backend/internal/handlers"
	"fintech-backend/internal/middleware"
	"fintech-backend/internal/models"
	"fintech-backend/internal/services"

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

// jsonError writes a JSON-encoded error response so the frontend can parse it.
func jsonError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": msg})
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

	// Parse the path — normalize api/v1/ledger/... to api/ledger/... for internal routing
	rawPath := strings.TrimPrefix(r.URL.Path, "/")
	path := strings.Replace(rawPath, "api/v1/ledger", "api/ledger", 1)
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
	case strings.HasPrefix(path, "api/ledger/journal-entries"):
		handleJournalEntryRoutes(w, r, pathParts)
	case strings.HasPrefix(path, "api/ledger/trial-balance"):
		handleTrialBalance(w, r)
	case strings.HasPrefix(path, "api/ledger/chart-of-accounts"):
		handleChartOfAccounts(w, r)
	case strings.HasPrefix(path, "api/ledger/reports"):
		handleReportRoutes(w, r, pathParts)
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
			jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	case len(pathParts) == 4 && pathParts[3] == "available":
		if r.Method == http.MethodGet {
			getAvailableAccounts(w, r)
		} else {
			jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	case len(pathParts) >= 4 && pathParts[2] == "accounts":
		accountID := pathParts[3]
		if len(pathParts) >= 5 {
			switch pathParts[4] {
			case "balance":
				if r.Method == http.MethodGet {
					getLedgerAccountBalance(w, r, accountID)
				} else {
					jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
				}
			case "transactions":
				if r.Method == http.MethodGet {
					getLedgerAccountTransactions(w, r, accountID)
				} else {
					jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
				}
			case "statement":
				if r.Method == http.MethodGet {
					getLedgerAccountStatement(w, r, accountID)
				} else {
					jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
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
				jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		case "deposit":
			if r.Method == http.MethodPost {
				createLedgerDeposit(w, r)
			} else {
				jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		case "test-balance":
			if r.Method == http.MethodPost {
				createTestBalance(w, r)
			} else {
				jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		case "all":
			if r.Method == http.MethodGet {
				listAllTransactions(w, r)
			} else {
				jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
			}
		default:
			// Handle transaction ID-based routes: /transactions/{id}/post or /transactions/{id}/reverse
			if len(pathParts) >= 5 {
				transactionID := pathParts[3]
				switch pathParts[4] {
				case "post":
					if r.Method == http.MethodPost {
						postLedgerTransaction(w, r, transactionID)
					} else {
						jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
					}
				case "reverse":
					if r.Method == http.MethodPost {
						reverseLedgerTransaction(w, r, transactionID)
					} else {
						jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
					}
				default:
					http.NotFound(w, r)
				}
			} else {
				http.NotFound(w, r)
			}
		}
	default:
		http.NotFound(w, r)
	}
}

// handleJournalEntryRoutes handles journal entry requests
func handleJournalEntryRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	if r.Method == http.MethodPost {
		createJournalEntry(w, r)
	} else {
		jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// handleReportRoutes handles financial report requests
func handleReportRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	if len(pathParts) < 4 {
		jsonError(w, "Report type required", http.StatusBadRequest)
		return
	}
	if r.Method != http.MethodGet {
		jsonError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	switch pathParts[3] {
	case "balance-sheet":
		handleBalanceSheet(w, r)
	case "income-statement":
		handleIncomeStatement(w, r)
	case "cash-flow":
		handleCashFlow(w, r)
	default:
		http.NotFound(w, r)
	}
}

// ─── Account handlers ───────────────────────────────────────────────────────

// createLedgerAccount creates a new ledger account
func createLedgerAccount(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	var req handlers.CreateAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	accountNumber := generateAccountNumber()
	account, err := service.CreateAccount(user.UserID, accountNumber, req.Name, req.Description, req.Currency, req.Type, req.ParentID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": account})
}

// listLedgerAccounts lists all ledger accounts
func listLedgerAccounts(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	accounts, err := service.GetUserAccounts(user.UserID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": accounts, "count": len(accounts)})
}

// ─── Transaction handlers ────────────────────────────────────────────────────

// createLedgerTransfer creates a transfer transaction
func createLedgerTransfer(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	var req handlers.CreateTransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	transaction, err := service.CreateTransfer(user.UserID, req.FromAccountID, req.ToAccountID, req.Amount, req.Currency, req.Description, req.Reference)
	if err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": transaction})
}

// createLedgerDeposit creates a deposit transaction
func createLedgerDeposit(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	var req handlers.CreateDepositRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	transaction, err := service.CreateDeposit(user.UserID, req.AccountID, req.Amount, req.Currency, req.Description, req.Reference)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := service.PostTransaction(transaction.ID); err != nil {
		jsonError(w, fmt.Sprintf("Transaction created but failed to post: %v", err), http.StatusInternalServerError)
		return
	}

	transaction.Status = models.LedgerTransactionStatusPosted
	now := time.Now()
	transaction.PostedAt = &now

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": transaction})
}

// createTestBalance creates a test balance transaction without validation
func createTestBalance(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	var req handlers.CreateDepositRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	transaction, err := service.CreateTestBalance(user.UserID, req.AccountID, req.Amount, req.Currency, req.Description, req.Reference)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := service.PostTransaction(transaction.ID); err != nil {
		jsonError(w, fmt.Sprintf("Transaction created but failed to post: %v", err), http.StatusInternalServerError)
		return
	}

	transaction.Status = models.LedgerTransactionStatusPosted
	now := time.Now()
	transaction.PostedAt = &now

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": transaction})
}

// postLedgerTransaction posts a transaction to the ledger
func postLedgerTransaction(w http.ResponseWriter, r *http.Request, transactionIDStr string) {
	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	transactionID, err := uuid.Parse(transactionIDStr)
	if err != nil {
		jsonError(w, "Invalid transaction ID", http.StatusBadRequest)
		return
	}

	if err := service.PostTransaction(transactionID); err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "message": "Transaction posted successfully"})
}

// reverseLedgerTransaction creates a reversal for a posted transaction
func reverseLedgerTransaction(w http.ResponseWriter, r *http.Request, transactionIDStr string) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	transactionID, err := uuid.Parse(transactionIDStr)
	if err != nil {
		jsonError(w, "Invalid transaction ID", http.StatusBadRequest)
		return
	}

	var body struct {
		Reason string `json:"reason"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	reversal, err := service.ReverseTransaction(user.UserID, transactionID, body.Reason)
	if err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": reversal})
}

// listAllTransactions returns paginated user transactions with optional filters
func listAllTransactions(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	txnType := r.URL.Query().Get("type")
	status := r.URL.Query().Get("status")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))

	txns, total, err := service.GetAllUserTransactions(user.UserID, txnType, status, limit, offset)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": txns, "total": total})
}

// ─── Balance / Account query handlers ───────────────────────────────────────

// getLedgerAccountBalance returns the balance of an account
func getLedgerAccountBalance(w http.ResponseWriter, r *http.Request, accountIDStr string) {
	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		jsonError(w, "Invalid account ID", http.StatusBadRequest)
		return
	}

	balance, err := service.GetAccountBalance(accountID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": map[string]float64{"balance": balance}})
}

// getLedgerAccountTransactions returns transactions for an account
func getLedgerAccountTransactions(w http.ResponseWriter, r *http.Request, accountIDStr string) {
	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		jsonError(w, "Invalid account ID", http.StatusBadRequest)
		return
	}

	limit := 50
	offset := 0
	if l, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil {
		limit = l
	}
	if o, err := strconv.Atoi(r.URL.Query().Get("offset")); err == nil {
		offset = o
	}

	transactions, err := service.GetAccountTransactions(accountID, limit, offset)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": transactions, "count": len(transactions)})
}

// getLedgerAccountStatement returns a date-range statement for an account
func getLedgerAccountStatement(w http.ResponseWriter, r *http.Request, accountIDStr string) {
	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	accountID, err := uuid.Parse(accountIDStr)
	if err != nil {
		jsonError(w, "Invalid account ID", http.StatusBadRequest)
		return
	}

	from, to := parseDateRange(r)
	stmts, closingBalance, err := service.GetAccountStatement(accountID, from, to)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":         true,
		"data":            stmts,
		"from":            from,
		"to":              to,
		"closing_balance": closingBalance,
	})
}

// handleTrialBalance returns a trial balance for all user accounts (excluding system accounts)
func handleTrialBalance(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	accounts, err := service.GetUserAccounts(user.UserID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	balances, err := service.GetAccountBalancesBatch(accounts)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	type trialEntry struct {
		ID            string  `json:"id"`
		AccountNumber string  `json:"account_number"`
		Name          string  `json:"name"`
		Type          string  `json:"type"`
		Currency      string  `json:"currency"`
		Balance       float64 `json:"balance"`
	}

	var entries []trialEntry
	var totalDebits, totalCredits float64
	for _, acc := range accounts {
		bal := balances[acc.ID]
		entries = append(entries, trialEntry{
			ID:            acc.ID.String(),
			AccountNumber: acc.AccountNumber,
			Name:          acc.Name,
			Type:          string(acc.Type),
			Currency:      acc.Currency,
			Balance:       bal,
		})
		if acc.IsDebitAccount() {
			totalDebits += bal
		} else {
			totalCredits += bal
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"data":          entries,
		"total_debits":  totalDebits,
		"total_credits": totalCredits,
		"is_balanced":   abs(totalDebits-totalCredits) < 0.01,
		"as_of":         time.Now(),
	})
}

// getAvailableAccounts returns available accounts for transfers
func getAvailableAccounts(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	accounts, err := service.GetUserAccounts(user.UserID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var activeAccounts []models.LedgerAccount
	for _, account := range accounts {
		if account.IsActive() {
			activeAccounts = append(activeAccounts, account)
		}
	}

	balances, err := service.GetAccountBalancesBatch(activeAccounts)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

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
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    responseAccounts,
		"count":   len(responseAccounts),
	})

	fmt.Printf("getAvailableAccounts: processed %d accounts in %v\n", len(responseAccounts), time.Since(start))
}

// ─── Journal Entry handler ───────────────────────────────────────────────────

// createJournalEntry creates a balanced journal entry
func createJournalEntry(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	var req struct {
		Description string                  `json:"description"`
		Reference   string                  `json:"reference"`
		Currency    string                  `json:"currency"`
		Lines       []services.JournalLine  `json:"lines"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	txn, err := service.CreateJournalEntry(user.UserID, req.Description, req.Reference, req.Currency, req.Lines)
	if err != nil {
		jsonError(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": txn})
}

// ─── Report handlers ─────────────────────────────────────────────────────────

// handleChartOfAccounts returns the chart of accounts with balances
func handleChartOfAccounts(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	coa, err := service.GetChartOfAccounts(user.UserID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": coa})
}

// handleBalanceSheet returns a balance sheet report
func handleBalanceSheet(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	report, err := service.GetBalanceSheet(user.UserID)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": report})
}

// handleIncomeStatement returns an income statement report
func handleIncomeStatement(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	from, to := parseDateRange(r)
	report, err := service.GetIncomeStatement(user.UserID, from, to)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": report})
}

// handleCashFlow returns a cash flow report
func handleCashFlow(w http.ResponseWriter, r *http.Request) {
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		jsonError(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	service := getLedgerService()
	if service == nil {
		jsonError(w, "Database not initialized", http.StatusServiceUnavailable)
		return
	}

	from, to := parseDateRange(r)
	entries, netCash, err := service.GetCashFlow(user.UserID, from, to)
	if err != nil {
		jsonError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"data":      entries,
		"net_cash":  netCash,
		"from":      from,
		"to":        to,
	})
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// parseDateRange extracts from/to query params, defaulting to current month.
func parseDateRange(r *http.Request) (time.Time, time.Time) {
	now := time.Now()
	from := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	to := now

	if f := r.URL.Query().Get("from"); f != "" {
		if t, err := time.Parse("2006-01-02", f); err == nil {
			from = t
		}
	}
	if t := r.URL.Query().Get("to"); t != "" {
		if parsed, err := time.Parse("2006-01-02", t); err == nil {
			to = parsed
		}
	}
	return from, to
}

func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}
