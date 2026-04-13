package api

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"fintech-backend/internal/middleware"
	"fintech-backend/internal/models"

	"github.com/google/uuid"
)

// parseUUID parses a UUID string, returning an error if invalid.
func parseUUID(s string) (uuid.UUID, error) {
	return uuid.Parse(s)
}

// Handler is the main entry point for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	// Parse the path
	path := strings.TrimPrefix(r.URL.Path, "/")
	pathParts := strings.Split(path, "/")

	// Debug logging
	log.Printf("Handler called with path: %s, method: %s, pathParts: %v", path, r.Method, pathParts)

	// Route based on path
	switch {
	case path == "health" || path == "api/health":
		log.Printf("Routing to Health")
		middleware.CORSMiddleware(Health)(w, r)

	// Auth routes (no authentication required)
	case strings.HasPrefix(path, "api/v1/auth"):
		log.Printf("Routing to handleAuthRoutes")
		middleware.CORSMiddleware(func(w http.ResponseWriter, r *http.Request) {
			handleAuthRoutes(w, r, pathParts)
		})(w, r)

	// Current user info (protected)
	case path == "api/v1/me":
		log.Printf("Routing to GetProfile (me)")
		middleware.CORSMiddlewareWithAuth(GetProfile)(w, r)

	// User routes (authentication required)
	case strings.HasPrefix(path, "api/v1/users"):
		log.Printf("Routing to handleUserRoutes (authenticated)")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handleUserRoutes(w, r, pathParts)
		})(w, r)

	// Account routes (authentication required)
	case strings.HasPrefix(path, "api/v1/accounts"):
		log.Printf("Routing to handleAccountRoutes (authenticated)")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handleAccountRoutes(w, r, pathParts)
		})(w, r)

	// Transaction routes (authentication required)
	case strings.HasPrefix(path, "api/v1/transactions"):
		log.Printf("Routing to handleTransactionRoutes (authenticated)")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handleTransactionRoutes(w, r, pathParts)
		})(w, r)

	// Payment routes (authentication required)
	case strings.HasPrefix(path, "api/v1/payments"):
		log.Printf("Routing to handlePaymentRoutes (authenticated)")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handlePaymentRoutes(w, r, pathParts)
		})(w, r)

	// Ledger routes (authentication required)
	case strings.HasPrefix(path, "api/v1/ledger") || strings.HasPrefix(path, "api/ledger"):
		log.Printf("Routing to LedgerHandler (authenticated)")
		middleware.CORSMiddlewareWithAuth(LedgerHandler)(w, r)

	// KYC public routes (no auth needed)
	case path == "api/kyc" || path == "api/kyc/countries" ||
		strings.HasPrefix(path, "api/kyc/countries"):
		log.Printf("Routing to KYCHandler (public)")
		middleware.CORSMiddleware(KYCHandler)(w, r)

	// KYC routes (authentication required)
	case strings.HasPrefix(path, "api/kyc"):
		log.Printf("Routing to KYCHandler (authenticated)")
		middleware.CORSMiddlewareWithAuth(KYCHandler)(w, r)

	// gRPC bridge routes (authentication required)
	case strings.HasPrefix(path, "v1/kyc"):
		log.Printf("Routing to gRPC KYC bridge (authenticated)")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handleGRPCKYCRoutes(w, r, pathParts)
		})(w, r)

	case strings.HasPrefix(path, "v1/payments"):
		log.Printf("Routing to gRPC Payment bridge (authenticated)")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handleGRPCPaymentRoutes(w, r, pathParts)
		})(w, r)

	// Market data routes (public - FX rates, crypto prices, currency conversion)
	case path == "api/market/fx" || strings.HasPrefix(path, "api/market/fx"):
		log.Printf("Routing to HandleFXRates")
		middleware.CORSMiddleware(HandleFXRates)(w, r)

	case path == "api/market/convert" || strings.HasPrefix(path, "api/market/convert"):
		log.Printf("Routing to HandleCurrencyConvert")
		middleware.CORSMiddleware(HandleCurrencyConvert)(w, r)

	case path == "api/market/crypto" || strings.HasPrefix(path, "api/market/crypto"):
		log.Printf("Routing to HandleCryptoPrices")
		middleware.CORSMiddleware(HandleCryptoPrices)(w, r)

	case path == "health" || path == "v1/health" || strings.HasPrefix(path, "v1/health"):
		log.Printf("Routing to Health")
		middleware.CORSMiddleware(Health)(w, r)

	default:
		log.Printf("No matching route found, returning 404")
		middleware.CORSMiddleware(func(w http.ResponseWriter, r *http.Request) {
			http.NotFound(w, r)
		})(w, r)
	}
}

// handleAuthRoutes routes authentication requests
func handleAuthRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	if len(pathParts) < 4 {
		http.NotFound(w, r)
		return
	}

	switch pathParts[3] {
	case "register":
		Register(w, r)
	case "login":
		Login(w, r)
	case "logout":
		Logout(w, r)
	default:
		http.NotFound(w, r)
	}
}

// handleUserRoutes routes user management requests
func handleUserRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	if len(pathParts) < 4 {
		http.NotFound(w, r)
		return
	}

	switch pathParts[3] {
	case "profile":
		if r.Method == http.MethodGet {
			GetProfile(w, r)
		} else if r.Method == http.MethodPut {
			UpdateProfile(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	default:
		http.NotFound(w, r)
	}
}

// handleAccountRoutes routes account management requests
func handleAccountRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	if len(pathParts) < 3 {
		http.NotFound(w, r)
		return
	}

	// pathParts for /api/v1/accounts       → ["api","v1","accounts",""]  len=4
	// pathParts for /api/v1/accounts/{id}  → ["api","v1","accounts","<id>"] len=4
	switch {
	case len(pathParts) == 4 && pathParts[3] == "":
		if r.Method == http.MethodGet {
			ListAccounts(w, r)
		} else if r.Method == http.MethodPost {
			CreateAccount(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	case len(pathParts) == 4 && pathParts[3] != "":
		if r.Method == http.MethodGet {
			// Inject account ID into context so GetAccount can read it
			ctx := context.WithValue(r.Context(), contextKeyAccountID, pathParts[3])
			GetAccount(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	default:
		http.NotFound(w, r)
	}
}

// contextKey is an unexported type for context keys to avoid collisions.
type contextKey string

const contextKeyAccountID contextKey = "accountID"

// handleTransactionRoutes routes transaction requests.
// GET  /api/v1/transactions            → list all ledger transactions for the authenticated user
// GET  /api/v1/transactions/{id}       → get a specific transaction
func handleTransactionRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	service := getLedgerService()
	if service == nil {
		http.Error(w, `{"error":"database not available"}`, http.StatusServiceUnavailable)
		return
	}

	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		http.Error(w, `{"error":"authentication required"}`, http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	// GET /api/v1/transactions
	if r.Method == http.MethodGet && (len(pathParts) < 4 || pathParts[3] == "") {
		accounts, err := service.GetUserAccounts(user.UserID)
		if err != nil {
			http.Error(w, `{"error":"failed to get accounts"}`, http.StatusInternalServerError)
			return
		}

		// Collect transactions across all accounts (deduplicated by transaction ID)
		seen := map[string]bool{}
		var allTxns []interface{}
		for _, acc := range accounts {
			txns, err := service.GetAccountTransactions(acc.ID, 50, 0)
			if err != nil {
				continue
			}
			for _, t := range txns {
				id := t.ID.String()
				if !seen[id] {
					seen[id] = true
					allTxns = append(allTxns, t)
				}
			}
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    allTxns,
			"count":   len(allTxns),
		})
		return
	}

	http.NotFound(w, r)
}

// handlePaymentRoutes routes payment requests.
// POST /api/v1/payments  → create a payment (delegates to the ledger transfer + rail selection)
func handlePaymentRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	service := getLedgerService()
	if service == nil {
		http.Error(w, `{"error":"database not available"}`, http.StatusServiceUnavailable)
		return
	}

	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		http.Error(w, `{"error":"authentication required"}`, http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	// POST /api/v1/payments
	if r.Method == http.MethodPost && (len(pathParts) < 4 || pathParts[3] == "") {
		var req struct {
			FromAccountID string  `json:"from_account_id"`
			ToAccountID   string  `json:"to_account_id"`
			Amount        float64 `json:"amount"`
			Currency      string  `json:"currency"`
			Description   string  `json:"description"`
			Reference     string  `json:"reference"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
			return
		}
		if req.FromAccountID == "" || req.ToAccountID == "" || req.Amount <= 0 {
			http.Error(w, `{"error":"from_account_id, to_account_id, and amount are required"}`, http.StatusBadRequest)
			return
		}
		if req.Currency == "" {
			req.Currency = "USD"
		}
		// Auto-generate a reference if not provided to avoid unique constraint violation
		if req.Reference == "" {
			req.Reference = "TXN-" + uuid.New().String()
		}

		fromUUID, err := parseUUID(req.FromAccountID)
		if err != nil {
			http.Error(w, `{"error":"invalid from_account_id"}`, http.StatusBadRequest)
			return
		}
		toUUID, err := parseUUID(req.ToAccountID)
		if err != nil {
			http.Error(w, `{"error":"invalid to_account_id"}`, http.StatusBadRequest)
			return
		}

		result, err := service.CreateTransfer(user.UserID, fromUUID, toUUID, req.Amount, req.Currency, req.Description, req.Reference)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"error":   err.Error(),
			})
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    result,
		})
		return
	}

	// GET /api/v1/payments — list user's transfer transactions
	if r.Method == http.MethodGet && (len(pathParts) < 4 || pathParts[3] == "") {
		accounts, err := service.GetUserAccounts(user.UserID)
		if err != nil {
			http.Error(w, `{"error":"failed to get accounts"}`, http.StatusInternalServerError)
			return
		}

		seen := map[string]bool{}
		var payments []interface{}
		for _, acc := range accounts {
			txns, err := service.GetAccountTransactions(acc.ID, 50, 0)
			if err != nil {
				continue
			}
			for _, t := range txns {
				if t.Type == models.LedgerTransactionTypeTransfer {
					id := t.ID.String()
					if !seen[id] {
						seen[id] = true
						payments = append(payments, t)
					}
				}
			}
		}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    payments,
			"count":   len(payments),
		})
		return
	}

	http.NotFound(w, r)
}
