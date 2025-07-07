package main

import (
	"net/http"
	"os"

	"fintech-api/api"
)

// Handler is the main entry point for Vercel serverless functions
func Handler(w http.ResponseWriter, r *http.Request) {
	// Set Vercel environment variable
	os.Setenv("VERCEL", "1")

	// Delegate to the API handler
	api.Handler(w, r)
}
