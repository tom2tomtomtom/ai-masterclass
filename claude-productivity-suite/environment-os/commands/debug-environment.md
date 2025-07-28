---
name: debug-environment
description: Debug "works on my machine" issues by comparing environments
---

# Debug Environment

Find and fix environment differences that cause "works on my machine" problems.

## 1. Environment Fingerprinting

### 1.1 Capture Local Environment
```javascript
const localEnv = {
  // System info
  os: {
    platform: process.platform,
    arch: process.arch,
    version: os.release(),
    memory: os.totalmem(),
    cpus: os.cpus().length
  },
  
  // Node/Runtime
  runtime: {
    node: process.version,
    npm: execSync('npm -v').toString().trim(),
    yarn: tryExec('yarn -v'),
    pnpm: tryExec('pnpm -v')
  },
  
  // Environment variables
  env: {
    ...process.env,
    // Mask sensitive values
    DATABASE_URL: maskUrl(process.env.DATABASE_URL),
    API_KEYS: '[MASKED]'
  },
  
  // Installed packages
  packages: require('./package.json').dependencies,
  
  // Running services
  services: await checkServices()
};
```

### 1.2 Capture Production Environment
```javascript
// From deployment platform or monitoring
const prodEnv = {
  platform: 'linux',
  runtime: {
    node: 'v18.17.0',
    memory: '2GB',
    cpu: '2 vCPU'
  },
  env: await fetchProdEnv(),
  packages: await fetchProdPackages()
};
```

## 2. Difference Detection

### 2.1 Compare Environments
```javascript
function compareEnvironments(local, prod) {
  const differences = {
    critical: [],    // Will definitely cause issues
    warning: [],     // Might cause issues
    info: []         // Good to know
  };
  
  // Node version mismatch
  if (local.runtime.node !== prod.runtime.node) {
    const localMajor = parseInt(local.runtime.node.slice(1));
    const prodMajor = parseInt(prod.runtime.node.slice(1));
    
    if (localMajor !== prodMajor) {
      differences.critical.push({
        type: 'node_version',
        local: local.runtime.node,
        prod: prod.runtime.node,
        fix: `Install Node ${prod.runtime.node} using nvm`
      });
    } else {
      differences.warning.push({
        type: 'node_minor_version',
        local: local.runtime.node,
        prod: prod.runtime.node
      });
    }
  }
  
  // Missing environment variables
  const prodKeys = Object.keys(prod.env);
  const localKeys = Object.keys(local.env);
  const missing = prodKeys.filter(k => !localKeys.includes(k));
  
  if (missing.length > 0) {
    differences.critical.push({
      type: 'missing_env_vars',
      vars: missing,
      fix: 'Add missing variables to .env'
    });
  }
  
  // Package version mismatches
  for (const [pkg, prodVersion] of Object.entries(prod.packages)) {
    const localVersion = local.packages[pkg];
    if (!localVersion) {
      differences.critical.push({
        type: 'missing_package',
        package: pkg,
        fix: `npm install ${pkg}@${prodVersion}`
      });
    } else if (localVersion !== prodVersion) {
      differences.warning.push({
        type: 'package_version_mismatch',
        package: pkg,
        local: localVersion,
        prod: prodVersion,
        fix: `npm install ${pkg}@${prodVersion}`
      });
    }
  }
  
  return differences;
}
```

## 3. Service Connectivity

### 3.1 Test All Connections
```javascript
async function testConnections() {
  const tests = [];
  
  // Database
  tests.push({
    name: 'Database',
    test: async () => {
      const client = new pg.Client(process.env.DATABASE_URL);
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
    }
  });
  
  // Redis
  tests.push({
    name: 'Redis',
    test: async () => {
      const redis = new Redis(process.env.REDIS_URL);
      await redis.ping();
      await redis.quit();
    }
  });
  
  // External APIs
  tests.push({
    name: 'External API',
    test: async () => {
      const response = await fetch(process.env.API_BASE_URL + '/health');
      if (!response.ok) throw new Error(`Status: ${response.status}`);
    }
  });
  
  // S3/Storage
  tests.push({
    name: 'S3 Storage',
    test: async () => {
      const s3 = new AWS.S3();
      await s3.headBucket({ Bucket: process.env.S3_BUCKET }).promise();
    }
  });
  
  // Run all tests
  const results = [];
  for (const { name, test } of tests) {
    try {
      await test();
      results.push({ name, status: 'OK', error: null });
    } catch (error) {
      results.push({ name, status: 'FAIL', error: error.message });
    }
  }
  
  return results;
}
```

## 4. Common Issues Detection

### 4.1 Port Conflicts
```javascript
async function checkPorts() {
  const commonPorts = {
    3000: 'Web app',
    5432: 'PostgreSQL',
    6379: 'Redis',
    9200: 'Elasticsearch',
    27017: 'MongoDB'
  };
  
  const conflicts = [];
  
  for (const [port, service] of Object.entries(commonPorts)) {
    if (await isPortInUse(port)) {
      const processInfo = await getProcessUsingPort(port);
      conflicts.push({
        port,
        expectedService: service,
        actualProcess: processInfo,
        fix: `Kill process: lsof -ti:${port} | xargs kill -9`
      });
    }
  }
  
  return conflicts;
}
```

### 4.2 SSL/TLS Issues
```javascript
function checkSSLIssues() {
  const issues = [];
  
  // Self-signed certificates
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    issues.push({
      type: 'ssl_disabled',
      severity: 'warning',
      description: 'TLS verification is disabled',
      fix: 'Use proper certificates or add to trust store'
    });
  }
  
  // Certificate errors
  if (process.env.DATABASE_URL?.includes('sslmode=require')) {
    issues.push({
      type: 'ssl_required',
      check: 'Ensure PostgreSQL has SSL certificates',
      fix: 'Add ?sslmode=disable for local development'
    });
  }
  
  return issues;
}
```

### 4.3 File System Differences
```javascript
function checkFileSystem() {
  const issues = [];
  
  // Case sensitivity
  if (process.platform === 'darwin' || process.platform === 'win32') {
    issues.push({
      type: 'case_insensitive_fs',
      description: 'Local filesystem is case-insensitive',
      risk: 'Import statements may work locally but fail in production',
      fix: 'Use exact case in all imports'
    });
  }
  
  // Path separators
  const wrongSeparators = findFilesWithWrongSeparators();
  if (wrongSeparators.length > 0) {
    issues.push({
      type: 'path_separators',
      files: wrongSeparators,
      fix: 'Use path.join() instead of hardcoded paths'
    });
  }
  
  // File permissions
  const executableFiles = findExecutableFiles();
  issues.push({
    type: 'file_permissions',
    files: executableFiles,
    note: 'Ensure these are executable in production'
  });
  
  return issues;
}
```

## 5. Docker Comparison

### 5.1 Container vs Local
```javascript
async function compareWithDocker() {
  // Run app in Docker
  const dockerOutput = await execAsync(`
    docker run --rm \
      -e NODE_ENV=production \
      -v $(pwd):/app \
      node:18-alpine \
      sh -c "cd /app && npm start"
  `);
  
  // Compare with local
  const localOutput = await execAsync('npm start');
  
  // Find differences
  const differences = diffOutputs(dockerOutput, localOutput);
  
  return {
    dockerWorks: !dockerOutput.error,
    localWorks: !localOutput.error,
    differences
  };
}
```

## 6. Fix Generators

### 6.1 Generate Fix Script
```bash
#!/bin/bash
# Auto-generated environment fixes

echo "🔧 Fixing environment issues..."

# Fix Node version
if ! node -v | grep -q "v18.17.0"; then
  echo "📦 Installing correct Node version..."
  nvm install 18.17.0
  nvm use 18.17.0
fi

# Install missing packages
npm install pg@8.11.0
npm install redis@4.6.0

# Fix environment variables
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  Created .env file - please update values"
fi

# Add missing variables
grep -q "REDIS_URL" .env || echo "REDIS_URL=redis://localhost:6379" >> .env
grep -q "DATABASE_URL" .env || echo "DATABASE_URL=postgresql://localhost/myapp_dev" >> .env

# Fix port conflicts
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5432 | xargs kill -9 2>/dev/null || true

# Start required services
docker-compose up -d db redis

echo "✅ Environment fixes applied!"
```

## 7. Debug Report

### 7.1 Generate Debug Report
```markdown
# Environment Debug Report

## 🔍 Differences Found

### Critical Issues (Must Fix)
1. **Node Version Mismatch**
   - Local: v16.14.0
   - Production: v18.17.0
   - Fix: `nvm install 18.17.0 && nvm use 18.17.0`

2. **Missing Environment Variables**
   - STRIPE_WEBHOOK_SECRET
   - SENDGRID_API_KEY
   - Fix: Add to .env file

### Warnings
1. **Package Version Differences**
   - express: 4.17.1 (local) vs 4.18.2 (prod)
   - Fix: `npm install express@4.18.2`

### Connection Tests
| Service | Status | Error |
|---------|--------|-------|
| Database | ✅ OK | - |
| Redis | ❌ FAIL | Connection refused |
| S3 | ✅ OK | - |
| External API | ⚠️ SLOW | 2.5s response time |

### Port Conflicts
- Port 6379: Used by unknown process (expected: Redis)
  Fix: `lsof -ti:6379 | xargs kill -9`

### File System Issues
- Case sensitivity: 3 files with potential issues
- Path separators: 2 files using backslashes

## 📋 Action Items
1. [ ] Update Node.js version
2. [ ] Add missing environment variables
3. [ ] Fix Redis connection
4. [ ] Update package versions
5. [ ] Fix import case sensitivity

## 🚀 Quick Fix
Run: `./fix-environment.sh`
```

Compare and save results for tracking.
