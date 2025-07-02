package api

import (
	"log"
	"net/http"
	"strings"
)

// Handler is the main entry point for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
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
	log.Printf("Handler called with path: %s, method: %s, pathParts: %v", path, r.Method, pathParts)

	// Route based on path
	switch {
	case path == "health" || path == "api/health":
		log.Printf("Routing to Health")
		Health(w, r)

	// Auth routes
	case strings.HasPrefix(path, "api/v1/auth"):
		log.Printf("Routing to handleAuthRoutes")
		handleAuthRoutes(w, r, pathParts)

	// User routes
	case strings.HasPrefix(path, "api/v1/users"):
		log.Printf("Routing to handleUserRoutes")
		handleUserRoutes(w, r, pathParts)

	// Account routes
	case strings.HasPrefix(path, "api/v1/accounts"):
		log.Printf("Routing to handleAccountRoutes")
		handleAccountRoutes(w, r, pathParts)

	// Transaction routes
	case strings.HasPrefix(path, "api/v1/transactions"):
		log.Printf("Routing to handleTransactionRoutes")
		handleTransactionRoutes(w, r, pathParts)

	// Payment routes
	case strings.HasPrefix(path, "api/v1/payments"):
		log.Printf("Routing to handlePaymentRoutes")
		handlePaymentRoutes(w, r, pathParts)

	// Ledger routes
	case strings.HasPrefix(path, "api/ledger"):
		log.Printf("Routing to LedgerHandler")
		LedgerHandler(w, r)

	// KYC routes
	case strings.HasPrefix(path, "api/kyc"):
		log.Printf("Routing to KYCHandler")
		KYCHandler(w, r)

	default:
		log.Printf("No matching route found, returning 404")
		http.NotFound(w, r)
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
