# Makefile for Fintech Backend (Vercel)

.PHONY: help build test clean deps dev deploy neon-test neon-setup

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