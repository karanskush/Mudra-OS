package api

import (
	"log"
	"net/http"
	"strings"

	"fintech-api/internal/config"
	"fintech-api/internal/database"
	"fintech-api/internal/middleware"
	"fintech-api/pkg/logger"
)

var (
	initialized bool
	cfg         *config.Config
)

// initApp initializes the application if not already done
func initApp() error {
	if initialized {
		return nil
	}

	var err error

	// Load configuration
	cfg, err = config.Load()
	if err != nil {
		return err
	}

	// Initialize logger
	logger.Init(cfg.Logging.Level, cfg.Logging.Format)

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		return err
	}

	// Setup database if needed
	if err := database.SetupNeonDatabase(); err != nil {
		return err
	}

	// Run ledger migrations
	if err := database.MigrateLedgerTables(database.GetDB()); err != nil {
		return err
	}

	initialized = true
	log.Printf("Application initialized successfully")
	return nil
}

// Handler is the main entry point for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	// Initialize app if needed (for serverless cold starts)
	if !initialized {
		if err := initApp(); err != nil {
			log.Printf("Failed to initialize app: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
	}

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
	case strings.HasPrefix(path, "api/ledger"):
		log.Printf("Routing to LedgerHandler (authenticated)")
		middleware.CORSMiddlewareWithAuth(LedgerHandler)(w, r)

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
	if len(pathParts) < 4 {
		http.NotFound(w, r)
		return
	}

	switch {
	case len(pathParts) == 4 && pathParts[3] == "":
		if r.Method == http.MethodGet {
			ListAccounts(w, r)
		} else if r.Method == http.MethodPost {
			CreateAccount(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	case len(pathParts) == 5 && pathParts[3] != "":
		if r.Method == http.MethodGet {
			GetAccount(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	default:
		http.NotFound(w, r)
	}
}

// handleTransactionRoutes routes transaction requests
func handleTransactionRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	// TODO: Implement transaction handlers
	http.Error(w, "Transactions endpoint - to be implemented", http.StatusNotImplemented)
}

// handlePaymentRoutes routes payment requests
func handlePaymentRoutes(w http.ResponseWriter, r *http.Request, pathParts []string) {
	// TODO: Implement payment handlers
	http.Error(w, "Payments endpoint - to be implemented", http.StatusNotImplemented)
}
