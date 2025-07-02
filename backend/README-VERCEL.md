# Fintech Backend API - Vercel Deployment

A serverless Go backend for fintech applications deployed on Vercel.

## ⚠️ Important Notes for Vercel Deployment

### Serverless Limitations
- **No Long-Running Processes**: Vercel functions are stateless and have execution time limits
- **No Persistent Connections**: Database connections must be established per request
- **Cold Starts**: Functions may have initial startup delays
- **Memory Limits**: Limited memory per function execution

### Database Considerations
- **Connection Pooling**: Not suitable for Vercel's serverless model
- **Recommended**: Use managed database services (PlanetScale, Supabase, Neon)
- **Connection Management**: Create new connections per request or use connection pooling services

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Vercel account
- Go 1.21+ installed locally
- Vercel CLI (optional)

### Deployment Steps

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy from CLI**
   ```bash
   cd backend
   vercel
   ```

3. **Or Deploy via GitHub**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically deploy

### Environment Variables

Set these in your Vercel project settings:

```bash
# Database (use managed service)
DATABASE_URL=your_database_connection_string

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY_HOURS=24

# External APIs
PAYMENT_GATEWAY_API_KEY=your-payment-gateway-key
PAYMENT_GATEWAY_SECRET=your-payment-gateway-secret

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

## 📁 Project Structure for Vercel

```
backend/
├── api/                    # Serverless functions
│   ├── index.go           # Main router
│   ├── health.go          # Health check
│   ├── auth.go            # Authentication
│   ├── users.go           # User management
│   ├── accounts.go        # Account management
│   └── ...
├── pkg/                   # Shared packages
│   ├── response/          # HTTP response utilities
│   ├── logger/            # Logging utilities
│   └── ...
├── vercel.json            # Vercel configuration
├── go.mod                 # Go dependencies
└── README-VERCEL.md       # This file
```

## 🔧 API Endpoints

### Health Check
- `GET /health` - Service health status

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

## 🧪 Testing Locally

1. **Install dependencies**
   ```bash
   go mod download
   ```

2. **Run with Vercel CLI**
   ```bash
   vercel dev
   ```

3. **Test endpoints**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/api/v1/auth/login \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

## 🔄 Development Workflow

1. **Local Development**
   ```bash
   vercel dev
   ```

2. **Deploy to Preview**
   ```bash
   vercel --prod
   ```

3. **Production Deployment**
   - Push to main branch (auto-deploys)
   - Or use `vercel --prod`

## 📊 Monitoring

- **Vercel Dashboard**: Monitor function performance
- **Function Logs**: View execution logs
- **Analytics**: Track API usage and performance

## 🚨 Best Practices

### Performance
- Keep functions lightweight
- Minimize dependencies
- Use connection pooling services
- Implement proper error handling

### Security
- Validate all inputs
- Use environment variables for secrets
- Implement proper authentication
- Add rate limiting (consider using Vercel's edge functions)

### Database
- Use managed database services
- Implement connection pooling
- Handle connection timeouts
- Use read replicas for scaling

## 🔗 Useful Links

- [Vercel Go Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/go)
- [Vercel Functions](https://vercel.com/docs/functions)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI](https://vercel.com/docs/cli)

## 📝 Next Steps

1. **Database Integration**: Connect to a managed database service
2. **Authentication**: Implement JWT token validation
3. **Validation**: Add request validation middleware
4. **Testing**: Add unit and integration tests
5. **Monitoring**: Set up logging and monitoring
6. **Security**: Implement rate limiting and security headers 