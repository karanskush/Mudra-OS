package handler

import (
	"log"
	"net/http"
	"os"
	"strings"

	"fintech-api/pkg/config"
	"fintech-api/pkg/database"
	"fintech-api/pkg/middleware"
)

var (
	initialized bool
	cfg         *config.Config
)

func init() {
	// Redirect standard log to stdout for Vercel
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.Lshortfile)
}

// initApp initializes the application if not already done
func initApp() error {
	if initialized {
		return nil
	}

	var err error

	// Load configuration
	log.Println("Initializing application...")
	cfg, err = config.Load()
	if err != nil {
		log.Printf("Failed to load configuration: %v", err)
		return err
	}
	log.Println("Configuration loaded.")

	// Connect to database (only essential connection, no setup/migrations)
	log.Println("Connecting to database...")
	if err := database.Connect(cfg); err != nil {
		log.Printf("Failed to connect to database: %v", err)
		return err
	}
	log.Println("Database connection successful.")

	initialized = true
	log.Println("Application initialized successfully")
	return nil
}

// Handler is the main entry point for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	log.Printf("Handler invoked for path: %s", r.URL.Path)
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
	log.Printf("Request: %s %s", r.Method, r.URL.Path)

	// Route based on path
	switch {
	case path == "health" || path == "api/health":
		log.Println("Routing to Health")
		middleware.CORSMiddleware(Health)(w, r)

	// Auth routes (no authentication required)
	case strings.HasPrefix(path, "api/v1/auth"):
		log.Println("Routing to Auth")
		middleware.CORSMiddleware(func(w http.ResponseWriter, r *http.Request) {
			handleAuthRoutes(w, r, pathParts)
		})(w, r)

	// User routes (authentication required)
	case strings.HasPrefix(path, "api/v1/users"):
		log.Println("Routing to Users")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handleUserRoutes(w, r, pathParts)
		})(w, r)

	// Account routes (authentication required)
	case strings.HasPrefix(path, "api/v1/accounts"):
		log.Println("Routing to Accounts")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handleAccountRoutes(w, r, pathParts)
		})(w, r)

	// Transaction routes (authentication required)
	case strings.HasPrefix(path, "api/v1/transactions"):
		log.Println("Routing to Transactions")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handleTransactionRoutes(w, r, pathParts)
		})(w, r)

	// Payment routes (authentication required)
	case strings.HasPrefix(path, "api/v1/payments"):
		log.Println("Routing to Payments")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handlePaymentRoutes(w, r, pathParts)
		})(w, r)

	// Ledger routes (authentication required)
	case strings.HasPrefix(path, "api/ledger"):
		log.Println("Routing to Ledger")
		middleware.CORSMiddlewareWithAuth(LedgerHandler)(w, r)

	// KYC routes (authentication required)
	case strings.HasPrefix(path, "api/kyc"):
		log.Println("Routing to KYC")
		middleware.CORSMiddlewareWithAuth(KYCHandler)(w, r)

	// gRPC bridge routes (authentication required)
	case strings.HasPrefix(path, "v1/kyc"):
		log.Println("Routing to gRPC KYC")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handleGRPCKYCRoutes(w, r, pathParts)
		})(w, r)

	case strings.HasPrefix(path, "v1/payments"):
		log.Println("Routing to gRPC Payments")
		middleware.CORSMiddlewareWithAuth(func(w http.ResponseWriter, r *http.Request) {
			handleGRPCPaymentRoutes(w, r, pathParts)
		})(w, r)

	case path == "health" || path == "v1/health" || strings.HasPrefix(path, "v1/health"):
		log.Println("Routing to Health")
		middleware.CORSMiddleware(Health)(w, r)

	default:
		log.Printf("404 Not Found: %s", r.URL.Path)
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
			ListAccountsHTTP(w, r)
		} else if r.Method == http.MethodPost {
			CreateAccountHTTP(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	case len(pathParts) == 5 && pathParts[3] != "":
		if r.Method == http.MethodGet {
			GetAccountHTTP(w, r)
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
