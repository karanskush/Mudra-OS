package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	"api/pkg/config"
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
	initialized bool
	cfg         *config.Config
)

func init() {
	// Redirect standard log to stdout for Vercel
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.Lshortfile)
}

// Handler is the main entry point for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	// Initialize app if needed (for serverless cold starts)
	if !initialized {
		var err error
		cfg, err = config.Init()
		if err != nil {
			log.Printf("Failed to initialize app: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		initialized = true
	}

	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
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
