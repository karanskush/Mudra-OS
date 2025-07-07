package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// TransactionRequest represents the transaction creation request data
type TransactionRequest struct {
	FromAccount string  `json:"from_account"`
	ToAccount   string  `json:"to_account"`
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	Description string  `json:"description"`
}

// TransactionResponse represents the transaction creation response
type TransactionResponse struct {
	Message string             `json:"message"`
	TxID    string             `json:"tx_id"`
	Status  string             `json:"status"`
	Data    TransactionRequest `json:"data"`
}

// Handler is the main entry point for the transaction creation endpoint
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
	var txData TransactionRequest
	if err := json.Unmarshal(body, &txData); err != nil {
		http.Error(w, "Invalid transaction data", http.StatusBadRequest)
		return
	}

	response := TransactionResponse{
		Message: "Transaction created successfully",
		TxID:    "tx-" + fmt.Sprintf("%d", time.Now().Unix()),
		Status:  "completed",
		Data:    txData,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
