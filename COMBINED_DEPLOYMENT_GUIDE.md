# Combined Frontend + Backend Deployment Guide

## Overview
This guide shows how to deploy your React frontend and Go backend as a single Vercel project.

## Current Setup
- ✅ Frontend: React + Vite
- ✅ Backend: Go API with Vercel functions
- ✅ Database: Neon PostgreSQL
- ✅ Combined deployment configuration

## Deployment Steps

### 1. Prepare Your Repository
Make sure your project structure looks like this:
```
/
├── src/                    # React frontend
├── backend/               # Go backend
│   ├── api/              # API handlers
│   ├── internal/         # Internal packages
│   └── main.go          # Main entry point
├── vercel.json          # Combined deployment config
├── package.json         # Frontend dependencies
└── go.mod              # Backend dependencies
```

### 2. Set Environment Variables in Vercel
Go to your Vercel project dashboard → Settings → Environment Variables

Add these variables:
```
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret_key
ENVIRONMENT=production
```

### 3. Deploy to Vercel
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel --prod
```

### 4. How It Works
- **Frontend**: Served from `/` (React app)
- **Backend**: Served from `/api/*` (Go functions)
- **Same Domain**: Both run on `your-app.vercel.app`

## API Endpoints
After deployment, your APIs will be available at:
- `https://your-app.vercel.app/api/health`
- `https://your-app.vercel.app/api/v1/auth/login`
- `https://your-app.vercel.app/api/ledger/accounts`
- etc.

## Development vs Production
- **Development**: Frontend calls `http://localhost:8080`
- **Production**: Frontend calls relative paths (same domain)

## Troubleshooting

### If APIs still show localhost:
1. Check that `vercel.json` is in the root directory
2. Verify environment variables are set in Vercel
3. Make sure the backend code is in the `backend/` directory

### If you get build errors:
1. Ensure Go modules are properly configured
2. Check that all dependencies are in `go.mod`
3. Verify the Vercel Go runtime is specified correctly

## Benefits of Combined Deployment
1. **Single Domain**: No CORS issues
2. **Simplified Configuration**: One deployment
3. **Cost Effective**: Single Vercel project
4. **Easier Management**: One dashboard for everything

## Next Steps
1. Deploy using the steps above
2. Test your APIs at the new URLs
3. Update any hardcoded localhost references
4. Monitor your deployment in Vercel dashboard 