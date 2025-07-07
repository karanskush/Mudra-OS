package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	"api/pkg/config"
	"api/pkg/database"
	"api/pkg/logger"
)

// Response represents a standard API response
type Response struct {
	Status  string      `json:"status"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Version string      `json:"version,omitempty"`
}

// Initialize config and database connection once
var (
	cfg *config.Config
	err error
)

func init() {
	// Set default environment variables if not set
	if os.Getenv("DATABASE_URL") == "" && os.Getenv("VERCEL_ENV") == "production" {
		log.Fatal("DATABASE_URL environment variable is required in production")
	}

	// Load configuration
	cfg, err = config.Init()
	if err != nil {
		logger.Fatal("Failed to load configuration: %v", err)
	}

	// Initialize logging with appropriate level based on environment
	logger.SetFlags(log.LstdFlags | log.Lshortfile)
	if os.Getenv("VERCEL_ENV") == "production" {
		logger.SetOutput(os.Stderr) // Vercel captures stderr for logging
	} else {
		logger.SetOutput(os.Stdout)
	}

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		logger.Fatal("Failed to connect to database: %v", err)
	}

	logger.Info("Server initialized successfully in %s environment", os.Getenv("VERCEL_ENV"))
}

// Handler is the main entry point for all Vercel serverless functions
func Handler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	origin := r.Header.Get("Origin")
	if origin == "" {
		origin = "*"
	}
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Content-Type", "application/json")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Get the path from the request
	path := strings.TrimPrefix(r.URL.Path, "/")
	if path == "" {
		path = "/"
	}

	// Route the request based on the path
	var result Response
	switch {
	case path == "/" || path == "api":
		result = handleRoot(r)
	case strings.HasPrefix(path, "api/auth"):
		result = handleAuth(r)
	case strings.HasPrefix(path, "api/kyc"):
		result = handleKYC(r)
	case strings.HasPrefix(path, "api/accounts"):
		result = handleAccounts(r)
	default:
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(Response{
			Status: "error",
			Error:  "Not found",
		})
		return
	}

	// Write the response
	if result.Status == "error" {
		w.WriteHeader(http.StatusInternalServerError)
	}
	json.NewEncoder(w).Encode(result)
}

func handleRoot(r *http.Request) Response {
	return Response{
		Status:  "ok",
		Version: os.Getenv("VERCEL_GIT_COMMIT_SHA"),
		Data: map[string]string{
			"environment": os.Getenv("VERCEL_ENV"),
			"region":      os.Getenv("VERCEL_REGION"),
		},
	}
}

func handleAuth(r *http.Request) Response {
	return Response{
		Status: "error",
		Error:  "Not implemented",
	}
}

func handleKYC(r *http.Request) Response {
	return Response{
		Status: "error",
		Error:  "Not implemented",
	}
}

func handleAccounts(r *http.Request) Response {
	return Response{
		Status: "error",
		Error:  "Not implemented",
	}
}
