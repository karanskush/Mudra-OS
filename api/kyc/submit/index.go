package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// KYCRequest represents the KYC submission request data
type KYCRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Country string `json:"country"`
}

// KYCResponse represents the KYC submission response
type KYCResponse struct {
	Message string     `json:"message"`
	KYCID   string     `json:"kyc_id"`
	Status  string     `json:"status"`
	Data    KYCRequest `json:"data"`
}

// Handler is the main entry point for the KYC submission endpoint
func Handler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// Only allow POST requests
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Read request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Parse JSON request
	var kycData KYCRequest
	if err := json.Unmarshal(body, &kycData); err != nil {
		http.Error(w, "Invalid KYC data", http.StatusBadRequest)
		return
	}

	response := KYCResponse{
		Message: "KYC submitted successfully",
		KYCID:   "kyc-" + fmt.Sprintf("%d", time.Now().Unix()),
		Status:  "pending",
		Data:    kycData,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
