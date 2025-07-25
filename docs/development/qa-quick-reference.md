# 🚀 QA QUICK REFERENCE GUIDE
## Instant Commands & Procedures for AI Masterclass QA System

**⚡ Use this guide for instant access to all QA and deployment commands**  

---

## 🎯 ONE-COMMAND DEPLOYMENT

### 🚀 Deploy Everything (Full Pipeline)
```bash
# Complete automated deployment with all checks
./scripts/deploy.sh

# OR using npm script
npm run deploy
```

### 🧪 Test Everything
```bash
# Run complete test suite
npm test

# Run specific test types
npm run test:backend
npm run test:frontend
npm run test:e2e
npm run test:coverage
```

### 🔍 Check Everything
```bash
# Run complete error detection and fixes
./scripts/error-detection.sh

# Run quality gates validation
./scripts/quality-check.sh

# Run security audit
npm run audit:security
```

### Playwright Commands
```bash
# Installation and setup
npm init playwright@latest
npx playwright install
npx playwright install --with-deps

# Test execution
npx playwright test                    # Run all tests
npx playwright test --headed          # Run with browser visible
npx playwright test --debug           # Debug mode
npx playwright test --ui               # Interactive UI mode

# Specific test execution
npx playwright test tests/critical-path.spec.js
npx playwright test --grep "login"    # Run tests matching pattern
npx playwright test --project=chromium # Run specific browser

# Reports and debugging
npx playwright show-report            # Open HTML report
npx playwright show-trace [trace-file] # View trace
```

### Quality Assurance Commands
```bash
# Code quality
npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0
npx prettier --check .
npx prettier --write .

# Security scanning
npm audit --audit-level=high
npx snyk test
npx audit-ci

# Performance testing
npx lighthouse-ci autorun
npx bundlesize

# Accessibility testing
npx pa11y-ci --sitemap
```

---

## 📋 Quick Setup Checklist

### Initial Project Setup
```bash
# 1. Clone and setup project
git clone [REPO-URL]
cd [PROJECT-NAME]
npm install

# 2. Install QA tools
npm install -g @railway/cli
npm init playwright@latest
npm install --save-dev eslint prettier snyk lighthouse-ci

# 3. Setup Railway
railway login
railway create [PROJECT-NAME]
railway link

# 4. Configure environment
cp .env.example .env
railway variables set NODE_ENV=production
```

### File Structure Setup
```
project-root/
├── tests/
│   ├── critical-path.spec.js
│   ├── performance.spec.js
│   └── accessibility.spec.js
├── .github/workflows/
│   └── test-deploy.yml
├── railway.json
├── playwright.config.js
├── lighthouse-ci.json
└── qa-deployment-tracker.md
```

---

## ⚙️ Configuration Templates

### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build",
    "watchPatterns": ["src/**"]
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### playwright.config.js (Essential)
```javascript
module.exports = {
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
};
```

### package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:e2e": "npx playwright test",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write .",
    "security": "npm audit && npx snyk test",
    "performance": "npx lighthouse-ci autorun",
    "deploy": "railway up",
    "health-check": "curl -f $RAILWAY_URL/health"
  }
}
```

---

## 🚨 Emergency Procedures

### Deployment Failure Recovery
```bash
# 1. Check deployment status
railway status
railway logs

# 2. Quick health check
curl -f $RAILWAY_URL/health

# 3. Rollback if needed
railway deployments --json | jq -r '.[1].id'  # Get previous deployment
railway rollback [PREVIOUS-DEPLOYMENT-ID]

# 4. Verify rollback
sleep 30
curl -f $RAILWAY_URL/health
```

### Test Failure Investigation
```bash
# 1. Run specific failing test
npx playwright test --grep "[TEST-NAME]" --headed --debug

# 2. Check test artifacts
ls -la test-results/
npx playwright show-report

# 3. View traces
npx playwright show-trace test-results/[TEST-NAME]/trace.zip
```

### Performance Issues
```bash
# 1. Quick performance check
npx lighthouse $RAILWAY_URL --output=json > lighthouse-report.json

# 2. Analyze bundle size
npx bundlesize

# 3. Check for memory leaks
node --inspect app.js
```

---

## 🔍 Debugging Commands

### Railway Debugging
```bash
# View detailed logs
railway logs --follow

# Check environment variables
railway variables

# Service information
railway service

# Check database connection
railway connect [DATABASE-SERVICE]
```

### Playwright Debugging
```bash
# Debug specific test
npx playwright test tests/login.spec.js --debug

# Slow motion debugging
npx playwright test --headed --slowMo=1000

# Pause on failure
npx playwright test --headed --pause-on-failure

# Generate code
npx playwright codegen $BASE_URL
```

### Application Debugging
```bash
# Check application health
curl -v $RAILWAY_URL/health

# Test specific endpoints
curl -X POST $RAILWAY_URL/api/test -H "Content-Type: application/json" -d '{"test": true}'

# Monitor real-time logs
railway logs --follow | grep ERROR
```

---

## 📊 Quality Metrics Commands

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Performance Metrics
```bash
# Lighthouse audit
npx lighthouse $RAILWAY_URL --output=html --output-path=./lighthouse-report.html

# Core Web Vitals
npx lighthouse $RAILWAY_URL --only-categories=performance --output=json | jq '.audits["largest-contentful-paint"].displayValue'
```

### Security Audit
```bash
# npm vulnerabilities
npm audit --json > security-audit.json

# Snyk security scan
npx snyk test --json > snyk-report.json

# Check for outdated packages
npm outdated --json > outdated-packages.json
```

---

## 🔧 Common Fixes

### Railway Issues
```bash
# Fix build failures
rm -rf node_modules package-lock.json
npm install
railway up

# Environment variable issues
railway variables set NODE_ENV=production
railway variables set PORT=3000

# Service restart
railway service restart
```

### Test Issues
```bash
# Clear test cache
npx jest --clearCache
rm -rf node_modules/.cache

# Reset Playwright
npx playwright install --force
rm -rf test-results/
```

### Performance Issues
```bash
# Clear application cache
redis-cli FLUSHDB  # If using Redis
rm -rf .cache/     # Clear build cache

# Optimize images
npx imagemin src/images/* --out-dir=dist/images
```

---

## 📈 Monitoring URLs

### Production Monitoring
- **Health Check**: `$RAILWAY_URL/health`
- **Railway Dashboard**: `https://railway.app/dashboard`
- **Deployment Logs**: `railway logs --follow`

### Development Tools
- **Playwright Report**: `npx playwright show-report`
- **Lighthouse Report**: `./lighthouse-report.html`
- **Test Coverage**: `./coverage/lcov-report/index.html`

---

## 🚀 Deployment Pipeline

### Pre-deployment Checks
```bash
# 1. Quality checks
npm run lint
npm run test
npm run test:e2e
npm run security

# 2. Build verification
npm run build
npm start &  # Start server
sleep 10
curl -f http://localhost:3000/health
pkill node   # Stop server

# 3. Deploy
railway up
```

### Post-deployment Verification
```bash
# 1. Health check
curl -f $RAILWAY_URL/health

# 2. Full test suite
npx playwright test --config=playwright.prod.config.js

# 3. Performance validation
npx lighthouse $RAILWAY_URL --output=json | jq '.categories.performance.score'
```

---

## 📝 File Locations

### Configuration Files
- **Railway Config**: `./railway.json`
- **Playwright Config**: `./playwright.config.js`
- **CI/CD Pipeline**: `./.github/workflows/test-deploy.yml`
- **QA Tracker**: `./qa-deployment-tracker.md`

### Log Files
- **Railway Logs**: `railway logs`
- **Test Results**: `./test-results/`
- **Coverage Reports**: `./coverage/`
- **Performance Reports**: `./lighthouse-report.html`

### Environment Files
- **Local Environment**: `./.env`
- **Railway Variables**: `railway variables`
- **CI/CD Secrets**: GitHub repository settings

---

## 🎯 Success Criteria

### Deployment Success
- ✅ Health endpoint returns 200
- ✅ All critical paths accessible
- ✅ Performance score > 90
- ✅ No console errors
- ✅ SSL certificate valid

### Test Success
- ✅ All critical path tests pass
- ✅ Cross-browser compatibility verified
- ✅ Performance tests within limits
- ✅ Accessibility tests pass
- ✅ Security scans clean

### Quality Success
- ✅ Code coverage > 80%
- ✅ No ESLint errors
- ✅ No security vulnerabilities
- ✅ Lighthouse score > 90
- ✅ WCAG AA compliance

---

**⚡ Keep this file handy - it contains everything you need for rapid QA and deployment!**