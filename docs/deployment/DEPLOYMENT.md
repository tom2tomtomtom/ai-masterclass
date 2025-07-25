# AI Masterclass - Production Deployment Guide

## 🚀 Deployment Overview

This guide provides comprehensive instructions for deploying the AI Masterclass application to production environments using Docker, Kubernetes, or traditional server deployments.

## 📋 Prerequisites

### System Requirements
- **CPU**: 4 cores minimum (8+ recommended)
- **Memory**: 8GB RAM minimum (16GB+ recommended)
- **Storage**: 50GB minimum (SSD recommended)
- **Network**: Stable internet connection with SSL certificate

### Software Dependencies
- **Docker**: 20.10+ and Docker Compose 2.0+
- **Node.js**: 18.x LTS
- **PostgreSQL**: 13+ 
- **Redis**: 7.0+ (optional, for caching)
- **Nginx**: 1.20+ (for reverse proxy)

### Environment Setup
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
```

## 🔧 Configuration

### 1. Environment Variables

Copy and customize the production environment file:

```bash
cp .env.production .env
```

**Critical Variables to Update:**
```bash
# Security (REQUIRED)
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
SESSION_SECRET=your-super-secure-session-secret-minimum-32-characters
DB_PASSWORD=strong-database-password

# Domain Configuration
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com

# Database
DB_HOST=your-db-host
DB_USER=ai_user_prod
DB_DATABASE=ai_masterclass_prod

# Email (for notifications)
SMTP_HOST=smtp.your-provider.com
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
```

### 2. SSL Certificates

Generate SSL certificates for HTTPS:

```bash
# Using Let's Encrypt (recommended)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# Or copy existing certificates
mkdir -p nginx/ssl
cp your-cert.pem nginx/ssl/cert.pem
cp your-private-key.pem nginx/ssl/private.key
```

## 🐳 Docker Deployment

### Quick Start with Docker Compose

1. **Build and start services:**
```bash
# Production deployment
./scripts/deploy.sh -e production -v v1.0.0

# Or manually
docker-compose up -d
```

2. **Initialize database:**
```bash
docker-compose exec app npm run db:init
docker-compose exec app npm run db:seed
```

3. **Verify deployment:**
```bash
curl https://your-domain.com/health
curl https://your-domain.com/health/database
```

### Service Architecture

The Docker deployment includes:

- **Application Server** (Node.js + Express)
- **Database** (PostgreSQL 15)
- **Cache** (Redis 7)
- **Reverse Proxy** (Nginx)
- **Monitoring** (Prometheus + Grafana)

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (1.24+)
- kubectl configured
- Ingress controller (Nginx)
- Cert-manager for SSL

### Deploy to Kubernetes

1. **Create namespace and secrets:**
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml

# Update secrets with real values
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/app.yaml
```

2. **Verify deployment:**
```bash
kubectl get pods -n ai-masterclass
kubectl logs -f deployment/ai-masterclass-app -n ai-masterclass
```

3. **Access services:**
```bash
kubectl port-forward service/ai-masterclass-service 5000:5000 -n ai-masterclass
```

### Scaling

Scale the application based on load:

```bash
# Scale to 5 replicas
kubectl scale deployment ai-masterclass-app --replicas=5 -n ai-masterclass

# Enable auto-scaling
kubectl autoscale deployment ai-masterclass-app \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n ai-masterclass
```

## 📊 Monitoring Setup

### Prometheus + Grafana

The deployment includes built-in monitoring:

1. **Access Grafana Dashboard:**
   - URL: `http://your-domain:3001`
   - Default: admin/admin (change immediately)

2. **Key Metrics Monitored:**
   - HTTP request duration and error rates
   - Database connection pool and query performance
   - Memory and CPU usage
   - Authentication attempts and failures
   - Course completion rates

3. **Alerts Configuration:**
   - High error rates (>10%)
   - Slow response times (>2 seconds)
   - Database connection issues
   - High memory usage (>90%)
   - SSL certificate expiration

### Application Metrics

Access metrics endpoints:
```bash
# Prometheus metrics
curl http://your-domain:5000/metrics

# Application summary
curl http://your-domain:5000/api/metrics
```

## 🔒 Security Checklist

### Pre-Deployment Security

- [ ] Change all default passwords and secrets
- [ ] Enable SSL/TLS encryption
- [ ] Configure firewall rules
- [ ] Set up fail2ban for brute force protection
- [ ] Enable security headers in Nginx
- [ ] Configure rate limiting
- [ ] Set up backup strategy

### Post-Deployment Security

- [ ] Monitor security logs
- [ ] Regular security updates
- [ ] Vulnerability scanning
- [ ] Access log analysis
- [ ] SSL certificate renewal automation

## 🔄 Backup and Recovery

### Database Backup

Automated daily backups:

```bash
# Manual backup
./scripts/backup.sh

# Scheduled backup (add to crontab)
0 2 * * * /path/to/ai-masterclass/scripts/backup.sh
```

### Disaster Recovery

1. **Database Restore:**
```bash
# Restore from backup
psql -h localhost -U ai_user_prod ai_masterclass_prod < backup-20240701.sql
```

2. **Application Recovery:**
```bash
# Rollback to previous version
./scripts/deploy.sh -e production -v v1.0.0-previous
```

## 🚀 Performance Optimization

### Database Optimization

1. **Connection Pooling:**
   - Default: 20 max connections
   - Adjust based on load: `DB_POOL_MAX=50`

2. **Query Optimization:**
   - 56 performance indexes pre-configured
   - Monitor slow queries in logs
   - Use `EXPLAIN ANALYZE` for optimization

### Application Performance

1. **Caching:**
   - Redis enabled by default
   - Cache TTL: 1 hour
   - Configure: `CACHE_TTL=3600`

2. **Rate Limiting:**
   - API: 1000 requests/15 minutes
   - Auth: 10 attempts/15 minutes
   - Adjust in `.env.production`

## 🔍 Troubleshooting

### Common Issues

1. **Application Won't Start:**
```bash
# Check logs
docker-compose logs app
kubectl logs deployment/ai-masterclass-app -n ai-masterclass

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Port conflicts
```

2. **Database Connection Errors:**
```bash
# Test database connectivity
docker-compose exec app node -e "
const db = require('./db');
db.query('SELECT 1').then(() => console.log('DB OK')).catch(console.error);
"
```

3. **High Memory Usage:**
```bash
# Monitor memory usage
docker stats
kubectl top pods -n ai-masterclass

# Restart if needed
docker-compose restart app
kubectl rollout restart deployment/ai-masterclass-app -n ai-masterclass
```

### Performance Issues

1. **Slow Response Times:**
   - Check database query performance
   - Monitor connection pool usage
   - Review application logs
   - Verify adequate resources

2. **High CPU Usage:**
   - Scale horizontally (add more instances)
   - Optimize database queries
   - Enable caching
   - Review error rates

## 📞 Support and Maintenance

### Health Monitoring

Automated health checks available at:
- `/health` - Basic application health
- `/health/database` - Database connection and performance
- `/metrics` - Prometheus metrics

### Log Management

Logs are structured and available in:
- **Docker**: `docker-compose logs`
- **Kubernetes**: `kubectl logs`
- **File System**: `/var/log/ai-masterclass/`

### Update Procedure

1. **Test in staging environment first**
2. **Create database backup**
3. **Deploy new version:**
```bash
./scripts/deploy.sh -e production -v v1.1.0
```
4. **Verify deployment**
5. **Monitor for issues**

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│  Nginx Proxy    │────│   Application   │
│   (External)    │    │  (Rate Limit +  │    │   (Node.js)     │
└─────────────────┘    │   SSL Term.)    │    │                 │
                       └─────────────────┘    └─────────────────┘
                                                       │
                              ┌─────────────────────────┼─────────────────────────┐
                              │                         │                         │
                              ▼                         ▼                         ▼
                    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │     Redis       │    │   Prometheus    │
                    │   (Database)    │    │   (Cache)       │    │  (Monitoring)   │
                    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Success Metrics

After deployment, verify these metrics:

- [ ] **Uptime**: >99.9%
- [ ] **Response Time**: <500ms average
- [ ] **Error Rate**: <1%
- [ ] **Database Queries**: <100ms average
- [ ] **Memory Usage**: <80%
- [ ] **CPU Usage**: <70%
- [ ] **SSL Grade**: A+ (test with SSL Labs)

---

For additional support or questions, refer to the main documentation in `CLAUDE.md` or contact the development team.