package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
	Path  string `json:"path,omitempty"`
}

// Handler is the main entry point for Vercel serverless functions
func Handler(w http.ResponseWriter, r *http.Request) {
	// Load environment variables
	godotenv.Load()

	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Route the request based on the path
	path := r.URL.Path

	switch {
	case path == "/api/health":
		handleHealth(w, r)
	case path == "/api/auth/login":
		handleLogin(w, r)
	case path == "/api/kyc/submit":
		handleKYCSubmit(w, r)
	case path == "/api/ledger/transactions":
		handleTransaction(w, r)
	case path == "/api/users":
		handleUsers(w, r)
	case strings.HasPrefix(path, "/api/"):
		// API endpoint not found
		errorResponse := ErrorResponse{
			Error: "API endpoint not found",
			Path:  path,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(errorResponse)
	default:
		// Route not found
		errorResponse := ErrorResponse{
			Error: "Route not found",
			Path:  path,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(errorResponse)
	}
}

// handleHealth handles the health check endpoint
func handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	response := map[string]interface{}{
		"status":    "ok",
		"message":   "Fintech API is running",
		"timestamp": time.Now().Unix(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// handleLogin handles the login endpoint
func handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read and parse request body
	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		http.Error(w, "Invalid request data", http.StatusBadRequest)
		return
	}

	// Simple mock authentication
	if loginData.Email == "admin@example.com" && loginData.Password == "password" {
		response := map[string]interface{}{
			"message": "Login successful",
			"token":   "mock-jwt-token",
			"user": map[string]interface{}{
				"id":    "1",
				"email": loginData.Email,
				"name":  "Admin User",
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	} else {
		errorResponse := map[string]string{"error": "Invalid credentials"}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(errorResponse)
	}
}

// handleKYCSubmit handles the KYC submission endpoint
func handleKYCSubmit(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read and parse request body
	var kycData struct {
		Name    string `json:"name"`
		Email   string `json:"email"`
		Phone   string `json:"phone"`
		Country string `json:"country"`
	}

	if err := json.NewDecoder(r.Body).Decode(&kycData); err != nil {
		http.Error(w, "Invalid KYC data", http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"message": "KYC submitted successfully",
		"kyc_id":  "kyc-" + fmt.Sprintf("%d", time.Now().Unix()),
		"status":  "pending",
		"data":    kycData,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// handleTransaction handles the transaction creation endpoint
func handleTransaction(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read and parse request body
	var txData struct {
		FromAccount string  `json:"from_account"`
		ToAccount   string  `json:"to_account"`
		Amount      float64 `json:"amount"`
		Currency    string  `json:"currency"`
		Description string  `json:"description"`
	}

	if err := json.NewDecoder(r.Body).Decode(&txData); err != nil {
		http.Error(w, "Invalid transaction data", http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"message": "Transaction created successfully",
		"tx_id":   "tx-" + fmt.Sprintf("%d", time.Now().Unix()),
		"status":  "completed",
		"data":    txData,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// handleUsers handles the users listing endpoint
func handleUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	users := []map[string]string{
		{"id": "1", "name": "John Doe", "email": "john@example.com"},
		{"id": "2", "name": "Jane Smith", "email": "jane@example.com"},
		{"id": "3", "name": "Bob Johnson", "email": "bob@example.com"},
	}

	response := map[string]interface{}{"users": users}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// main function for local development
func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s\n", port)

	// Create a simple HTTP server for local development
	http.HandleFunc("/", Handler)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
		os.Exit(1)
	}
}
