# 🚀 Deployment Guide

## Overview
Your project has three main components:
1. **Frontend**: React + TypeScript + Vite
2. **Backend APIs**: Go REST APIs
3. **gRPC Server**: Go gRPC services with gRPC-Web support

## 🎯 Recommended Strategy: **Railway for Everything**

### Why Railway?
- ✅ **Simplest setup** - One platform for everything
- ✅ **Built-in PostgreSQL** - No external database setup
- ✅ **Automatic HTTPS** - SSL certificates included
- ✅ **Easy environment variables** - Built-in secrets management
- ✅ **Automatic deployments** - Git-based deployments
- ✅ **Free tier available** - Good for development/testing

## 📋 Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Ensure all files are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Deploy to Railway

#### Option A: Deploy Everything to Railway (Recommended)

1. **Go to [Railway.app](https://railway.app)**
2. **Create a new project**
3. **Connect your GitHub repository**
4. **Add PostgreSQL service**:
   - Click "New Service" → "Database" → "PostgreSQL"
   - This will be your Neon database replacement

5. **Deploy Frontend**:
   - Click "New Service" → "GitHub Repo"
   - Select your repository
   - Railway will auto-detect it's a Node.js app
   - Set environment variables:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     VITE_GRPC_URL=https://your-grpc-url.railway.app
     ```

6. **Deploy Backend APIs**:
   - Click "New Service" → "GitHub Repo"
   - Select your repository
   - Set the **Root Directory** to `backend`
   - Set environment variables:
     ```
     DATABASE_URL=postgresql://... (from PostgreSQL service)
     PORT=8080
     ENVIRONMENT=production
     ```

7. **Deploy gRPC Server**:
   - Click "New Service" → "GitHub Repo"
   - Select your repository
   - Set the **Root Directory** to `backend`
   - Set the **Start Command** to: `go run cmd/grpc-server/main.go`
   - Set environment variables:
     ```
     DATABASE_URL=postgresql://... (from PostgreSQL service)
     PORT=50051
     ENVIRONMENT=production
     ```

#### Option B: Vercel + Railway Hybrid

1. **Frontend + Backend APIs on Vercel**:
   - Push to GitHub
   - Connect to Vercel
   - Vercel will auto-deploy

2. **gRPC Server on Railway**:
   - Follow steps 6-7 from Option A

### 3. Update Environment Variables

After deployment, update your frontend environment variables:

```typescript
// src/lib/env.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
export const GRPC_URL = import.meta.env.VITE_GRPC_URL || 'http://localhost:50051'
```

### 4. Update gRPC Client Configuration

```typescript
// src/lib/grpcClient.ts
const GRPC_ENDPOINT = import.meta.env.VITE_GRPC_URL || 'http://localhost:50051'
```

## 🔧 Environment Variables Setup

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.railway.app
VITE_GRPC_URL=https://your-grpc-url.railway.app
```

### Backend (.env.production)
```env
DATABASE_URL=postgresql://... (from Railway PostgreSQL)
PORT=8080
ENVIRONMENT=production
LOG_LEVEL=info
```

### gRPC Server (.env.production)
```env
DATABASE_URL=postgresql://... (from Railway PostgreSQL)
PORT=50051
ENVIRONMENT=production
LOG_LEVEL=info
```

## 🚀 Quick Deploy Commands

### Railway CLI (Alternative)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy frontend
cd /path/to/your/project
railway up

# Deploy backend
cd backend
railway up

# Deploy gRPC server
cd backend
railway up --service grpc-server
```

## 🔍 Health Checks

After deployment, verify your services:

1. **Frontend**: `https://your-frontend-url.railway.app`
2. **Backend APIs**: `https://your-backend-url.railway.app/health`
3. **gRPC Server**: `https://your-grpc-url.railway.app/health`

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**: Railway automatically handles CORS
2. **Database Connection**: Ensure `DATABASE_URL` is set correctly
3. **gRPC-Web Issues**: Verify the gRPC server URL in frontend
4. **Build Failures**: Check Railway logs for Go/Node.js build errors

### Debug Commands:
```bash
# Check Railway logs
railway logs

# Check service status
railway status

# View environment variables
railway variables
```

## 📊 Monitoring

Railway provides:
- ✅ **Real-time logs**
- ✅ **Service metrics**
- ✅ **Automatic restarts**
- ✅ **Health checks**

## 💰 Cost Estimation

**Railway Free Tier**:
- 500 hours/month
- 512MB RAM per service
- Shared CPU
- Perfect for development/testing

**Production Scaling**:
- $5/month per service for dedicated resources
- $20/month for PostgreSQL with 1GB storage

## 🎉 Next Steps

1. **Deploy using the steps above**
2. **Test all endpoints**
3. **Set up custom domains** (optional)
4. **Configure monitoring** (optional)
5. **Set up CI/CD** (optional)

Your fintech application will be live and accessible worldwide! 🌍 