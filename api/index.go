package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"fintech-api/pkg/config"
	"fintech-api/pkg/database"
	"fintech-api/pkg/logger"
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

	// Initialize logger first
	log.Println("Initializing logger...")
	logger.Init("info", "json")
	log.Println("Logger initialized.")

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
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		http.Error(w, "Failed to load configuration", http.StatusInternalServerError)
		return
	}

	// Set response headers
	w.Header().Set("Content-Type", "application/json")

	// Create response data
	response := map[string]interface{}{
		"status": "ok",
		"env":    cfg.Server.Env,
		"server": map[string]string{
			"host": cfg.Server.Host,
			"port": cfg.Server.Port,
		},
	}

	// Write response
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
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
