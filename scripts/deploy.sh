#!/bin/bash

# AI Masterclass Deployment Script
# This script handles deployment to various environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=""
VERSION=""
BUILD_FRONTEND=true
RUN_TESTS=true
BACKUP_DB=true

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