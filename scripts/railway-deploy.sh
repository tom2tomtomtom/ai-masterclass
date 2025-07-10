#!/bin/bash

# Railway Deployment Helper Script
# This script helps prepare your AI-Masterclass for Railway deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

# Main deployment preparation
main() {
    print_header "🚂 Railway Deployment Preparation"
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" && ! -f "backend/package.json" ]]; then
        print_error "Please run this script from your AI-Masterclass root directory"
        exit 1
    fi
    
    print_status "Preparing your AI-Masterclass for Railway deployment..."
    
    # Step 1: Check Git status
    print_header "📋 Step 1: Checking Git Status"
    
    if ! git status > /dev/null 2>&1; then
        print_error "This is not a Git repository. Please initialize Git first:"
        echo "  git init"
        echo "  git add ."
        echo "  git commit -m 'Initial commit'"
        exit 1
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_warning "You have uncommitted changes. Committing them now..."
        git add .
        git commit -m "Prepare for Railway deployment - $(date)"
        print_success "Changes committed"
    else
        print_success "Git repository is clean"
    fi
    
    # Step 2: Verify required files
    print_header "📁 Step 2: Verifying Required Files"
    
    REQUIRED_FILES=(
        "railway.json"
        "railway.toml" 
        ".env.railway"
        "backend/package.json"
        "frontend/package.json"
        "RAILWAY_DEPLOYMENT_GUIDE.md"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ -f "$file" ]]; then
            print_success "✓ $file exists"
        else
            print_error "✗ $file is missing"
            exit 1
        fi
    done
    
    # Step 3: Check package.json scripts
    print_header "📦 Step 3: Checking Package Scripts"
    
    # Check backend package.json
    if grep -q '"start"' backend/package.json; then
        print_success "✓ Backend start script found"
    else
        print_error "✗ Backend package.json missing 'start' script"
        print_status "Adding start script to backend/package.json..."
        
        # Add start script if missing
        sed -i.bak 's/"scripts": {/"scripts": {\n    "start": "node index.js",/' backend/package.json
        print_success "✓ Start script added"
    fi
    
    # Check frontend package.json
    if grep -q '"build"' frontend/package.json; then
        print_success "✓ Frontend build script found"
    else
        print_error "✗ Frontend package.json missing 'build' script"
        exit 1
    fi
    
    # Step 4: Generate secrets
    print_header "🔐 Step 4: Generating Secure Secrets"
    
    print_status "Generating secure secrets for your application..."
    
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "CHANGE_THIS_JWT_SECRET_$(date +%s)")
    SESSION_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "CHANGE_THIS_SESSION_SECRET_$(date +%s)")
    
    echo -e "\n${GREEN}🔑 IMPORTANT: Save these secrets for Railway setup:${NC}"
    echo -e "${YELLOW}JWT_SECRET:${NC} $JWT_SECRET"
    echo -e "${YELLOW}SESSION_SECRET:${NC} $SESSION_SECRET"
    echo -e "\n${RED}⚠️  Keep these secrets safe and don't share them publicly!${NC}\n"
    
    # Save to temporary file
    cat > .railway-secrets.txt << EOF
# Railway Environment Variables
# Copy these to your Railway dashboard

JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

# Database variables (Railway will auto-fill these):
DATABASE_URL=\${{Postgres.DATABASE_URL}}
DB_HOST=\${{Postgres.PGHOST}}
DB_PORT=\${{Postgres.PGPORT}}
DB_DATABASE=\${{Postgres.PGDATABASE}}
DB_USER=\${{Postgres.PGUSER}}
DB_PASSWORD=\${{Postgres.PGPASSWORD}}

# Redis variables (Railway will auto-fill these):
REDIS_URL=\${{Redis.REDIS_URL}}

# App configuration:
NODE_ENV=production
PORT=\${{PORT}}
DB_SSL=true
LOG_LEVEL=info
ENABLE_METRICS=true
ENABLE_CACHING=true
FRONTEND_URL=\${{RAILWAY_PUBLIC_DOMAIN}}
CORS_ORIGIN=\${{RAILWAY_PUBLIC_DOMAIN}}
EOF
    
    print_success "✓ Secrets saved to .railway-secrets.txt"
    
    # Step 5: Final checks
    print_header "✅ Step 5: Final Preparation"
    
    # Test backend dependencies
    print_status "Checking backend dependencies..."
    cd backend
    if npm ci --only=production --silent; then
        print_success "✓ Backend dependencies OK"
    else
        print_error "✗ Backend dependency issues found"
        cd ..
        exit 1
    fi
    cd ..
    
    # Test frontend dependencies  
    print_status "Checking frontend dependencies..."
    cd frontend
    if npm ci --silent; then
        print_success "✓ Frontend dependencies OK"
    else
        print_error "✗ Frontend dependency issues found"
        cd ..
        exit 1
    fi
    cd ..
    
    # Push to Git
    print_status "Pushing changes to Git..."
    git add .
    git commit -m "Add Railway deployment configuration" || true
    
    if git remote get-url origin > /dev/null 2>&1; then
        git push origin main || git push origin master || print_warning "Could not push to remote. Push manually later."
        print_success "✓ Changes pushed to Git"
    else
        print_warning "No Git remote found. Make sure to push to GitHub before deploying to Railway."
    fi
    
    # Success message
    print_header "🎉 Deployment Preparation Complete!"
    
    echo -e "${GREEN}Your AI-Masterclass is ready for Railway deployment!${NC}\n"
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "1. Go to ${YELLOW}https://railway.app${NC}"
    echo -e "2. Create account and connect your GitHub repository"
    echo -e "3. Add PostgreSQL and Redis services"
    echo -e "4. Copy environment variables from ${YELLOW}.railway-secrets.txt${NC}"
    echo -e "5. Deploy your application!"
    echo -e "\n${BLUE}📖 Full guide: ${YELLOW}RAILWAY_DEPLOYMENT_GUIDE.md${NC}"
    echo -e "\n${RED}🔐 Don't forget to delete .railway-secrets.txt after copying the secrets!${NC}"
}

# Run main function
main "$@"
