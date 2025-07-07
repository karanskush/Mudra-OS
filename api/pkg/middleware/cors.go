package middleware

import (
	"log"
	"net/http"
)

// CORSMiddleware adds CORS headers to all responses
func CORSMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("CORS middleware called for: %s %s", r.Method, r.URL.Path)

		// Add CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			log.Printf("Handling OPTIONS preflight request")
			w.WriteHeader(http.StatusOK)
			return
		}

		// Call next handler
		next.ServeHTTP(w, r)
	})
}

// CORSMiddlewareWithAuth combines CORS and Auth middleware
func CORSMiddlewareWithAuth(next http.HandlerFunc) http.HandlerFunc {
	return CORSMiddleware(AuthMiddlewareHTTP(next))
}
