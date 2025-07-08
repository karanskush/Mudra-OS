package main

import (
	"log"
	"net/http"

	"fintech-backend/api"
	"fintech-backend/internal/config"
	"fintech-backend/internal/database"
	"fintech-backend/internal/middleware"
	"fintech-backend/pkg/logger"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	logger.Init(cfg.Logging.Level, cfg.Logging.Format)

	// Connect to Neon database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Setup Neon database (extensions and migrations)
	if err := database.SetupNeonDatabase(); err != nil {
		log.Fatalf("Failed to setup Neon database: %v", err)
	}

	// Run ledger migrations
	if err := database.MigrateLedgerTables(database.GetDB()); err != nil {
		log.Fatalf("Failed to migrate ledger tables: %v", err)
	}

	// Log connection info
	connInfo := database.GetNeonConnectionInfo()
	log.Printf("Neon database connection info: %+v", connInfo)

	mux := http.NewServeMux()

	// Health check
	mux.Handle("/health", http.HandlerFunc(api.Health))
	mux.Handle("/api/health", http.HandlerFunc(api.Health))

	// Auth routes
	mux.Handle("/api/v1/auth/register", http.HandlerFunc(api.Register))
	mux.Handle("/api/v1/auth/login", http.HandlerFunc(api.Login))
	mux.Handle("/api/v1/auth/logout", http.HandlerFunc(api.Logout))

	// User routes
	mux.Handle("/api/v1/users/profile", middleware.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			api.GetProfile(w, r)
		} else if r.Method == http.MethodPut {
			api.UpdateProfile(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	// Account routes
	mux.Handle("/api/v1/accounts", middleware.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			api.ListAccounts(w, r)
		} else if r.Method == http.MethodPost {
			api.CreateAccount(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))
	mux.Handle("/api/v1/accounts/", middleware.AuthMiddleware(http.HandlerFunc(api.GetAccount)))

	// Ledger routes
	mux.Handle("/api/ledger", middleware.AuthMiddleware(http.HandlerFunc(api.LedgerHandler)))

	// KYC routes
	mux.Handle("/api/kyc", middleware.AuthMiddleware(http.HandlerFunc(api.KYCHandler)))

	// Catch-all for undefined routes
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Route not found: %s", r.URL.Path)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"error": "API endpoint not found", "status": 404}`))
	})

	log.Printf("Server running at http://[::]:8080\n")
	if err := http.ListenAndServe(":"+cfg.Server.Port, middleware.CORSMiddleware(mux)); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
