package handler

import (
	"encoding/json"
	"net/http"
	"project2/pkg/config"
	"project2/pkg/database"
)

// Handler is the entrypoint for the Vercel serverless function
func Handler(w http.ResponseWriter, r *http.Request) {
	// Initialize configuration
	cfg, err := config.Init()
	if err != nil {
		http.Error(w, "Failed to initialize config", http.StatusInternalServerError)
		return
	}

	// Initialize database connection
	err = database.Connect(cfg)
	if err != nil {
		http.Error(w, "Failed to connect to database", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message":            "API is running",
		"status":             "ok",
		"database_connected": true,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
