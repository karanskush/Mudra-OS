package handler

import (
	"encoding/json"
	"net/http"
)

// Handler is the main entry point for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Parse the path
	path := r.URL.Path

	// Route based on path
	switch {
	case path == "/api/health" || path == "/health":
		handleHealth(w, r)
	case path == "/api/v1/auth/login":
		handleLogin(w, r)
	case path == "/api/v1/auth/register":
		handleRegister(w, r)
	default:
		handleNotFound(w, r)
	}
}

/*
// main function for local development
func main() {
	http.HandleFunc("/", Handler)
	http.ListenAndServe(":8080", nil)
}
*/

func handleHealth(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":  "healthy",
		"message": "API is running",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"message": "Login endpoint - to be implemented",
		"status":  "not_implemented",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	json.NewEncoder(w).Encode(response)
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"message": "Register endpoint - to be implemented",
		"status":  "not_implemented",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	json.NewEncoder(w).Encode(response)
}

func handleNotFound(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"error":   "Not found",
		"message": "The requested endpoint does not exist",
		"path":    r.URL.Path,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(response)
}
