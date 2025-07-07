# Vercel Deployment Guide

This guide covers deploying the Go API to Vercel and troubleshooting common deployment issues.

## Prerequisites

- Go 1.23+ installed
- Vercel CLI installed (`npm i -g vercel`)
- A Vercel account
- A Neon database (or any PostgreSQL database)

## Environment Variables

Set these environment variables in your Vercel project settings:

### Required Variables

```bash
# Database Configuration (Neon recommended)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Server Configuration
SERVER_PORT=8080
ENVIRONMENT=production
```

### Optional Variables

```bash
# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_GORM_LOGGING=false

# Security Configuration
BCRYPT_COST=12
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1m
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Payment Configuration (if using payment gateways)
PAYMENT_GATEWAY_API_KEY=your-payment-api-key
PAYMENT_GATEWAY_SECRET=your-payment-secret
```

## Deployment Steps

### 1. Prepare Your Code

```bash
# Navigate to the api directory
cd api

# Test the deployment locally
chmod +x test-deployment.sh
./test-deployment.sh
```

### 2. Deploy to Vercel

```bash
# From the project root (not the api directory)
vercel

# Or deploy to production
vercel --prod
```

### 3. Set Environment Variables

After deployment, set the environment variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add each required variable

## Common Deployment Issues & Solutions

### Issue 1: "Could not find an exported function"

**Error**: `Error: Could not find an exported function in "api/pkg/config/config.go"`

**Solution**: 
- Ensure `vercel.json` points to the correct entry point (`api/index.go`)
- Verify the `Handler` function is exported (capitalized)
- Check that all files in the `api` directory use the same package name (`handler`)

### Issue 2: Database Connection Failures

**Error**: `failed to connect to database` or `connection refused`

**Solutions**:
- Verify `DATABASE_URL` is correctly set in Vercel environment variables
- Ensure your database allows connections from Vercel's IP ranges
- For Neon: Use the connection string from your dashboard
- Test database connectivity locally first

### Issue 3: JWT Secret Issues

**Error**: `invalid token` or authentication failures

**Solutions**:
- Set `JWT_SECRET` environment variable in Vercel
- Use a strong, unique secret (32+ characters)
- Ensure the same secret is used across all environments

### Issue 4: Logger Initialization Errors

**Error**: `panic: runtime error: invalid memory address or nil pointer dereference`

**Solution**: 
- The logger is now automatically initialized in `initApp()`
- Ensure `logger.Init()` is called before any logging operations

### Issue 5: CORS Issues

**Error**: CORS errors in browser console

**Solutions**:
- CORS headers are automatically added by middleware
- Set `CORS_ALLOWED_ORIGINS` environment variable for production
- Ensure your frontend domain is included in allowed origins

### Issue 6: Cold Start Performance

**Issue**: Slow response times on first request

**Solutions**:
- Database connection pool is optimized for serverless
- Connection timeouts are set to 4 seconds
- Consider using connection pooling services for production

## Testing Your Deployment

### 1. Health Check

```bash
curl https://your-vercel-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### 2. CORS Test

```bash
curl -X OPTIONS https://your-vercel-app.vercel.app/api/health \
  -H "Origin: https://yourdomain.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### 3. Registration Test

```bash
curl -X POST https://your-vercel-app.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

## Performance Optimization

### 1. Database Optimization

- Use connection pooling (already configured)
- Enable query caching where appropriate
- Use indexes on frequently queried columns

### 2. Cold Start Optimization

- Keep dependencies minimal
- Use lazy loading for non-critical components
- Consider using Vercel's Edge Functions for simple operations

### 3. Memory Optimization

- Database connection pool is limited to 5 connections
- Idle connections timeout after 1 minute
- GORM logging can be disabled in production

## Monitoring & Debugging

### 1. Vercel Logs

View deployment logs in the Vercel dashboard:
1. Go to your project
2. Click on the latest deployment
3. View Function Logs

### 2. Application Logs

Logs are automatically sent to stdout for Vercel:
- Info level logs for normal operations
- Error level logs for debugging issues
- Structured JSON format for easy parsing

### 3. Health Monitoring

Use the health endpoint for monitoring:
```bash
# Check application health
curl https://your-app.vercel.app/api/health

# Check database connectivity
curl https://your-app.vercel.app/api/health/db
```

## Troubleshooting Checklist

- [ ] All required environment variables are set in Vercel
- [ ] `vercel.json` points to `api/index.go`
- [ ] Database is accessible from Vercel's servers
- [ ] JWT secret is properly configured
- [ ] CORS origins are correctly set
- [ ] All Go dependencies are properly specified in `go.mod`
- [ ] The `Handler` function is exported and accessible
- [ ] Logger is properly initialized
- [ ] Database connection pool is configured for serverless

## Support

If you encounter issues not covered in this guide:

1. Check the Vercel deployment logs
2. Test locally using the test script
3. Verify all environment variables are set
4. Check the application logs for specific error messages
5. Ensure your database is accessible from external connections

## Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **JWT Secrets**: Use strong, unique secrets for each environment
3. **Database Security**: Use SSL connections and restrict access
4. **CORS**: Only allow necessary origins in production
5. **Rate Limiting**: Configure appropriate rate limits for your use case
6. **Input Validation**: Always validate and sanitize user input
7. **Error Handling**: Don't expose sensitive information in error messages 