---
name: railway-deploy
description: Railway-specific deployment validation
---

Ensure the app is ready for Railway deployment:

## 1. Railway Configuration
Check for railway.json or create one:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## 2. Environment Variables
- List all variables in .env
- Check which are set in Railway dashboard
- Flag any missing variables
- Ensure DATABASE_URL is using Railway's format

## 3. Health Check Endpoint
Create if missing:
```javascript
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});
```

## 4. Database Migrations
- Check if migrations exist
- Ensure migration command in package.json
- Add to build command if needed:
  ```json
  "build": "npm run migrate && npm run build"
  ```

## 5. Static Files
- Ensure static files are properly served
- Check that public folder is included
- Verify images load correctly

## 6. Performance Quick Check
- Bundle size should be < 5MB
- Check for large dependencies
- Ensure images are optimized
- Enable gzip compression

## 7. Create Deployment Checklist
- [ ] Environment variables set in Railway
- [ ] Health check endpoint working
- [ ] Database connection string correct
- [ ] Migrations will run on deploy
- [ ] No hardcoded localhost URLs
- [ ] Ready to deploy: YES/NO
