---
name: setup-environment
description: Automatically detect and set up complete development environment
---

# Setup Environment

Automatically detect all dependencies and create a complete development environment that mirrors production.

## 1. Environment Detection

### 1.1 Analyze Project Structure
- Detect framework (Next.js, Express, Rails, Django, etc.)
- Identify package managers (npm, yarn, pnpm, pip, bundler)
- Find configuration files (package.json, Gemfile, requirements.txt)
- Detect database requirements from code/config
- Identify external services (Redis, Elasticsearch, etc.)

### 1.2 Dependency Analysis
```javascript
// Scan for database connections
const dbTypes = {
  postgres: /postgres|pg|postgresql/i,
  mysql: /mysql|mariadb/i,
  mongodb: /mongo|mongoose/i,
  redis: /redis|ioredis/i,
  sqlite: /sqlite/i
};

// Scan for external services
const services = {
  elasticsearch: /elasticsearch|elastic/i,
  rabbitmq: /amqp|rabbitmq/i,
  kafka: /kafka/i,
  s3: /aws-sdk.*s3|@aws-sdk\/client-s3/i
};
```

## 2. Generate Docker Configuration

### 2.1 Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
      - redis
    command: npm run dev

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=dev
      - POSTGRES_PASSWORD=devpassword
      - POSTGRES_DB=app_development
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 2.2 Generate Dockerfile
```dockerfile
# Auto-detected: Node.js application
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Build if needed
RUN npm run build || true

EXPOSE 3000

CMD ["npm", "start"]
```

## 3. Environment Variables

### 3.1 Generate .env.example
```bash
# Database Configuration
DATABASE_URL=postgresql://dev:devpassword@localhost:5432/app_development
# Description: PostgreSQL connection string
# Required: Yes

# Redis Configuration  
REDIS_URL=redis://localhost:6379
# Description: Redis connection for caching and queues
# Required: Yes

# Application Settings
NODE_ENV=development
# Description: Environment mode (development/staging/production)
# Required: Yes

PORT=3000
# Description: Application port
# Required: No (default: 3000)

# External Services
AWS_ACCESS_KEY_ID=your_access_key_here
# Description: AWS credentials for S3 access
# Required: Only if using S3

# Authentication
JWT_SECRET=generate_a_secure_random_string_here
# Description: Secret key for JWT token signing
# Required: Yes
# Generate with: openssl rand -base64 32
```

### 3.2 Create .env.local
Copy .env.example to .env.local with development values

## 4. Local SSL Setup (if needed)

### 4.1 Generate Local Certificates
```bash
# Create local CA
openssl genrsa -out local-ca.key 2048
openssl req -x509 -new -nodes -key local-ca.key -sha256 -days 365 -out local-ca.pem

# Create certificate for localhost
openssl req -new -nodes -newkey rsa:2048 -keyout localhost.key -out localhost.csr
openssl x509 -req -in localhost.csr -CA local-ca.pem -CAkey local-ca.key -CAcreateserial -out localhost.crt -days 365 -sha256
```

## 5. Development Scripts

### 5.1 Create setup.sh
```bash
#!/bin/bash

echo "🚀 Setting up development environment..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop."
    exit 1
fi

# Copy environment files
cp .env.example .env.local

# Start services
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
until docker-compose exec -T db pg_isready; do
  sleep 1
done

# Run migrations
echo "📊 Running database migrations..."
npm run migrate || echo "No migrations found"

# Seed database
echo "🌱 Seeding database..."
npm run seed || echo "No seed script found"

echo "✅ Environment ready!"
echo "🌐 Application: http://localhost:3000"
echo "🗄️  Database: postgresql://localhost:5432/app_development"
echo "📦 Redis: redis://localhost:6379"
```

## 6. VS Code Configuration

### 6.1 Create .vscode/launch.json
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Application",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/index.js",
      "envFile": "${workspaceFolder}/.env.local",
      "console": "integratedTerminal"
    }
  ]
}
```

## 7. Health Check Endpoint

### 7.1 Create health check
```javascript
app.get('/health', async (req, res) => {
  const checks = {
    app: 'ok',
    database: 'checking',
    redis: 'checking',
    timestamp: new Date().toISOString()
  };

  // Check database
  try {
    await db.raw('SELECT 1');
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
  }

  // Check Redis
  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch (error) {
    checks.redis = 'error';
  }

  const allOk = Object.values(checks).every(v => v === 'ok' || v.includes('T'));
  res.status(allOk ? 200 : 503).json(checks);
});
```

## 8. Generate Setup Report

Create `environment-setup-report.md`:
```markdown
# Environment Setup Complete ✅

## Services Configured
- ✅ Node.js application (v18)
- ✅ PostgreSQL database (v15)
- ✅ Redis cache (v7)
- ✅ Docker Compose configuration
- ✅ Environment variables

## Quick Start
\`\`\`bash
# Start all services
docker-compose up

# Or run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

## Access Points
- Application: http://localhost:3000
- Database: postgresql://dev:devpassword@localhost:5432/app_development
- Redis: redis://localhost:6379

## Next Steps
1. Copy `.env.example` to `.env.local`
2. Update environment variables
3. Run `./setup.sh`
4. Start developing!
```

Save detection results for other commands to use.
