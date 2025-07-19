#!/bin/bash

# Railway Deployment Script for AI Masterclass
# Handles Railway CLI deployment with proper service management

set -e

echo "🚀 Starting Railway deployment for AI Masterclass..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

success() {
    log "${GREEN}✅ $1${NC}"
}

error() {
    log "${RED}❌ $1${NC}"
}

info() {
    log "${BLUE}ℹ️  $1${NC}"
}

warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Check Railway authentication
info "Checking Railway authentication..."
if ! railway whoami > /dev/null 2>&1; then
    error "Not logged into Railway. Please run: railway login"
    exit 1
fi
success "Railway authentication verified"

# Step 2: Check project status
info "Checking project status..."
PROJECT_INFO=$(railway status 2>/dev/null || echo "No project")
if [[ "$PROJECT_INFO" == *"No project"* ]]; then
    error "No Railway project found. Please run: railway link"
    exit 1
fi
success "Railway project connected"

# Step 3: Build frontend
info "Building frontend..."
cd frontend
npm install
npm run build
success "Frontend build completed"

# Step 4: Copy build to backend
info "Copying frontend build to backend..."
cd ..
cp -r frontend/build backend/
success "Frontend build copied to backend"

# Step 5: Install backend dependencies
info "Installing backend dependencies..."
cd backend
npm install --production
cd ..
success "Backend dependencies installed"

# Step 6: Deploy to Railway
info "Deploying to Railway..."
DEPLOY_OUTPUT=$(railway up 2>&1)
echo "$DEPLOY_OUTPUT"

if [[ "$DEPLOY_OUTPUT" == *"Indexing"* ]] && [[ "$DEPLOY_OUTPUT" == *"Uploading"* ]]; then
    success "Deployment initiated successfully"
    
    # Extract deployment URL if available
    if [[ "$DEPLOY_OUTPUT" == *"Build Logs:"* ]]; then
        BUILD_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://railway.com[^[:space:]]*')
        info "Build logs available at: $BUILD_URL"
    fi
else
    error "Deployment failed"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# Step 7: Wait for deployment to complete
info "Waiting for deployment to complete..."
sleep 30

# Step 8: Check deployment status
info "Checking deployment status..."
STATUS_OUTPUT=$(railway status 2>/dev/null || echo "Status unavailable")
echo "$STATUS_OUTPUT"

# Step 9: Health check
info "Performing health check..."
# Note: We'll need to get the domain after deployment
warning "Manual health check required - check Railway dashboard for domain"

success "Deployment process completed!"
info "Next steps:"
info "1. Check Railway dashboard for deployment status"
info "2. Verify environment variables are set"
info "3. Test the application URL"
info "4. Monitor logs for any issues"

echo
info "Railway Dashboard: https://railway.app/dashboard"
info "Build Logs: Check the URL provided during deployment"