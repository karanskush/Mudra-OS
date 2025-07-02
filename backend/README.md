# Fintech Backend API

A high-performance, scalable Go backend for fintech applications built with clean architecture principles.

## 🚀 Features

- **Clean Architecture**: Separation of concerns with handlers, services, and repositories
- **JWT Authentication**: Secure token-based authentication
- **Database Integration**: PostgreSQL with GORM ORM
- **API Documentation**: Swagger/OpenAPI documentation
- **Logging**: Structured logging with logrus
- **Validation**: Request validation and sanitization
- **Security**: CORS, rate limiting, and encryption utilities
- **Testing**: Comprehensive test suite
- **Docker Support**: Containerized deployment

## 📁 Project Structure

```
backend/
├── cmd/                    # Application entry points
│   ├── server/            # Main API server
│   ├── worker/            # Background job worker
│   └── migrate/           # Database migration tool
├── internal/              # Private application code
│   ├── handlers/          # HTTP request handlers
│   ├── middleware/        # HTTP middleware
│   ├── models/            # Data models and structs
│   ├── services/          # Business logic layer
│   ├── repository/        # Data access layer
│   ├── database/          # Database connection and setup
│   ├── utils/             # Internal utilities
│   ├── config/            # Configuration management
│   └── validation/        # Request validation
├── pkg/                   # Public packages
│   ├── logger/            # Logging utilities
│   ├── errors/            # Error handling
│   ├── response/          # HTTP response utilities
│   ├── security/          # Security utilities
│   ├── encryption/        # Encryption/decryption
│   └── notifications/     # Notification services
├── api/                   # API definitions
│   ├── v1/                # API version 1
│   └── swagger/           # API documentation
├── configs/               # Configuration files
│   ├── dev/               # Development configs
│   ├── prod/              # Production configs
│   └── test/              # Test configs
├── scripts/               # Utility scripts
│   ├── migrations/        # Database migration scripts
│   ├── seeds/             # Database seeding scripts
│   └── setup/             # Setup scripts
├── deployments/           # Deployment configurations
│   ├── docker/            # Docker configurations
│   ├── kubernetes/        # Kubernetes manifests
│   └── terraform/         # Infrastructure as code
└── docs/                  # Documentation
```

## 🛠️ Setup

### Prerequisites

- Go 1.21 or higher
- PostgreSQL 12 or higher
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Create database
   createdb fintech_db
   
   # Run migrations
   go run cmd/migrate/main.go
   ```

5. **Run the server**
   ```bash
   go run cmd/server/main.go
   ```

## 🧪 Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific test
go test ./internal/handlers
```

## 📚 API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:8080/swagger/index.html`
- API Docs: `http://localhost:8080/api/v1/docs`

## 🐳 Docker

```bash
# Build the image
docker build -t fintech-backend .

# Run the container
docker run -p 8080:8080 fintech-backend
```

## 🔧 Development

### Code Style

This project follows Go best practices:
- Use `gofmt` for code formatting
- Follow Go naming conventions
- Write comprehensive tests
- Use meaningful commit messages

### Adding New Features

1. Create models in `internal/models/`
2. Add repository methods in `internal/repository/`
3. Implement business logic in `internal/services/`
4. Create handlers in `internal/handlers/`
5. Add routes in `api/v1/`
6. Write tests for all layers

## 📝 License

This project is licensed under the MIT License. 