# Environment Configuration Guide

## 🔒 Security Overview

**CRITICAL:** Never commit real environment secrets to version control. All actual `.env` files with real credentials are in `.gitignore`.

## 📁 Environment File Structure

```
├── .env.example                    # Template with all variables
├── .env.local                     # Your personal local config (git-ignored)
├── config/
│   └── env/
│       ├── .env.development.template   # Development setup template
│       ├── .env.production.template    # Production deployment template
│       ├── .env.test.template         # Testing configuration template
│       ├── .env.production            # Production config (SECURE)
│       └── .env.railway              # Railway deployment config
├── frontend/
│   ├── .env.example              # Frontend-specific template
│   ├── .env.local               # Local frontend config (git-ignored)
│   └── .env.production          # Production frontend config
└── backend/
    └── .env.local               # Local backend config (git-ignored)
```

## 🚀 Quick Setup

### 1. Development Setup
```bash
# Copy the main template
cp .env.example .env.local

# Copy frontend template
cp frontend/.env.example frontend/.env.local

# Copy backend template
cp config/env/.env.development.template backend/.env.local

# Edit each file with your actual credentials
```

### 2. Configure Your Local Environment
Edit `.env.local` with your actual values:

```bash
# Required: Your Supabase project credentials
SUPABASE_URL=https://your-actual-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-actual-service-key
SUPABASE_ANON_KEY=eyJ...your-actual-anon-key

# Required: Strong secrets (minimum 32 characters)
JWT_SECRET=your-strong-jwt-secret-minimum-32-characters
SESSION_SECRET=your-strong-session-secret-minimum-32-characters

# Database (if using local PostgreSQL)
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=ai_masterclass_dev
```

## 🔧 Environment-Specific Configuration

### Development
- Uses local database and relaxed security settings
- Debug logging enabled
- CORS allows localhost origins
- Rate limiting is relaxed

### Testing
- Uses separate test database
- Minimal logging
- Mock external services
- Fast test execution settings

### Production
- Uses environment variables from deployment platform
- Strict security headers
- SSL/TLS enforced
- Comprehensive logging and monitoring
- Strong rate limiting

## 🛡️ Security Best Practices

### 1. Secret Management
✅ **DO:**
- Use strong, unique secrets for each environment
- Store production secrets in deployment platform environment variables
- Use minimum 32-character random secrets for JWT/Session
- Rotate secrets regularly

❌ **DON'T:**
- Commit `.env` files with real secrets
- Use weak or predictable secrets
- Share secrets in chat/email
- Use production secrets in development

### 2. Database Security
✅ **DO:**
- Use separate databases for dev/test/prod
- Use SSL connections in production
- Limit database user permissions
- Regular backups

### 3. API Key Security
✅ **DO:**
- Use separate API keys for different environments
- Monitor API key usage
- Set usage limits and alerts
- Use service role keys only on backend

## 🚢 Deployment Configuration

### Railway.app
Set these environment variables in Railway dashboard:
```bash
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-production-jwt-secret-32-chars-minimum
SESSION_SECRET=your-production-session-secret-32-chars-minimum
FRONTEND_URL=https://your-app.railway.app
```

### Vercel/Netlify
Set these in your deployment platform:
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=https://your-backend.railway.app
```

## 🧪 Testing Setup

### Local Testing
```bash
# Use test-specific configuration
NODE_ENV=test npm test

# Or copy test template
cp config/env/.env.test.template .env.test.local
```

### CI/CD Testing
Set these in GitHub Actions secrets:
```bash
SUPABASE_URL_TEST=https://test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY_TEST=test-key
JWT_SECRET_TEST=test-jwt-secret-for-ci-cd
```

## 🔍 Troubleshooting

### Common Issues

1. **"JWT Secret not found"**
   - Check your `.env.local` has `JWT_SECRET` set
   - Ensure it's at least 32 characters long

2. **"Database connection failed"**
   - Verify database credentials in `.env.local`
   - Ensure PostgreSQL is running locally
   - Check database name matches

3. **"Supabase client error"**
   - Verify `SUPABASE_URL` and keys are correct
   - Check project is active in Supabase dashboard

4. **"CORS errors"**
   - Ensure `CORS_ORIGIN` matches your frontend URL
   - Check both backend and frontend configs

### Environment Loading Order
1. `.env.local` (highest priority, git-ignored)
2. `.env.{NODE_ENV}` (e.g., `.env.development`)
3. `.env`
4. Process environment variables

## 📝 Environment Variables Reference

### Backend Variables
- `NODE_ENV`: Environment mode (development/test/production)
- `PORT`: Server port (default: 8000)
- `JWT_SECRET`: JWT signing secret (32+ chars required)
- `SESSION_SECRET`: Session signing secret (32+ chars required)
- `DB_*`: Database connection settings
- `SUPABASE_*`: Supabase project configuration
- `RATE_LIMIT_*`: API rate limiting settings

### Frontend Variables
- `REACT_APP_*`: React app environment variables (publicly exposed)
- `REACT_APP_SUPABASE_URL`: Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anonymous key (safe to expose)
- `REACT_APP_API_URL`: Backend API base URL

## 🆘 Need Help?

1. Check this guide first
2. Verify your `.env.local` files exist and have correct values
3. Check the example templates in `config/env/`
4. Ensure all required environment variables are set
5. Check the deployment platform documentation for environment variable setup