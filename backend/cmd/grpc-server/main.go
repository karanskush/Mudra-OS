package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"

	"fintech-backend/internal/config"
	"fintech-backend/internal/database"
	grpcserver "fintech-backend/internal/grpc"
	"fintech-backend/pkg/logger"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/rs/cors"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	logger.Init(cfg.Logging.Level, cfg.Logging.Format)

	// Initialize database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Create gRPC server with HTTP/2 support
	grpcServer := grpc.NewServer(
		grpc.MaxRecvMsgSize(1024*1024*4), // 4MB max message size
		grpc.MaxSendMsgSize(1024*1024*4), // 4MB max message size
	)

	// Register services
	grpcserver.RegisterServices(grpcServer)

	// Enable gRPC reflection for development
	reflection.Register(grpcServer)

	// Create gRPC-Web wrapper for HTTP/1.1 compatibility
	grpcWebServer := grpcweb.WrapServer(grpcServer,
		grpcweb.WithCorsForRegisteredEndpointsOnly(false),
		grpcweb.WithOriginFunc(func(origin string) bool {
			// Allow all origins for development - restrict in production
			return true
		}),
		grpcweb.WithAllowedRequestHeaders([]string{"*"}),
	)

	// Create HTTP handler that can serve both gRPC-Web and regular HTTP
	httpHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Handle CORS preflight requests
		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD")
			w.Header().Set("Access-Control-Allow-Headers", "*")
			w.Header().Set("Access-Control-Expose-Headers", "grpc-status, grpc-message, grpc-status-details-bin")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.WriteHeader(http.StatusOK)
			return
		}

		// Check if it's a native gRPC request (HTTP/2 with gRPC content-type)
		contentType := r.Header.Get("Content-Type")
		if r.ProtoMajor == 2 && (contentType == "application/grpc" || strings.HasPrefix(contentType, "application/grpc+")) {
			// This is a native gRPC request - pass to gRPC server directly
			grpcServer.ServeHTTP(w, r)
			return
		}

		// Check if it's a gRPC-Web request (check content-type and accept headers)
		accept := r.Header.Get("Accept")

		isGrpcWebRequest := (contentType == "application/grpc-web" ||
			contentType == "application/grpc-web+proto" ||
			contentType == "application/grpc-web-text" ||
			contentType == "application/grpc-web-text+proto" ||
			accept == "application/grpc-web" ||
			accept == "application/grpc-web+proto" ||
			accept == "application/grpc-web-text" ||
			accept == "application/grpc-web-text+proto")

		if isGrpcWebRequest {
			grpcWebServer.ServeHTTP(w, r)
			return
		}

		// Handle regular HTTP requests (for testing/health checks)
		if r.URL.Path == "/" || r.URL.Path == "/health" {
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{
				"status": "healthy",
				"service": "gRPC Server with gRPC-Web support",
				"protocols": ["HTTP/2 gRPC", "HTTP/1.1 gRPC-Web"],
				"port": "50051",
				"endpoints": {
					"grpc": "localhost:50051",
					"grpc_web": "http://localhost:50051",
					"health": "http://localhost:50051/health"
				},
				"cors": "enabled",
				"reflection": "enabled"
			}`))
			return
		}

		// Default response for unknown paths
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{
			"error": "Not Found",
			"message": "This is a gRPC server. Use gRPC clients or gRPC-Web to interact with services.",
			"available_protocols": ["HTTP/2 gRPC", "HTTP/1.1 gRPC-Web"],
			"health_check": "GET /health"
		}`))
	})

	// Apply CORS to the entire handler
	finalHandler := cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // Allow all origins for development
		AllowedMethods: []string{
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
			http.MethodOptions,
			http.MethodHead,
		},
		AllowedHeaders: []string{"*"},
		ExposedHeaders: []string{
			"grpc-status",
			"grpc-message",
			"grpc-status-details-bin",
		},
		AllowCredentials: true,
	}).Handler(httpHandler)

	// Enable HTTP/2 cleartext (h2c) support for gRPC
	h2cHandler := h2c.NewHandler(finalHandler, &http2.Server{})

	// Listen on TCP port for both HTTP/2 gRPC and HTTP/1.1 gRPC-Web
	listener, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Failed to listen on port 50051: %v", err)
	}

	log.Println("🚀 gRPC Server with gRPC-Web support starting on port 50051...")
	log.Println("✅ Services registered successfully!")
	log.Println("🔄 Supports bidirectional streaming")
	log.Println("📡 Supporting both HTTP/2 gRPC and HTTP/1.1 gRPC-Web")
	log.Println("🌐 CORS enabled for web browsers")
	log.Println("🩺 Health check available at: http://localhost:50051/health")
	log.Println("🔍 gRPC reflection enabled for development")

	fmt.Printf("gRPC server (with gRPC-Web) listening at %v\n", listener.Addr())

	// Serve both gRPC and gRPC-Web requests with HTTP/2 support
	if err := http.Serve(listener, h2cHandler); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
