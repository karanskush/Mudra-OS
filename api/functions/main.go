package main

import (
	"log"
	"net/http"
	"os"

	handler "fintech-api"
)

func main() {
	// Redirect standard log to stdout for Vercel
	log.SetOutput(os.Stdout)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// Get port from environment variable (Vercel sets this)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s", port)

	// Use the Handler function from the handler package
	http.HandleFunc("/", handler.Handler)

	// Start the server
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
