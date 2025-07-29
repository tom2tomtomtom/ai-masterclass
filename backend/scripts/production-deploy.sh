#!/bin/bash

# Interactive AI Playground - Production Deployment Script
# 
# This script automates the deployment process for production environments
# Run with: bash scripts/production-deploy.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Interactive AI Playground"
DEPLOY_DIR="/var/www/ai-playground"
BACKUP_DIR="/backup/ai-playground"
LOG_FILE="deployment.log"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a $LOG_FILE
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
}

check_requirements() {
    log_info "Checking system requirements..."
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        log_error "Please do not run this script as root"
        exit 1
    fi
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18 or higher is required"
        exit 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_error "PostgreSQL is not installed"
        exit 1
    fi
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed. Run: npm install -g pm2"
        exit 1
    fi
    
    # Check Nginx
    if ! command -v nginx &> /dev/null; then
        log_error "Nginx is not installed"
        exit 1
    fi
    
    log_success "System requirements check passed"
}

check_environment() {
    log_info "Checking environment configuration..."
    
    # Check for required environment files
    if [ ! -f "backend/.env" ]; then
        log_error "Backend .env file not found"
        exit 1
    fi
    
    if [ ! -f "frontend/.env" ]; then
        log_error "Frontend .env file not found"
        exit 1
    fi
    
    # Check for critical environment variables
    source backend/.env
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL not set in backend/.env"
        exit 1
    fi
    
    if [ -z "$OPENAI_API_KEY" ]; then
        log_warning "OPENAI_API_KEY not set - OpenAI features will be disabled"
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        log_error "JWT_SECRET not set in backend/.env"
        exit 1
    fi
    
    log_success "Environment configuration check passed"
}

create_backup() {
    log_info "Creating backup before deployment..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"
    
    # Create backup directory
    sudo mkdir -p $BACKUP_PATH
    
    # Backup database
    if pg_dump -U postgres ai_masterclass > "$BACKUP_PATH/database.sql" 2>/dev/null; then
        log_success "Database backup created"
    else
        log_warning "Database backup failed - continuing anyway"
    fi
    
    # Backup current application (if exists)
    if [ -d "$DEPLOY_DIR" ]; then
        sudo tar -czf "$BACKUP_PATH/application.tar.gz" -C $DEPLOY_DIR . 2>/dev/null || true
        log_success "Application backup created"
    fi
    
    # Backup configuration files
    sudo cp -r /etc/nginx/sites-available "$BACKUP_PATH/nginx-config" 2>/dev/null || true
    
    log_success "Backup completed at $BACKUP_PATH"
}

install_dependencies() {
    log_info "Installing project dependencies..."
    
    # Backend dependencies
    cd backend
    log_info "Installing backend dependencies..."
    npm ci --production
    
    # Frontend dependencies and build
    cd ../frontend
    log_info "Installing frontend dependencies..."
    npm ci
    
    log_info "Building frontend for production..."
    npm run build
    
    cd ..
    log_success "Dependencies installed and frontend built"
}

run_tests() {
    log_info "Running test suite..."
    
    cd backend
    
    # Set test environment
    export NODE_ENV=test
    
    # Run critical tests only for deployment
    if npm test -- --testPathPattern="unit|integration" --verbose 2>&1 | tee -a ../$LOG_FILE; then
        log_success "Critical tests passed"
    else
        log_error "Tests failed - deployment aborted"
        exit 1
    fi
    
    cd ..
}

setup_database() {
    log_info "Setting up database..."
    
    cd backend
    
    # Run database migrations
    if npm run db:migrate 2>&1 | tee -a ../$LOG_FILE; then
        log_success "Database migrations completed"
    else
        log_error "Database migration failed"
        exit 1
    fi
    
    # Seed initial data if needed
    if [ "$1" = "--seed" ]; then
        log_info "Seeding database with initial data..."
        npm run db:seed 2>&1 | tee -a ../$LOG_FILE || true
        npm run db:seed:templates 2>&1 | tee -a ../$LOG_FILE || true
        log_success "Database seeding completed"
    fi
    
    cd ..
}

deploy_application() {
    log_info "Deploying application files..."
    
    # Create deployment directory
    sudo mkdir -p $DEPLOY_DIR
    
    # Copy backend files
    sudo cp -r backend/* $DEPLOY_DIR/backend/
    sudo cp backend/.env $DEPLOY_DIR/backend/
    
    # Copy frontend build
    sudo mkdir -p $DEPLOY_DIR/frontend
    sudo cp -r frontend/build/* $DEPLOY_DIR/frontend/
    
    # Set proper permissions
    sudo chown -R $USER:www-data $DEPLOY_DIR
    sudo chmod -R 755 $DEPLOY_DIR
    
    log_success "Application files deployed"
}

configure_pm2() {
    log_info "Configuring PM2 process manager..."
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'ai-playground-backend',
    script: '$DEPLOY_DIR/backend/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '$DEPLOY_DIR/logs/err.log',
    out_file: '$DEPLOY_DIR/logs/out.log',
    log_file: '$DEPLOY_DIR/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    kill_timeout: 3000,
    restart_delay: 4000,
    max_restarts: 10
  }]
};
EOL
    
    # Create logs directory
    sudo mkdir -p $DEPLOY_DIR/logs
    sudo chown -R $USER:www-data $DEPLOY_DIR/logs
    
    # Copy ecosystem file to deployment directory
    sudo cp ecosystem.config.js $DEPLOY_DIR/
    
    log_success "PM2 configuration created"
}

configure_nginx() {
    log_info "Configuring Nginx..."
    
    # Get domain from environment or use default
    DOMAIN=${DOMAIN:-"localhost"}
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/ai-playground > /dev/null << EOL
server {
    listen 80;
    server_name $DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    # SSL configuration (update paths as needed)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com;";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml+rss application/json;
    
    # Frontend static files
    location / {
        root $DEPLOY_DIR/frontend;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
EOL
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/ai-playground /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    if sudo nginx -t; then
        log_success "Nginx configuration is valid"
    else
        log_error "Nginx configuration is invalid"
        exit 1
    fi
}

start_services() {
    log_info "Starting services..."
    
    cd $DEPLOY_DIR
    
    # Stop existing PM2 processes
    pm2 delete ai-playground-backend 2>/dev/null || true
    
    # Start PM2 application
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u $USER --hp $HOME --silent || true
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    log_success "Services started successfully"
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    # Wait for application to start
    sleep 10
    
    # Check PM2 status
    if pm2 status | grep -q "ai-playground-backend.*online"; then
        log_success "PM2 process is running"
    else
        log_error "PM2 process failed to start"
        pm2 logs ai-playground-backend --lines 20
        exit 1
    fi
    
    # Check application health
    if curl -f -s http://localhost:5000/health > /dev/null; then
        log_success "Application health check passed"
    else
        log_error "Application health check failed"
        exit 1
    fi
    
    # Check Nginx status
    if sudo systemctl is-active --quiet nginx; then
        log_success "Nginx is running"
    else
        log_error "Nginx is not running"
        exit 1
    fi
    
    # Test frontend access
    if curl -f -s http://localhost/ > /dev/null; then
        log_success "Frontend is accessible"
    else
        log_warning "Frontend may not be accessible (check SSL configuration)"
    fi
    
    log_success "Deployment verification completed"
}

cleanup() {
    log_info "Cleaning up deployment files..."
    
    # Remove build artifacts
    rm -f ecosystem.config.js
    
    # Keep only last 5 backups
    find $BACKUP_DIR -maxdepth 1 -type d -name "20*" | sort -r | tail -n +6 | xargs sudo rm -rf 2>/dev/null || true
    
    log_success "Cleanup completed"
}

show_deployment_info() {
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo "=================================="
    echo "$PROJECT_NAME - Deployment Summary"
    echo "=================================="
    echo "📍 Deployment Directory: $DEPLOY_DIR"
    echo "🔧 Process Manager: PM2"
    echo "🌐 Web Server: Nginx"
    echo "📊 Application Status: $(pm2 status | grep ai-playground-backend | awk '{print $10}')"
    echo "📱 Frontend URL: https://$DOMAIN"
    echo "🔌 API URL: https://$DOMAIN/api"
    echo "📋 Health Check: https://$DOMAIN/health"
    echo ""
    echo "Useful Commands:"
    echo "  View logs: pm2 logs ai-playground-backend"
    echo "  Restart app: pm2 restart ai-playground-backend"
    echo "  Monitor app: pm2 monit"
    echo "  Nginx logs: sudo tail -f /var/log/nginx/error.log"
    echo ""
    echo "Configuration files:"
    echo "  PM2 config: $DEPLOY_DIR/ecosystem.config.js"
    echo "  Nginx config: /etc/nginx/sites-available/ai-playground"
    echo "  Application logs: $DEPLOY_DIR/logs/"
    echo ""
    log_success "Deployment completed! 🚀"
}

# Main deployment process
main() {
    echo "🚀 Starting $PROJECT_NAME Production Deployment"
    echo "=============================================="
    echo ""
    
    # Parse command line arguments
    SKIP_TESTS=false
    SEED_DB=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --seed)
                SEED_DB=true
                shift
                ;;
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-tests     Skip running tests"
                echo "  --seed          Seed database with initial data"
                echo "  --domain DOMAIN Set domain name for Nginx config"
                echo "  -h, --help      Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Confirm deployment
    echo "This will deploy the Interactive AI Playground to production."
    echo "Domain: ${DOMAIN:-localhost}"
    echo "Skip tests: $SKIP_TESTS"
    echo "Seed database: $SEED_DB"
    echo ""
    read -p "Continue with deployment? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    # Start deployment
    echo "$(date): Starting deployment" > $LOG_FILE
    
    check_requirements
    check_environment
    create_backup
    install_dependencies
    
    if [ "$SKIP_TESTS" != true ]; then
        run_tests
    else
        log_warning "Skipping tests as requested"
    fi
    
    if [ "$SEED_DB" = true ]; then
        setup_database --seed
    else
        setup_database
    fi
    
    deploy_application
    configure_pm2
    configure_nginx
    start_services
    verify_deployment
    cleanup
    show_deployment_info
}

# Error handling
trap 'log_error "Deployment failed at line $LINENO. Check $LOG_FILE for details."; exit 1' ERR

# Run main function
main "$@"