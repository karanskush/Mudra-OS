package handler

import (
	"encoding/json"
	"net/http"
)

// Handler is the entrypoint for the Vercel serverless function
func Handler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"message": "API is running",
		"status":  "ok",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
