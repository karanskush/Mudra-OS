package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"fintech-api/pkg/database"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string                 `json:"status"`
	Message   string                 `json:"message"`
	Time      time.Time              `json:"time"`
	Timestamp int64                  `json:"timestamp"`
	Database  map[string]interface{} `json:"database,omitempty"`
}

// Health handles the health check endpoint
func Health(w http.ResponseWriter, r *http.Request) {
	// Simple health check without database dependency
	response := HealthResponse{
		Status:    "ok",
		Message:   "Fintech Backend is running",
		Time:      time.Now().UTC(),
		Timestamp: time.Now().Unix(),
	}

	// Only check database if it's initialized (optional)
	db := database.GetDB()
	if db != nil {
		// Test the database connection with a simple query
		if err := db.Raw("SELECT 1").Error; err != nil {
			response.Status = "degraded"
			response.Message = "Fintech Backend is running but database connection has issues"
			response.Database = map[string]interface{}{
				"connected": false,
				"error":     err.Error(),
			}
		} else {
			response.Database = map[string]interface{}{
				"connected": true,
				"status":    "connected",
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")

	// Set appropriate HTTP status code
	if response.Status == "ok" {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusServiceUnavailable)
	}

	json.NewEncoder(w).Encode(response)
}
