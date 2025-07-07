# Fintech API - Vercel Deployment

A streamlined fintech backend API optimized for Vercel serverless deployment.

## Project Structure

```
project 2/
├── api/                    # Go serverless functions
│   ├── index.go           # Main API router
│   ├── health/            # Health check endpoint
│   ├── auth/login/        # Authentication endpoint
│   ├── kyc/submit/        # KYC submission endpoint
│   ├── ledger/transactions/ # Transaction creation endpoint
│   ├── users/             # User listing endpoint
│   ├── go.mod             # Go module dependencies
│   └── go.sum             # Dependency checksums
├── src/                   # Frontend React application
├── public/                # Static assets
├── vercel.json           # Vercel deployment configuration
└── package.json          # Frontend dependencies
```

## Features

- **Health Check**: `/api/health` - API status endpoint
- **Authentication**: `/api/auth/login` - User login
- **KYC Management**: `/api/kyc/submit` - KYC submission
- **Ledger Operations**: `/api/ledger/transactions` - Transaction creation
- **User Management**: `/api/users` - User listing

## API Endpoints

### Health Check
```http
GET /api/health
```

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

### KYC Submission
```http
POST /api/kyc/submit
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "country": "US"
}
```

### Transaction Creation
```http
POST /api/ledger/transactions
Content-Type: application/json

{
  "from_account": "acc-001",
  "to_account": "acc-002",
  "amount": 100.50,
  "currency": "USD",
  "description": "Payment for services"
}
```

### User Listing
```http
GET /api/users
```

## Deployment

### Prerequisites
- Vercel account
- Go 1.24+
- Node.js 18+

### Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Environment Variables

Set these in your Vercel project settings:

```env
ENV=production
```

## Local Development

### Backend (Go API)

```bash
cd api
go run index.go
```

### Frontend (React)

```bash
npm install
npm run dev
```

## Architecture

- **Serverless Functions**: Go functions deployed on Vercel using standard HTTP handlers
- **Frontend**: React with Vite for fast development
- **API**: RESTful endpoints with JSON responses
- **CORS**: Enabled for cross-origin requests
- **No Framework Dependencies**: Uses only standard Go libraries for minimal cold start times

## Benefits of Refactoring

1. **Reduced Complexity**: Removed redundant files and directories
2. **Vercel Optimized**: Simplified for serverless deployment using standard HTTP handlers
3. **Minimal Dependencies**: Removed Gin framework, using only standard Go libraries
4. **Clean Structure**: Clear separation of concerns with individual endpoint functions
5. **Fast Deployment**: Minimal build time and cold starts with no framework overhead
6. **Better Performance**: Direct HTTP handling without framework middleware

## Testing

Test the API endpoints using curl or Postman:

```bash
# Health check
curl https://your-vercel-app.vercel.app/api/health

# Login
curl -X POST https://your-vercel-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
``` 