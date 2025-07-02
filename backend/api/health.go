package api

import (
	"encoding/json"
	"net/http"
	"time"

	"fintech-backend/internal/database"
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
	// Check database connection
	dbStatus := "unknown"
	dbInfo := make(map[string]interface{})

	db := database.GetDB()
	if db != nil {
		// Test the database connection with a simple query
		if err := db.Raw("SELECT 1").Error; err != nil {
			dbStatus = "error"
			dbInfo["error"] = err.Error()
			dbInfo["connected"] = false
		} else {
			dbStatus = "connected"
			dbInfo = database.GetNeonConnectionInfo()
			dbInfo["connected"] = true
		}
	} else {
		dbStatus = "disconnected"
		dbInfo["error"] = "Database not initialized"
		dbInfo["connected"] = false
	}

	// Determine overall status
	overallStatus := "ok"
	message := "Fintech Backend is running with Neon database"

	if dbStatus == "error" || dbStatus == "disconnected" {
		overallStatus = "degraded"
		message = "Fintech Backend is running but database connection has issues"
	}

	response := HealthResponse{
		Status:    overallStatus,
		Message:   message,
		Time:      time.Now().UTC(),
		Timestamp: time.Now().Unix(),
		Database:  dbInfo,
	}

	w.Header().Set("Content-Type", "application/json")

	// Set appropriate HTTP status code
	if overallStatus == "ok" {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusServiceUnavailable)
	}

	json.NewEncoder(w).Encode(response)
}
