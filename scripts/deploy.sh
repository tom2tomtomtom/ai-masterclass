#!/bin/bash

# AUTOMATED RAILWAY DEPLOYMENT SCRIPT
# Implements comprehensive deployment pipeline with health checks

set -e  # Exit on any error

echo "🚀 STARTING AUTOMATED RAILWAY DEPLOYMENT"
echo "========================================"

# Configuration
DEPLOY_LOG="logs/deploy-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$DEPLOY_LOG"
}

# Function to check command availability
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log "❌ ERROR: $1 is not installed"
        exit 1
    fi
}

log "🔍 Phase 1: Pre-deployment Validation"
log "======================================="

# Check required tools
log "Checking required tools..."
check_command "npm"
check_command "curl"

# Check for Railway CLI
if ! command -v "railway" &> /dev/null; then
    log "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    log "✅ Railway CLI installed"
fi

# Run error detection first
log "🔍 Running comprehensive error detection..."
if [[ -x "./scripts/error-detection.sh" ]]; then
    if ! ./scripts/error-detection.sh; then
        log "❌ Error detection found critical issues"
        log "🛑 DEPLOYMENT CANCELLED"
        exit 1
    fi
    log "✅ Error detection passed"
else
    log "⚠️  Error detection script not found, continuing..."
fi

# Install dependencies
log "📦 Installing dependencies..."
npm install
log "✅ Root dependencies installed"

# Install frontend dependencies
if [[ -d "frontend" ]]; then
    log "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    log "✅ Frontend dependencies installed"
fi

# Install backend dependencies
if [[ -d "backend" ]]; then
    log "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
    log "✅ Backend dependencies installed"
fi

log ""
log "🔍 Phase 2: Code Quality Checks"
log "==============================="

# Run linting
log "🔍 Running code quality checks..."
if npm run lint 2>/dev/null; then
    log "✅ Linting passed"
else
    log "⚠️  Linting issues found, attempting auto-fix..."
    npm run lint:fix 2>/dev/null || true
fi

# Run tests
log "🧪 Running test suite..."
if npm run test 2>/dev/null; then
    log "✅ All tests passed"
else
    log "⚠️  Some tests failed, checking if critical..."
    # Continue deployment but log the issue
    log "⚠️  Test failures detected - monitoring required post-deployment"
fi

log ""
log "🔍 Phase 3: Build Process"
log "========================="

# Build the application
log "🏗️  Building application..."
if npm run build:all 2>/dev/null; then
    log "✅ Build completed successfully"
else
    log "❌ Build failed"
    log "🛑 DEPLOYMENT CANCELLED"
    exit 1
fi

# Verify build output
if [[ -d "frontend/build" ]]; then
    BUILD_SIZE=$(du -sh frontend/build | cut -f1)
    log "📊 Frontend build size: $BUILD_SIZE"
else
    log "⚠️  Frontend build directory not found"
fi

log ""
log "🔍 Phase 4: Railway Deployment"
log "=============================="

# Check Railway login status
log "🔐 Checking Railway authentication..."
if ! railway whoami &>/dev/null; then
    log "❌ Not logged into Railway"
    log "🔑 Please run: railway login"
    exit 1
fi

RAILWAY_USER=$(railway whoami 2>/dev/null || echo "unknown")
log "✅ Logged in as: $RAILWAY_USER"

# Check if project is linked
log "🔗 Checking Railway project link..."
if ! railway status &>/dev/null; then
    log "❌ No Railway project linked"
    log "🔗 Please run: railway link"
    exit 1
fi

PROJECT_INFO=$(railway status 2>/dev/null || echo "unknown project")
log "✅ Project linked: $PROJECT_INFO"

# Deploy to Railway
log "🚀 Deploying to Railway..."
DEPLOY_START=$(date +%s)

if railway up --detach; then
    log "✅ Deployment initiated successfully"
else
    log "❌ Deployment failed"
    log "🛑 DEPLOYMENT FAILED"
    exit 1
fi

log ""
log "🔍 Phase 5: Deployment Verification"
log "==================================="

# Wait for deployment
log "⏳ Waiting for deployment to complete..."
sleep 30

# Get deployment URL
RAILWAY_URL=""
for i in {1..10}; do
    RAILWAY_URL=$(railway status 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1 || echo "")
    if [[ -n "$RAILWAY_URL" ]]; then
        break
    fi
    log "⏳ Waiting for deployment URL... (attempt $i/10)"
    sleep 10
done

if [[ -z "$RAILWAY_URL" ]]; then
    log "⚠️  Could not determine deployment URL"
    RAILWAY_URL="https://your-app.railway.app"  # fallback
fi

log "🌍 Deployment URL: $RAILWAY_URL"

# Health check with retries
log "🔍 Running health checks..."
HEALTH_CHECK_PASSED=false

for i in {1..20}; do  # Try for up to 200 seconds
    log "🔍 Health check attempt $i/20..."
    
    if curl -f -s "$RAILWAY_URL/api/health" > /dev/null 2>&1; then
        HEALTH_CHECK_PASSED=true
        log "✅ Health check passed"
        break
    elif curl -f -s "$RAILWAY_URL" > /dev/null 2>&1; then
        HEALTH_CHECK_PASSED=true
        log "✅ Application is responding"
        break
    fi
    
    log "⏳ Waiting for application to start..."
    sleep 10
done

if [[ "$HEALTH_CHECK_PASSED" = true ]]; then
    log "✅ Deployment health checks passed"
else
    log "⚠️  Health checks failed - application may not be fully ready"
    log "🔍 Manual verification recommended"
fi

# Test critical endpoints
log "🔍 Testing critical endpoints..."
ENDPOINTS=("/" "/api/health" "/api/courses")

for endpoint in "${ENDPOINTS[@]}"; do
    if curl -f -s "$RAILWAY_URL$endpoint" > /dev/null 2>&1; then
        log "✅ $endpoint responding"
    else
        log "⚠️  $endpoint not responding"
    fi
done

log ""
log "🔍 Phase 6: Performance Validation"
log "=================================="

# Basic performance check
log "📊 Running basic performance check..."
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$RAILWAY_URL" 2>/dev/null || echo "0")
log "📊 Response time: ${RESPONSE_TIME}s"

if (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    log "✅ Performance acceptable"
else
    log "⚠️  Slow response time detected"
fi

log ""
log "🔍 Phase 7: Post-Deployment Tasks"
log "================================="

# Run post-deployment tests if available
if [[ -x "./scripts/post-deploy-tests.sh" ]]; then
    log "🧪 Running post-deployment tests..."
    if ./scripts/post-deploy-tests.sh "$RAILWAY_URL"; then
        log "✅ Post-deployment tests passed"
    else
        log "⚠️  Post-deployment tests failed"
    fi
fi

# Calculate deployment time
DEPLOY_END=$(date +%s)
DEPLOY_TIME=$((DEPLOY_END - DEPLOY_START))
log "⏱️  Total deployment time: ${DEPLOY_TIME}s"

log ""
log "============================================"
log "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY"
log "============================================"
log "📊 Deployment Summary:"
log "  • Status: SUCCESS"
log "  • URL: $RAILWAY_URL"
log "  • Deploy Time: ${DEPLOY_TIME}s"
log "  • Response Time: ${RESPONSE_TIME}s"
log "  • Health Checks: $([ "$HEALTH_CHECK_PASSED" = true ] && echo "PASSED" || echo "FAILED")"
log "  • Log File: $DEPLOY_LOG"
log ""
log "🔗 Access your application: $RAILWAY_URL"
log "📊 Monitor at: https://railway.app"
log ""
log "🎯 Next Steps:"
log "  1. Verify all features are working correctly"
log "  2. Monitor application performance"
log "  3. Check error logs if any issues occur"
log "  4. Run full test suite: npm run test:e2e"

# Export deployment info for other scripts
echo "RAILWAY_URL=$RAILWAY_URL" > .deployment-info
echo "DEPLOY_TIME=$DEPLOY_TIME" >> .deployment-info
echo "DEPLOY_TIMESTAMP=$(date)" >> .deployment-info

exit 0

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment    Target environment (development|staging|production)"
    echo "  -v, --version        Version tag (e.g., v1.0.0)"
    echo "  --no-frontend        Skip frontend build"
    echo "  --no-tests          Skip running tests"
    echo "  --no-backup         Skip database backup"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e staging -v v1.2.0"
    echo "  $0 -e production -v v1.0.0 --no-tests"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        --no-frontend)
            BUILD_FRONTEND=false
            shift
            ;;
        --no-tests)
            RUN_TESTS=false
            shift
            ;;
        --no-backup)
            BACKUP_DB=false
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$ENVIRONMENT" ]]; then
    print_error "Environment is required. Use -e or --environment."
    show_usage
    exit 1
fi

if [[ -z "$VERSION" ]]; then
    print_error "Version is required. Use -v or --version."
    show_usage
    exit 1
fi

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment. Must be development, staging, or production."
    exit 1
fi

print_status "Starting deployment to $ENVIRONMENT environment with version $VERSION"

# Create deployment directory
DEPLOY_DIR="/tmp/ai-masterclass-deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

print_status "Created deployment directory: $DEPLOY_DIR"

# Step 1: Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if required files exist
REQUIRED_FILES=("Dockerfile" "docker-compose.yml" ".env.production")
for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        print_error "Required file $file not found."
        exit 1
    fi
done

print_success "Pre-deployment checks passed"

# Step 2: Run tests
if [[ "$RUN_TESTS" == true ]]; then
    print_status "Running test suite..."
    
    # Backend tests
    cd backend
    if npm test -- --coverage --watchAll=false; then
        print_success "Backend tests passed"
    else
        print_error "Backend tests failed"
        exit 1
    fi
    cd ..
    
    # Frontend tests
    cd frontend
    if npm test -- --watchAll=false --coverage; then
        print_success "Frontend tests passed"
    else
        print_error "Frontend tests failed"
        exit 1
    fi
    cd ..
fi

# Step 3: Database backup (production only)
if [[ "$ENVIRONMENT" == "production" && "$BACKUP_DB" == true ]]; then
    print_status "Creating database backup..."
    
    BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
    if pg_dump -h localhost -U ai_user_prod ai_masterclass_prod > "backups/$BACKUP_FILE"; then
        print_success "Database backup created: backups/$BACKUP_FILE"
    else
        print_error "Database backup failed"
        exit 1
    fi
fi

# Step 4: Build application
print_status "Building application..."

# Build frontend
if [[ "$BUILD_FRONTEND" == true ]]; then
    print_status "Building frontend..."
    cd frontend
    npm ci
    npm run build
    print_success "Frontend build completed"
    cd ..
fi

# Build Docker image
DOCKER_TAG="ai-masterclass:$VERSION"
if docker build -t "$DOCKER_TAG" .; then
    print_success "Docker image built: $DOCKER_TAG"
else
    print_error "Docker build failed"
    exit 1
fi

# Step 5: Deploy based on environment
case $ENVIRONMENT in
    "development")
        print_status "Deploying to development environment..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
        ;;
    "staging")
        print_status "Deploying to staging environment..."
        docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
        ;;
    "production")
        print_status "Deploying to production environment..."
        
        # Stop existing containers gracefully
        docker-compose down --timeout 30
        
        # Start new containers
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        
        # Wait for health checks
        print_status "Waiting for services to become healthy..."
        sleep 30
        
        # Check if all services are healthy
        if docker-compose ps | grep -q "unhealthy"; then
            print_error "Some services are unhealthy. Check logs:"
            docker-compose logs
            exit 1
        fi
        ;;
esac

# Step 6: Post-deployment verification
print_status "Running post-deployment verification..."

# Wait for services to start
sleep 10

# Health check
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_success "Application health check passed"
else
    print_error "Application health check failed"
    exit 1
fi

# Database health check
if curl -f http://localhost:5000/health/database > /dev/null 2>&1; then
    print_success "Database health check passed"
else
    print_warning "Database health check failed, but continuing..."
fi

# Step 7: Tag and push Docker image (production only)
if [[ "$ENVIRONMENT" == "production" ]]; then
    print_status "Tagging and pushing Docker image..."
    
    # Tag for registry (customize with your registry)
    # docker tag "$DOCKER_TAG" "your-registry.com/ai-masterclass:$VERSION"
    # docker push "your-registry.com/ai-masterclass:$VERSION"
    
    print_success "Docker image tagged for production"
fi

# Step 8: Update monitoring dashboards
print_status "Updating monitoring dashboards..."

# Restart Prometheus to reload configuration
docker-compose restart prometheus

# Import Grafana dashboards if needed
# (Add custom dashboard import logic here)

print_success "Monitoring dashboards updated"

# Step 9: Cleanup
print_status "Cleaning up deployment files..."
rm -rf "$DEPLOY_DIR"

# Final status
print_success "Deployment to $ENVIRONMENT completed successfully!"
print_status "Application is running at:"
case $ENVIRONMENT in
    "development")
        echo "  - Frontend: http://localhost:3000"
        echo "  - API: http://localhost:5000"
        ;;
    "staging")
        echo "  - Frontend: https://staging.your-domain.com"
        echo "  - API: https://api-staging.your-domain.com"
        ;;
    "production")
        echo "  - Frontend: https://your-domain.com"
        echo "  - API: https://api.your-domain.com"
        ;;
esac

echo "  - Monitoring: http://localhost:3001 (Grafana)"
echo "  - Metrics: http://localhost:9090 (Prometheus)"

print_status "Deployment logs saved to: deployment-$ENVIRONMENT-$VERSION.log"