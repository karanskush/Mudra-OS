package main

import (
	"fmt"
	"log"
	"net/http"

	"fintech-backend/internal/config"
	"fintech-backend/internal/database"
	grpcserver "fintech-backend/internal/grpc"
	"fintech-backend/pkg/logger"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
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

	// Create gRPC server
	grpcServer := grpc.NewServer()

	// Register services
	grpcserver.RegisterServices(grpcServer)

	// Enable gRPC reflection for development
	reflection.Register(grpcServer)

	// Create gRPC-Web wrapper
	wrappedGrpc := grpcweb.WrapServer(grpcServer,
		grpcweb.WithOriginFunc(func(origin string) bool {
			return true // Allow all origins for development
		}),
		grpcweb.WithAllowedRequestHeaders([]string{"*"}),
		grpcweb.WithWebsockets(true),
		grpcweb.WithWebsocketOriginFunc(func(req *http.Request) bool {
			return true // Allow all WebSocket origins for development
		}),
	)

	// Create HTTP server for gRPC-Web
	httpServer := &http.Server{
		Addr: ":50051",
		Handler: http.HandlerFunc(func(resp http.ResponseWriter, req *http.Request) {
			// Add CORS headers for frontend development
			resp.Header().Set("Access-Control-Allow-Origin", "*")
			resp.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			resp.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
			resp.Header().Set("Access-Control-Allow-Credentials", "true")

			// Handle preflight requests
			if req.Method == "OPTIONS" {
				resp.WriteHeader(http.StatusOK)
				return
			}

			// Handle gRPC-Web requests
			if wrappedGrpc.IsGrpcWebRequest(req) || wrappedGrpc.IsAcceptableGrpcCorsRequest(req) {
				wrappedGrpc.ServeHTTP(resp, req)
				return
			}

			// Handle WebSocket upgrade for gRPC-Web
			if req.Header.Get("Upgrade") == "websocket" {
				wrappedGrpc.ServeHTTP(resp, req)
				return
			}

			// Default response for non-gRPC requests
			resp.Header().Set("Content-Type", "text/plain")
			resp.WriteHeader(http.StatusOK)
			resp.Write([]byte("gRPC-Web server is running. Use a gRPC-Web client to connect."))
		}),
	}

	log.Println("gRPC-Web server starting on port 50051...")
	log.Println("Services registered successfully!")
	log.Println("Supports both gRPC and gRPC-Web connections")

	fmt.Printf("gRPC-Web server listening at %v\n", httpServer.Addr)

	if err := httpServer.ListenAndServe(); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
