#!/bin/bash

# Railway Deployment Status Checker
# Monitors deployment status and provides health checks

set -e

echo "🚀 AI Masterclass - Railway Deployment Monitor"
echo "=============================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
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

# Check Railway authentication
info "Checking Railway authentication..."
if ! railway whoami > /dev/null 2>&1; then
    error "Not logged into Railway. Please run: railway login"
    exit 1
fi
USER=$(railway whoami 2>/dev/null)
success "Authenticated as: $USER"

# Check project status
info "Checking project status..."
PROJECT_STATUS=$(railway status 2>/dev/null)
echo "$PROJECT_STATUS"

# Try to get domain information
info "Checking for deployment domain..."
DOMAIN_INFO=$(railway domain 2>/dev/null || echo "Domain check failed")
if [[ "$DOMAIN_INFO" == *"Domain check failed"* ]]; then
    warning "Could not retrieve domain information automatically"
    info "Please check Railway dashboard for deployment URL"
else
    echo "$DOMAIN_INFO"
fi

# Extract build logs URL from last deployment
BUILD_LOGS_URL="https://railway.com/project/b54da824-c885-41c9-8d15-1c9aa3c493f7/service/49b1e19c-f317-4fcc-9627-9435ccde48d4?id=78a6ec29-1ecd-4766-a031-6ef5ccf9af1f&"

info "Build logs available at:"
echo "$BUILD_LOGS_URL"

# Wait for deployment to be ready and attempt health check
info "Waiting for deployment to be ready..."
sleep 30

# Try to get the service URL (this might not work in non-interactive mode)
info "Attempting to retrieve service URL..."

# Health check function
health_check() {
    local url=$1
    info "Performing health check on: $url"
    
    # Check if URL is responding
    if curl -f -s --max-time 10 "$url/health" > /dev/null 2>&1; then
        success "Health check passed - service is responding"
        return 0
    elif curl -f -s --max-time 10 "$url" > /dev/null 2>&1; then
        success "Service is responding (no /health endpoint)"
        return 0
    else
        error "Health check failed - service not responding"
        return 1
    fi
}

# Common Railway domain patterns to try
POSSIBLE_DOMAINS=(
    "adequate-achievement-production.up.railway.app"
    "ai-masterclass-production.up.railway.app"
    "web-production.up.railway.app"
)

success_found=false
for domain in "${POSSIBLE_DOMAINS[@]}"; do
    url="https://$domain"
    info "Trying: $url"
    
    if health_check "$url"; then
        success "✨ Deployment successful! Service available at: $url"
        success_found=true
        break
    fi
done

if [ "$success_found" = false ]; then
    warning "Could not automatically determine service URL"
    info "Please check the Railway dashboard for your deployment URL"
    info "Dashboard: https://railway.app/dashboard"
    info "Build logs: $BUILD_LOGS_URL"
fi

# Final instructions
echo ""
info "Deployment Monitoring Complete!"
info "Next steps:"
info "1. Check Railway dashboard: https://railway.app/dashboard"
info "2. View build logs: $BUILD_LOGS_URL"
info "3. Test the application once URL is available"
info "4. Monitor logs for any runtime issues"

# Performance recommendations
echo ""
info "Performance Tips:"
info "• Monitor Core Web Vitals in browser dev tools"
info "• Check network tab for resource loading times"
info "• Verify all API endpoints are working correctly"
info "• Test the full user journey from course listing to lesson details"