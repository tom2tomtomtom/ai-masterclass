# 🚂 Railway Deployment Guide for AI-Masterclass

## Complete Beginner's Step-by-Step Guide

This guide will walk you through deploying your AI-Masterclass application to Railway with **zero prior deployment experience required**.

---

## 📋 What You'll Need

- [ ] A GitHub account (free)
- [ ] A Railway account (free tier available)
- [ ] Your AI-Masterclass code (this repository)
- [ ] 30-45 minutes of time

---

## 🎯 Step 1: Prepare Your Code

### 1.1 Commit Your Latest Changes
```bash
# In your AI-Masterclass folder
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 1.2 Verify Your Repository Structure
Make sure you have these files (they should already be there):
- ✅ `railway.json` (just created)
- ✅ `railway.toml` (just created) 
- ✅ `.env.railway` (environment template)
- ✅ `backend/package.json`
- ✅ `frontend/package.json`

---

## 🚀 Step 2: Create Railway Account

### 2.1 Sign Up for Railway
1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with your **GitHub account** (recommended)
4. Verify your email if prompted

### 2.2 Connect GitHub Repository
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **AI-Masterclass** repository
4. Click **"Deploy Now"**

---

## 🗄️ Step 3: Add Database Services

### 3.1 Add PostgreSQL Database
1. In your Railway project dashboard
2. Click **"+ New Service"**
3. Select **"Database"** → **"PostgreSQL"**
4. Wait for it to deploy (2-3 minutes)
5. ✅ You'll see a new "Postgres" service appear

### 3.2 Add Redis Cache
1. Click **"+ New Service"** again
2. Select **"Database"** → **"Redis"**
3. Wait for it to deploy (1-2 minutes)
4. ✅ You'll see a new "Redis" service appear

---

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Generate Secure Secrets
First, generate strong secrets. Use this online tool or command:

**Online:** Go to [passwordsgenerator.net](https://passwordsgenerator.net)
- Length: 32 characters
- Include: Letters, numbers, symbols
- Generate 2 different secrets

**Or use command line:**
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate Session secret  
openssl rand -base64 32
```

### 4.2 Set Environment Variables in Railway
1. Click on your **main app service** (not database services)
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add these variables **one by one**:

**🔐 Security Variables (REQUIRED):**
```
JWT_SECRET = [your-32-char-secret-from-step-4.1]
SESSION_SECRET = [your-different-32-char-secret-from-step-4.1]
```

**🗄️ Database Variables (Auto-filled by Railway):**
```
DATABASE_URL = ${{Postgres.DATABASE_URL}}
DB_HOST = ${{Postgres.PGHOST}}
DB_PORT = ${{Postgres.PGPORT}}
DB_DATABASE = ${{Postgres.PGDATABASE}}
DB_USER = ${{Postgres.PGUSER}}
DB_PASSWORD = ${{Postgres.PGPASSWORD}}
```

**📦 Redis Variables (Auto-filled by Railway):**
```
REDIS_URL = ${{Redis.REDIS_URL}}
```

**🌐 App Configuration:**
```
NODE_ENV = production
PORT = ${{PORT}}
DB_SSL = true
LOG_LEVEL = info
ENABLE_METRICS = true
ENABLE_CACHING = true
FRONTEND_URL = ${{RAILWAY_PUBLIC_DOMAIN}}
CORS_ORIGIN = ${{RAILWAY_PUBLIC_DOMAIN}}
```

### 4.3 Save and Deploy
1. Click **"Deploy"** button
2. Wait 3-5 minutes for deployment
3. ✅ Your app should show "Active" status

---

## 🎉 Step 5: Initialize Your Database

### 5.1 Run Database Setup
1. In Railway dashboard, click your **main app service**
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. Open **"View Logs"**
5. Look for successful database connection messages

### 5.2 Seed Your Database (Optional)
If you want sample data:
1. Go to **"Settings"** tab of your app service
2. Scroll to **"Service Settings"**
3. In **"Start Command"** field, temporarily change to:
   ```
   npm run db:seed && npm start
   ```
4. Click **"Deploy"** to restart with seeding
5. After deployment, change start command back to: `npm start`

---

## 🌐 Step 6: Access Your Live Application

### 6.1 Get Your App URL
1. In Railway dashboard, click your **main app service**
2. Look for **"Domains"** section
3. You'll see a URL like: `https://your-app-name.up.railway.app`
4. Click the URL to open your live app! 🎉

### 6.2 Test Your Application
1. **Frontend**: Should load your React app
2. **API Health**: Visit `your-url/health` - should show "OK"
3. **Database**: Try creating an account or logging in

---

## 🔧 Step 7: Custom Domain (Optional)

### 7.1 Add Your Own Domain
1. In your app service, go to **"Settings"**
2. Scroll to **"Domains"**
3. Click **"+ Custom Domain"**
4. Enter your domain (e.g., `aimasterclass.com`)
5. Follow DNS setup instructions
6. Railway provides free SSL certificates!

---

## 📊 Step 8: Monitor Your Application

### 8.1 View Logs
- **Real-time logs**: Deployments → Latest → View Logs
- **Error tracking**: Look for red error messages
- **Performance**: Monitor response times

### 8.2 Check Metrics
- **Usage**: Railway dashboard shows CPU/Memory usage
- **Database**: Monitor connection counts
- **Traffic**: See request volumes

---

## 🚨 Troubleshooting Common Issues

### Issue: "Application failed to start"
**Solution:**
1. Check logs for error messages
2. Verify all environment variables are set
3. Ensure database services are running

### Issue: "Database connection failed"
**Solution:**
1. Verify PostgreSQL service is active
2. Check DATABASE_URL variable is set correctly
3. Ensure DB_SSL=true for Railway

### Issue: "Frontend shows API errors"
**Solution:**
1. Check CORS_ORIGIN matches your domain
2. Verify REACT_APP_API_URL is set correctly
3. Ensure backend service is running

### Issue: "Environment variables not working"
**Solution:**
1. Double-check variable names (case-sensitive)
2. Ensure no extra spaces in values
3. Redeploy after changing variables

---

## 💰 Cost Estimation

**Railway Free Tier:**
- $5 credit per month
- Covers small applications
- No credit card required initially

**Typical Monthly Cost:**
- Small app: $0-5 (free tier)
- Medium traffic: $10-20
- High traffic: $30-50

---

## 🎯 Next Steps After Deployment

1. **Set up monitoring alerts**
2. **Configure automated backups**
3. **Add custom domain**
4. **Set up CI/CD for automatic deployments**
5. **Scale services based on usage**

---

## 📞 Getting Help

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: Create issue in your repository

---

**🎉 Congratulations! Your AI-Masterclass is now live on Railway!**

Share your live URL and start getting users! 🚀
