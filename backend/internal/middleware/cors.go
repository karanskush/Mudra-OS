package middleware

import (
	"log"
	"net/http"
	"os"
	"strings"
)

// CORSMiddleware adds CORS headers to all responses
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("CORS middleware called for: %s %s", r.Method, r.URL.Path)

		// Get allowed origins from environment variable or use default
		allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
		if allowedOrigins == "" {
			allowedOrigins = "http://localhost:3000,https://project-2-production-de10.up.railway.app,https://www.mudraos.xyz"
		}

		// Check if the request origin is allowed
		origin := r.Header.Get("Origin")
		if origin != "" {
			origins := strings.Split(allowedOrigins, ",")
			allowed := false
			for _, allowedOrigin := range origins {
				if origin == strings.TrimSpace(allowedOrigin) {
					allowed = true
					break
				}
			}
			if allowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			} else {
				log.Printf("Origin not allowed: %s", origin)
			}
		} else {
			// If no origin header, allow all (for non-browser clients)
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}

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
func CORSMiddlewareWithAuth(next http.Handler) http.Handler {
	return CORSMiddleware(AuthMiddleware(next))
}
