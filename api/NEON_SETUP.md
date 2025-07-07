# Neon Database Integration Guide

This guide explains how to set up and use [Neon](https://neon.com/) as your PostgreSQL database provider for the fintech application.

## What is Neon?

Neon is a serverless Postgres platform that offers:
- **Autoscaling**: Automatically scales compute resources based on demand
- **Branching**: Create instant database branches for development/testing
- **Instant restore**: Point-in-time recovery capabilities
- **Serverless**: Pay only for what you use
- **Global distribution**: Deploy databases closer to your users

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the `api/` directory with your Neon connection string:

```bash
# Neon Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_BwsfdVYuh83k@ep-little-band-a8oxeh05-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require

# Other configuration...
SERVER_PORT=8080
SERVER_HOST=localhost
ENVIRONMENT=development
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRY_HOURS=24
```

### 2. Running the Application

```bash
cd backend
go run main.go
```

The application will:
1. Connect to your Neon database
2. Enable required PostgreSQL extensions (`uuid-ossp`, `pgcrypto`)
3. Run database migrations to create tables
4. Start the HTTP server

### 3. Database Schema

The application creates the following tables:

- **user**: User accounts and authentication
- **account**: Financial accounts (savings, checking, investment, credit)
- **transaction**: Financial transactions (deposits, withdrawals, transfers, payments)

## Neon Features Used

### PostgreSQL Extensions
- `uuid-ossp`: For UUID generation
- `pgcrypto`: For cryptographic functions

### Connection Pooling
The application uses Neon's connection pooling for better performance:
- Max idle connections: 10
- Max open connections: 100
- Connection lifetime: 1 hour

### SSL/TLS
Neon requires SSL connections with `sslmode=require` and `channel_binding=require`.

## Development Workflow

### Using Neon Branches (Future Enhancement)

Neon's branching feature allows you to:
- Create instant database copies for feature development
- Test migrations safely
- Share database state with team members

```go
// Example of creating a branch (requires Neon API integration)
err := database.CreateNeonBranch("feature/new-payment-system")
```

### Database Migrations

Migrations are handled automatically by GORM:

```go
// Models are automatically migrated
models := []interface{}{
    &models.User{},
    &models.Account{},
    &models.Transaction{},
}

err := database.AutoMigrate(models...)
```

## Monitoring and Debugging

### Connection Information

The application logs connection information on startup:

```go
connInfo := database.GetNeonConnectionInfo()
log.Printf("Neon database connection info: %+v", connInfo)
```

### Health Checks

You can add a health check endpoint to monitor database connectivity:

```go
func healthCheck(w http.ResponseWriter, r *http.Request) {
    if err := database.GetDB().Raw("SELECT 1").Error; err != nil {
        http.Error(w, "Database connection failed", http.StatusServiceUnavailable)
        return
    }
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("OK"))
}
```

## Production Considerations

### Environment Variables
- Use strong, unique JWT secrets
- Store sensitive configuration in environment variables
- Use different Neon projects for staging/production

### Security
- Neon automatically handles SSL/TLS encryption
- Use connection pooling for better performance
- Implement proper authentication and authorization

### Scaling
- Neon automatically scales based on demand
- Monitor connection pool usage
- Consider read replicas for high-traffic applications

## Troubleshooting

### Connection Issues
1. Verify your `DATABASE_URL` is correct
2. Check that SSL is enabled (`sslmode=require`)
3. Ensure your IP is not blocked by Neon's firewall

### Migration Issues
1. Check that required extensions are enabled
2. Verify table names don't conflict
3. Review GORM logs for specific error messages

### Performance Issues
1. Monitor connection pool usage
2. Check Neon's performance metrics
3. Consider query optimization

## Resources

- [Neon Documentation](https://neon.com/docs/introduction)
- [Neon Console](https://console.neon.tech/)
- [PostgreSQL Extensions](https://neon.com/docs/extensions/pg-extensions)
- [Connection Pooling](https://neon.com/docs/connect/connection-pooling)
- [Branching](https://neon.com/docs/introduction/branching)

## Support

For Neon-specific issues:
- [Neon Discord](https://discord.gg/neondatabase)
- [Neon Documentation](https://neon.com/docs)
- [Neon Status Page](https://status.neon.tech/) 