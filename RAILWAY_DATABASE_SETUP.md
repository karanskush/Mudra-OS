# 🗄️ Railway PostgreSQL Database Setup Guide

## How to Add PostgreSQL Database to Your Railway Project

### Step 1: Access Your Railway Project
1. Go to [Railway.app](https://railway.app)
2. Click on your project (the one you just created)

### Step 2: Add PostgreSQL Database Service
1. **In your project dashboard**, look for the **"New Service"** button
2. Click **"New Service"** → **"Database"** → **"PostgreSQL"**
3. Railway will automatically create a PostgreSQL database for you

### Step 3: Get Database Connection Details
1. **Click on the PostgreSQL service** in your project
2. Go to the **"Variables"** tab
3. Copy the **`DATABASE_URL`** - it looks like:
   ```
   postgresql://postgres:password@containers-us-west-XX.railway.app:5432/railway
   ```

### Step 4: Connect Your Backend Services to Database
1. **Go back to your main project**
2. **Click on your backend service** (the one with your Go code)
3. Go to **"Variables"** tab
4. **Add new variable**:
   - **Name**: `DATABASE_URL`
   - **Value**: Paste the `DATABASE_URL` from Step 3

### Step 5: Connect gRPC Service to Database
1. **Click on your gRPC service**
2. Go to **"Variables"** tab
3. **Add new variable**:
   - **Name**: `DATABASE_URL`
   - **Value**: Same `DATABASE_URL` from Step 3

## 🔍 Alternative: If You Don't See "Database" Option

### Method 1: Use Railway CLI
```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login to Railway
railway login

# List your projects
railway projects

# Add PostgreSQL to your project
railway service create --name postgres --type postgresql
```

### Method 2: Manual Database Creation
1. In your Railway project dashboard
2. Look for **"Add Service"** or **"New Service"**
3. If you don't see "Database", try:
   - **"New Service"** → **"Template"** → Search for "PostgreSQL"
   - Or **"New Service"** → **"GitHub Repo"** → Search for "postgresql" templates

### Method 3: Use External PostgreSQL
If Railway doesn't have PostgreSQL available, you can use:
- **Neon** (your current database): Keep using it
- **Supabase**: Free PostgreSQL hosting
- **PlanetScale**: MySQL alternative

## 🔧 Environment Variables Setup

### For Your Backend Services:
```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-XX.railway.app:5432/railway
PORT=8080
ENVIRONMENT=production
```

### For Your gRPC Service:
```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-XX.railway.app:5432/railway
PORT=50051
ENVIRONMENT=production
```

## 🚨 Troubleshooting

### If You Can't Find Database Option:
1. **Check your Railway plan** - Some features might be limited on free tier
2. **Try refreshing** the page
3. **Contact Railway support** if the option is missing

### If Database Connection Fails:
1. **Verify the DATABASE_URL** is correct
2. **Check if database is running** in Railway dashboard
3. **Ensure your Go code** can connect to external databases

### Alternative: Keep Using Neon
If you prefer to keep using your existing Neon database:
1. **Get your Neon connection string**
2. **Set it as DATABASE_URL** in your Railway services
3. **No need to create Railway PostgreSQL**

## 📊 Database Management

### Viewing Your Database:
1. Click on the **PostgreSQL service** in Railway
2. Go to **"Data"** tab to see tables
3. Go to **"Logs"** tab for database logs

### Database Migrations:
Your Go code will automatically run migrations when it starts up, so no manual setup needed!

## 🎯 Next Steps

1. **Add the PostgreSQL service** using the steps above
2. **Set the DATABASE_URL** in your backend services
3. **Redeploy your services** to connect to the new database
4. **Test your endpoints** to ensure everything works

Your fintech app will be fully functional with a managed PostgreSQL database! 🚀 