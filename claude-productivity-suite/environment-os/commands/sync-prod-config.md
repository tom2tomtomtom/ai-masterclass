---
name: sync-prod-config
description: Safely sync production configuration to local development
---

# Sync Production Config

Safely pull production configuration and adapt it for local development.

## 1. Configuration Detection

### 1.1 Identify Config Sources
- Environment variables from production
- Configuration files (config/*.json, *.yml)
- Infrastructure as Code (Terraform, CloudFormation)
- Platform-specific configs (Heroku, Railway, Vercel)
- Secrets management (AWS Secrets, Vault)

### 1.2 Security Classification
```javascript
// Classify configuration by sensitivity
const configTypes = {
  public: [
    'API_BASE_URL',
    'APP_NAME',
    'FEATURE_FLAGS',
    'PUBLIC_KEY'
  ],
  
  replaceable: [
    'DATABASE_URL',     // Replace with local
    'REDIS_URL',        // Replace with local
    'SMTP_HOST',        // Replace with Mailtrap
    'STRIPE_KEY'        // Replace with test key
  ],
  
  sensitive: [
    'JWT_SECRET',       // Generate new
    'ENCRYPTION_KEY',   // Generate new
    'PRIVATE_KEY',      // Never sync
    'AWS_SECRET_KEY'    // Use local credentials
  ]
};
```

## 2. Pull Configuration

### 2.1 Platform-Specific Sync

#### Railway
```bash
# Export Railway config
railway variables --json > prod-config.json

# Parse and adapt
node sync-railway-config.js
```

#### Heroku
```bash
# Export Heroku config
heroku config --json -a your-app > prod-config.json

# Parse and adapt
node sync-heroku-config.js
```

#### Vercel
```bash
# Export Vercel env
vercel env pull .env.production

# Parse and adapt
node sync-vercel-config.js
```

### 2.2 Generic Cloud Sync
```javascript
// AWS Parameter Store
const AWS = require('aws-sdk');
const ssm = new AWS.SSM();

async function syncFromAWS() {
  const params = {
    Path: '/myapp/production/',
    Recursive: true,
    WithDecryption: true
  };
  
  const result = await ssm.getParametersByPath(params).promise();
  return result.Parameters.reduce((acc, param) => {
    const key = param.Name.split('/').pop();
    acc[key] = param.Value;
    return acc;
  }, {});
}
```

## 3. Transform for Local

### 3.1 Create Transformation Rules
```javascript
const transformRules = {
  // Database URLs
  DATABASE_URL: (prodUrl) => {
    const url = new URL(prodUrl);
    return `postgresql://dev:devpassword@localhost:5432/${url.pathname.slice(1)}_dev`;
  },
  
  // Redis URLs
  REDIS_URL: () => 'redis://localhost:6379',
  
  // External services to local/test versions
  STRIPE_SECRET_KEY: (prodKey) => 
    prodKey.startsWith('sk_live_') ? 'sk_test_YOUR_TEST_KEY' : prodKey,
  
  // Email services
  SMTP_HOST: () => 'smtp.mailtrap.io',
  SMTP_PORT: () => '2525',
  SMTP_USER: () => 'your_mailtrap_user',
  SMTP_PASS: () => 'your_mailtrap_pass',
  
  // Storage
  S3_BUCKET: (prodBucket) => `${prodBucket}-dev`,
  
  // URLs
  APP_URL: () => 'http://localhost:3000',
  API_URL: () => 'http://localhost:3000/api',
  
  // Secrets - generate new
  JWT_SECRET: () => require('crypto').randomBytes(32).toString('hex'),
  SESSION_SECRET: () => require('crypto').randomBytes(32).toString('hex')
};
```

### 3.2 Apply Transformations
```javascript
function transformConfig(prodConfig) {
  const localConfig = {};
  
  for (const [key, value] of Object.entries(prodConfig)) {
    if (transformRules[key]) {
      localConfig[key] = transformRules[key](value);
    } else if (configTypes.public.includes(key)) {
      localConfig[key] = value; // Keep as-is
    } else if (configTypes.sensitive.includes(key)) {
      localConfig[key] = `REPLACE_WITH_LOCAL_${key}`;
    } else {
      localConfig[key] = value; // Default: keep
    }
  }
  
  return localConfig;
}
```

## 4. Generate Local Config Files

### 4.1 Create .env.development
```bash
# Auto-generated from production config
# Generated: 2024-01-15T10:30:00Z
# Source: production (railway)

# === PUBLIC CONFIG (Synced) ===
APP_NAME=MyApp
API_VERSION=v1
FEATURE_FLAG_NEW_UI=true

# === LOCAL SERVICES (Adapted) ===
DATABASE_URL=postgresql://dev:devpassword@localhost:5432/myapp_dev
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200

# === EXTERNAL SERVICES (Test Mode) ===
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_TEST_SECRET
SENDGRID_API_KEY=SG.test_key_here

# === GENERATED SECRETS (Local Only) ===
JWT_SECRET=a7f3b8c9d2e1f4a5b6c7d8e9f0a1b2c3
SESSION_SECRET=f0e1d2c3b4a5968778695a4b3c2d1e0f

# === REQUIRES MANUAL UPDATE ===
# AWS_ACCESS_KEY_ID=<your_local_aws_key>
# AWS_SECRET_ACCESS_KEY=<your_local_aws_secret>
# GOOGLE_CLIENT_ID=<your_test_oauth_client>
# GOOGLE_CLIENT_SECRET=<your_test_oauth_secret>
```

### 4.2 Create config/development.json
```json
{
  "app": {
    "name": "MyApp",
    "version": "1.0.0",
    "environment": "development"
  },
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp_dev",
    "user": "dev",
    "password": "devpassword",
    "pool": {
      "min": 2,
      "max": 10
    }
  },
  "redis": {
    "host": "localhost",
    "port": 6379,
    "db": 0
  },
  "features": {
    "newUI": true,
    "betaFeatures": true,
    "debugMode": true
  }
}
```

## 5. Service Mocking

### 5.1 Create Mock Services Config
```yaml
# docker-compose.override.yml
version: '3.8'

services:
  # Mock S3 with MinIO
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  # Mock SES with MailHog
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025" # SMTP
      - "8025:8025" # Web UI

  # Mock external APIs with Mockoon
  mockoon:
    image: mockoon/cli
    ports:
      - "3001:3001"
    volumes:
      - ./mocks:/data
    command: --data /data/api-mocks.json

volumes:
  minio_data:
```

## 6. Validation

### 6.1 Config Validation Script
```javascript
// validate-config.js
const required = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'APP_URL'
];

const patterns = {
  DATABASE_URL: /^postgres(ql)?:\/\//,
  REDIS_URL: /^redis:\/\//,
  APP_URL: /^https?:\/\//,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

function validateConfig() {
  const missing = [];
  const invalid = [];
  
  // Check required
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  // Check patterns
  for (const [key, pattern] of Object.entries(patterns)) {
    if (process.env[key] && !pattern.test(process.env[key])) {
      invalid.push(`${key}: ${process.env[key]}`);
    }
  }
  
  return { missing, invalid };
}
```

## 7. Sync Report

### 7.1 Generate Sync Report
```markdown
# Production Config Sync Report

## Summary
- **Source**: Production (Railway)
- **Synced**: 2024-01-15T10:30:00Z
- **Total Variables**: 42
- **Synced**: 28
- **Adapted**: 10
- **Manual Required**: 4

## Adapted Services
| Service | Production | Local |
|---------|------------|-------|
| Database | PostgreSQL (AWS RDS) | PostgreSQL (Docker) |
| Cache | Redis (ElastiCache) | Redis (Docker) |
| Storage | S3 | MinIO |
| Email | SendGrid | MailHog |
| Payments | Stripe (Live) | Stripe (Test) |

## Security Changes
- ✅ Generated new JWT_SECRET
- ✅ Generated new SESSION_SECRET
- ✅ Replaced production API keys with test keys
- ⚠️  AWS credentials need manual configuration
- ⚠️  OAuth credentials need test app setup

## Required Actions
1. [ ] Update AWS credentials in .env.development
2. [ ] Create test OAuth apps and add credentials
3. [ ] Verify Stripe test webhook endpoint
4. [ ] Configure any custom integrations

## Validation Results
- ✅ All required variables present
- ✅ All URLs properly formatted
- ✅ No production secrets exposed
```

Save sync metadata for debugging.
