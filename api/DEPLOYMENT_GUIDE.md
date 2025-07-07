# Vercel Deployment Guide

## Issue Resolution

The original error was:
```
Command failed: go build -ldflags -s -w -o /tmp/46075057/bootstrap /vercel/path0/api/api/main__vc__go__.go
```

This was caused by:
1. Package conflicts between protobuf files and main application files
2. Incorrect file structure for Vercel's Go runtime
3. Missing proper entry point for serverless functions

## Fixed Structure

### File Organization
```
api/
├── index.go              # Vercel serverless function entry point
├── main.go               # Local development server
├── api/                  # API handlers
│   ├── index.go         # Main API router
│   ├── auth.go          # Authentication handlers
│   ├── users.go         # User management
│   ├── accounts.go      # Account management
│   ├── ledger.go        # Ledger operations
│   ├── kyc.go           # KYC operations
│   ├── health.go        # Health check
│   └── grpc_bridge.go   # gRPC bridge handlers
├── proto_files/         # Protobuf generated files (moved from root)
├── internal/            # Internal packages
├── pkg/                 # Shared packages
├── vercel.json          # Vercel configuration
└── go.mod               # Go dependencies
```

### Key Changes Made

1. **Created clean entry point**: `api/index.go` with only the `Handler` function
2. **Moved protobuf files**: All `.pb.go` files moved to `proto_files/` directory
3. **Updated API handler**: Added proper initialization for serverless cold starts
4. **Added Vercel config**: `vercel.json` with proper function configuration

## Deployment Steps

### 1. Environment Variables

Set these in your Vercel project settings:

```bash
# Database (required)
DATABASE_URL=your_neon_database_connection_string

# JWT (required)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY_HOURS=24

# Optional - with defaults
LOG_LEVEL=info
LOG_FORMAT=json
ENVIRONMENT=production
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### 2. Deploy to Vercel

```bash
# From the api directory
vercel --prod
```

### 3. Test Deployment

```bash
# Health check
curl https://your-vercel-domain.vercel.app/api/health

# Test authentication
curl -X POST https://your-vercel-domain.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Local Development

```bash
# Run locally
go run .

# Or with specific port
PORT=3000 go run .
```

## Troubleshooting

### Build Errors
- Ensure all protobuf files are in `proto_files/` directory
- Check that `go.mod` has all required dependencies
- Run `go mod tidy` before deployment

### Runtime Errors
- Check environment variables are set correctly
- Verify database connection string is valid
- Check Vercel function logs for detailed error messages

### Cold Start Issues
- The application initializes on first request
- Database connections are established per request
- Consider using connection pooling services for production

## API Endpoints

### Health Check
- `GET /api/health` - Service health status

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### Accounts
- `GET /api/v1/accounts` - List user accounts
- `POST /api/v1/accounts` - Create new account
- `GET /api/v1/accounts/:id` - Get specific account

### Ledger
- `GET /api/ledger/accounts` - List ledger accounts
- `POST /api/ledger/accounts` - Create ledger account
- `POST /api/ledger/transfers` - Create ledger transfer

### KYC
- `GET /api/kyc/dashboard` - KYC dashboard
- `POST /api/kyc/start` - Start KYC process
- `GET /api/kyc/status/:id` - Get KYC status 