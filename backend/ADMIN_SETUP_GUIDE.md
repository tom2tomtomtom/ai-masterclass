# Interactive AI Playground - Admin Setup Guide

## 🔧 System Requirements

### Server Requirements

**Minimum Specifications**:
- CPU: 4 cores, 2.5GHz
- RAM: 8GB
- Storage: 50GB SSD
- Network: 100Mbps
- OS: Ubuntu 20.04+ or CentOS 8+

**Recommended for Production**:
- CPU: 8 cores, 3.0GHz
- RAM: 16GB
- Storage: 100GB SSD
- Network: 1Gbps
- OS: Ubuntu 22.04 LTS

### Software Dependencies

**Required Software**:
- Node.js 18+ (LTS recommended)
- PostgreSQL 14+
- Redis 6+
- Nginx (for production)
- PM2 (for process management)

**Development Tools**:
- Git
- Docker & Docker Compose
- NPM or Yarn package manager

## 🚀 Installation Guide

### 1. Environment Setup

#### Clone Repository
```bash
git clone https://github.com/your-org/ai-masterclass.git
cd ai-masterclass
```

#### Install System Dependencies (Ubuntu)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

#### Install Project Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Database Configuration

#### PostgreSQL Setup
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE ai_masterclass;
CREATE USER ai_admin WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE ai_masterclass TO ai_admin;

# Enable required extensions
\c ai_masterclass
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

\q
```

#### Supabase Configuration (Alternative)
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Initialize Supabase project
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Environment Configuration

#### Backend Environment (.env)
```env
# Database Configuration
DATABASE_URL=postgresql://ai_admin:secure_password_here@localhost:5432/ai_masterclass
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider API Keys
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Security Configuration
JWT_SECRET=your-jwt-secret-key
BCRYPT_ROUNDS=12

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Server Configuration
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
PROMETHEUS_ENABLED=true
LOG_LEVEL=info
```

#### Frontend Environment (.env)
```env
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_COMMUNITY=true
REACT_APP_DEBUG_MODE=false

# Third-party Integrations
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

### 4. Database Schema Migration

#### Run Initial Migration
```bash
cd backend

# Initialize database schema
npm run db:init

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Seed template library
npm run db:seed:templates
```

#### Verify Database Setup
```bash
# Test database connection
npm run db:test

# Validate schema integrity
npm run db:validate
```

### 5. AI Provider Setup

#### OpenAI Configuration
1. Visit [OpenAI API Platform](https://platform.openai.com/api-keys)
2. Create organization account
3. Add billing information
4. Generate API key with appropriate permissions
5. Set usage limits and monitoring alerts

#### Anthropic Setup
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create account and verify identity
3. Purchase credits or set up billing
4. Generate API key
5. Configure usage monitoring

#### Google AI Setup
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Create Google Cloud project
3. Enable Generative AI API
4. Create service account and generate key
5. Set up quota monitoring

### 6. Security Configuration

#### SSL/TLS Setup
```bash
# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### Firewall Configuration
```bash
# Enable UFW firewall
sudo ufw enable

# Allow necessary ports
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Deny direct access to backend port
sudo ufw deny 5000/tcp
```

#### Security Headers (Nginx)
```nginx
# /etc/nginx/sites-available/ai-playground
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";

    # Frontend
    location / {
        root /var/www/ai-playground/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Application Deployment

#### Build Frontend
```bash
cd frontend
npm run build

# Copy build files to web server
sudo cp -r build/* /var/www/ai-playground/frontend/
sudo chown -R www-data:www-data /var/www/ai-playground/
```

#### Configure PM2 Process Manager
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ai-playground-backend',
    script: './backend/index.js',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

#### Start Services
```bash
# Start PM2 process
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Start Redis
sudo systemctl enable redis
sudo systemctl start redis
```

## 📊 Monitoring and Maintenance

### 1. Application Monitoring

#### PM2 Monitoring
```bash
# View process status
pm2 status

# View logs
pm2 logs ai-playground-backend

# Monitor resources
pm2 monit

# Restart application
pm2 restart ai-playground-backend
```

#### System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop netstat-net-tools

# Check system resources
htop
iotop
netstat -tulpn
```

### 2. Database Maintenance

#### Regular Backups
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U ai_admin -h localhost ai_masterclass > "/backup/ai_masterclass_$DATE.sql"

# Keep only last 7 days of backups
find /backup -name "ai_masterclass_*.sql" -mtime +7 -delete
```

#### Performance Monitoring
```sql
-- Check database performance
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation 
FROM pg_stats 
WHERE tablename IN ('prompt_templates', 'template_responses', 'users');

-- Analyze slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 3. Log Management

#### Configure Log Rotation
```bash
# /etc/logrotate.d/ai-playground
/var/log/ai-playground/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload ai-playground-backend
    endscript
}
```

#### Centralized Logging (Optional)
```bash
# Install ELK Stack or use cloud logging
# Example with Filebeat
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.0.0-amd64.deb
sudo dpkg -i filebeat-8.0.0-amd64.deb
```

### 4. Security Auditing

#### Regular Security Updates
```bash
#!/bin/bash
# security-update.sh
sudo apt update
sudo apt list --upgradable
sudo apt upgrade -y

# Update Node.js dependencies
cd /path/to/ai-playground
npm audit
npm audit fix

# Check for security vulnerabilities
npm audit --audit-level high
```

#### SSL Certificate Monitoring
```bash
# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -noout -dates

# Test SSL configuration
curl -I https://your-domain.com
```

## 🔧 Configuration Management

### 1. User Management

#### Admin User Creation
```javascript
// Create admin account via script
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@your-domain.com',
    password: 'secure-admin-password',
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      name: 'System Administrator'
    }
  });
  
  if (error) {
    console.error('Error creating admin:', error);
    return;
  }
  
  console.log('Admin user created:', data.user.email);
}
```

#### Role-Based Access Control
```sql
-- Create roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    role VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Grant admin permissions
INSERT INTO user_roles (user_id, role, permissions) 
VALUES (
    'admin-user-uuid',
    'admin',
    '{"manage_users": true, "manage_templates": true, "view_analytics": true}'
);
```

### 2. System Configuration

#### Rate Limiting Configuration
```javascript
// backend/config/rateLimits.js
module.exports = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    message: 'Too many requests, please try again later'
  },
  aiGeneration: {
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'AI generation rate limit exceeded'
  },
  comparison: {
    windowMs: 30 * 60 * 1000,
    max: 10,
    message: 'Comparison rate limit exceeded'
  }
};
```

#### Feature Flags
```javascript
// backend/config/features.js
module.exports = {
  enableCommunitySharing: process.env.ENABLE_COMMUNITY === 'true',
  enableAdvancedAnalytics: process.env.ENABLE_ANALYTICS === 'true',
  maxTemplatesPerUser: parseInt(process.env.MAX_TEMPLATES_PER_USER) || 50,
  maxTokensPerRequest: parseInt(process.env.MAX_TOKENS_PER_REQUEST) || 4000
};
```

## 🚨 Troubleshooting Guide

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U ai_admin -d ai_masterclass -h localhost

# Check connection limits
SELECT * FROM pg_stat_activity;
```

#### High Memory Usage
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Restart PM2 processes
pm2 restart all

# Clear Redis cache if needed
redis-cli FLUSHALL
```

#### SSL Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew --force

# Check certificate chain
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

#### API Rate Limiting
```bash
# Check Redis for rate limit counters
redis-cli
KEYS *rate-limit*

# Reset rate limits for testing
FLUSHALL
```

### Performance Optimization

#### Database Optimization
```sql
-- Analyze and vacuum tables
ANALYZE prompt_templates;
VACUUM ANALYZE template_responses;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_templates_industry ON prompt_templates(industry_category);
CREATE INDEX CONCURRENTLY idx_responses_created_at ON template_responses(created_at);
```

#### Application Optimization
```javascript
// Increase PM2 instances based on CPU cores
pm2 scale ai-playground-backend +2

// Enable cluster mode
pm2 start ecosystem.config.js --env production
```

## 📈 Scaling Considerations

### Horizontal Scaling

#### Load Balancer Configuration (Nginx)
```nginx
upstream ai_playground_backend {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    server 127.0.0.1:5003;
}

server {
    location /api/ {
        proxy_pass http://ai_playground_backend;
        # ... other proxy settings
    }
}
```

#### Database Scaling
```bash
# Read replicas for PostgreSQL
# Configure streaming replication
# Use connection pooling (PgBouncer)
sudo apt install pgbouncer
```

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Optimize Node.js heap size
- Tune PostgreSQL parameters
- Configure Redis memory limits

## 🔄 Backup and Recovery

### Automated Backup Script
```bash
#!/bin/bash
# complete-backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/$DATE"
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U ai_admin ai_masterclass > "$BACKUP_DIR/database.sql"

# Application files backup
tar -czf "$BACKUP_DIR/application.tar.gz" /path/to/ai-playground

# Configuration backup
cp -r /etc/nginx/sites-available "$BACKUP_DIR/nginx-config"
cp /path/to/ai-playground/.env "$BACKUP_DIR/env-config"

# Upload to cloud storage (optional)
aws s3 sync $BACKUP_DIR s3://your-backup-bucket/$DATE/

echo "Backup completed: $BACKUP_DIR"
```

### Recovery Procedures
```bash
# Database recovery
psql -U ai_admin -d ai_masterclass < /backup/database.sql

# Application recovery
tar -xzf /backup/application.tar.gz -C /

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks

**Daily**:
- Check system logs for errors
- Monitor disk space and memory usage
- Verify backup completion
- Review API usage metrics

**Weekly**:
- Update security patches
- Analyze database performance
- Review user activity reports
- Clean up old log files

**Monthly**:
- Full system backup verification
- Performance optimization review
- Security audit
- Capacity planning assessment

### Emergency Contacts

- **System Administrator**: admin@your-domain.com
- **Database Administrator**: dba@your-domain.com
- **Security Team**: security@your-domain.com
- **On-call Support**: +1-XXX-XXX-XXXX

---

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Server specifications meet requirements
- [ ] All dependencies installed and configured
- [ ] Database schema migrated successfully
- [ ] AI provider API keys configured and tested
- [ ] Environment variables set correctly
- [ ] SSL certificates installed and verified
- [ ] Firewall rules configured
- [ ] Backup procedures tested

### Post-deployment
- [ ] Application starts successfully
- [ ] All API endpoints responding
- [ ] Database connections working
- [ ] AI providers accessible
- [ ] Frontend loading correctly
- [ ] User authentication working
- [ ] Monitoring systems active
- [ ] Logs being written correctly

### Production Verification
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Backup and recovery tested
- [ ] Documentation updated
- [ ] Team training completed

---

**Need Support?** Contact our technical team at tech-support@ai-masterclass.com

**Version**: 1.0.0 | **Last Updated**: July 2024