# Neon Database Environment Setup

## Create .env File

Create a `.env` file in the `backend/` directory with the following content:

```bash
# Server Configuration
SERVER_PORT=8080
SERVER_HOST=localhost
ENVIRONMENT=development

# Neon Database Configuration
# Use your Neon connection string from: https://console.neon.tech/
DATABASE_URL=postgresql://neondb_owner:npg_BwsfdVYuh83k@ep-long-night-a8tj4ial-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require

# Legacy Database Configuration (fallback) - Parsed from Neon URL
PGUSER=neondb_owner
PGHOST=ep-long-night-a8tj4ial-pooler.eastus2.azure.neon.tech
PGDATABASE=neondb
PGPASSWORD=npg_BwsfdVYuh83k
PGPORT=5432

# Legacy Database Configuration (fallback)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=fintech_db
DB_SSL_MODE=disable

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY_HOURS=24

# Redis Configuration (for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# External APIs
PAYMENT_GATEWAY_API_KEY=your-payment-gateway-key
PAYMENT_GATEWAY_SECRET=your-payment-gateway-secret

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Security
BCRYPT_COST=12
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1m
```

## Connection Details

Your Neon connection URL has been parsed into the following components:

- **PGUSER**: `neondb_owner`
- **PGHOST**: `ep-long-night-a8tj4ial-pooler.eastus2.azure.neon.tech`
- **PGDATABASE**: `neondb`
- **PGPASSWORD**: `npg_BwsfdVYuh83k`
- **PGPORT**: `5432`

## Test the Connection

After creating the `.env` file, test the connection:

```bash
cd backend
go run scripts/test_neon_connection.go
```

This will:
1. Connect to your Neon database
2. Enable required PostgreSQL extensions
3. Run database migrations
4. Create test data
5. Verify all operations work correctly

## Run the Application

```bash
cd backend
go run main.go
```

The application will automatically:
- Connect to Neon using the new connection URL
- Set up the database schema
- Start the HTTP server

## Health Check

Visit `http://localhost:8080/health` to see the application and database status.

## Notes

- The `DATABASE_URL` is the primary connection method (recommended by Neon)
- The individual `PG*` variables are provided as fallback for compatibility
- SSL is required for Neon connections (`sslmode=require&channel_binding=require`)
- The connection uses Neon's connection pooling for better performance 