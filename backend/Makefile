# Makefile for Fintech Backend (Vercel)

.PHONY: help build test clean deps dev deploy neon-test neon-setup proto-gen grpc-server run-all

# Default target
help:
	@echo "Available commands:"
	@echo "  build       - Build the application"
	@echo "  test        - Run tests"
	@echo "  clean       - Clean build artifacts"
	@echo "  deps        - Download dependencies"
	@echo "  dev         - Run development server with Vercel"
	@echo "  deploy      - Deploy to Vercel"
	@echo "  neon-test   - Test Neon database connection"
	@echo "  neon-setup  - Setup Neon database (extensions and migrations)"
	@echo "  proto-gen   - Generate Go code from proto files"
	@echo "  grpc-server - Run the gRPC server"
	@echo "  test-grpc   - Test gRPC APIs"
	@echo "  test-grpc-health - Health check gRPC server"
	@echo "  test-grpc-implemented - Test only implemented methods"
	@echo "  run-all     - Run both REST and gRPC servers"

# Build the application
build:
	@echo "Building application..."
	go build -o bin/server cmd/server/main.go

# Run tests
test:
	@echo "Running tests..."
	go test -v ./...

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/
	rm -f coverage.out
	rm -rf proto/gen/

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	go mod download
	go mod tidy

# Run development server with Vercel
dev:
	@echo "Starting Vercel development server..."
	vercel dev

# Deploy to Vercel
deploy:
	@echo "Deploying to Vercel..."
	vercel --prod

# Deploy to Vercel (preview)
deploy-preview:
	@echo "Deploying to Vercel (preview)..."
	vercel

# Test Neon database connection
neon-test:
	@echo "Testing Neon database connection..."
	go run scripts/test_neon_connection.go

# Setup Neon database (extensions and migrations)
neon-setup:
	@echo "Setting up Neon database..."
	go run main.go

# Format code
fmt:
	@echo "Formatting code..."
	go fmt ./...

# Lint code
lint:
	@echo "Linting code..."
	golangci-lint run

# Install development tools
install-tools:
	@echo "Installing development tools..."
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Development setup
setup: deps install-tools
	@echo "Development setup complete!"
	@echo "To start development: make dev"
	@echo "To deploy: make deploy"
	@echo "To test Neon: make neon-test"

# Generate Go code from proto files
proto-gen:
	@echo "Generating Go code from proto files..."
	@mkdir -p proto/gen
	protoc --go_out=proto/gen --go_opt=module=fintech-backend/proto/gen \
		--go-grpc_out=proto/gen --go-grpc_opt=module=fintech-backend/proto/gen \
		--proto_path=proto \
		proto/*.proto
	@echo "Proto files generated successfully"

# Install protoc dependencies
proto-deps:
	go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Run the gRPC server
grpc-server:
	go run cmd/grpc-server/main.go

# Test gRPC APIs
test-grpc:
	@echo "Testing gRPC APIs..."
	go run cmd/test-grpc/main.go

# Test only implemented gRPC methods
test-grpc-implemented:
	@echo "Testing implemented gRPC methods..."
	@echo "🔧 Testing Actually Implemented Methods..."
	@echo "=========================================="
	go run cmd/test-grpc/main.go 2>&1 | grep -A 50 "Testing Actually Implemented Methods" | head -n 50

# Health check gRPC server
test-grpc-health:
	@echo "🏥 gRPC Server Health Check"
	@echo "==========================="
	go run cmd/test-grpc/main.go 2>&1 | grep -A 30 "gRPC Server Health Check" | head -n 30

# Run both REST and gRPC servers
run-all:
	@echo "Starting both REST and gRPC servers..."
	go run cmd/server/main.go &
	go run cmd/grpc-server/main.go 