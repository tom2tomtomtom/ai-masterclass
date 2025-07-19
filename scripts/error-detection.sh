#!/bin/bash

# AUTOMATED ERROR DETECTION & FIXING SCRIPT
# Implements comprehensive error scanning and automatic remediation

set -e  # Exit on error

echo "🔍 STARTING COMPREHENSIVE ERROR DETECTION"
echo "=========================================="

# Create logs directory
mkdir -p logs test-results

# Initialize error report
ERROR_REPORT="logs/error-report-$(date +%Y%m%d-%H%M%S).md"
echo "# 🚨 ERROR DETECTION REPORT - $(date)" > "$ERROR_REPORT"
echo "" >> "$ERROR_REPORT"

ERRORS_FOUND=0
FIXES_APPLIED=0

# Function to log error
log_error() {
    local severity=$1
    local component=$2
    local error_type=$3
    local description=$4
    local fix_applied=${5:-"No fix available"}
    
    echo "## 🚨 ERROR DETECTED" >> "$ERROR_REPORT"
    echo "**Severity**: $severity" >> "$ERROR_REPORT"
    echo "**Component**: $component" >> "$ERROR_REPORT"
    echo "**Error Type**: $error_type" >> "$ERROR_REPORT"
    echo "**Description**: $description" >> "$ERROR_REPORT"
    echo "**Fix Applied**: $fix_applied" >> "$ERROR_REPORT"
    echo "**Timestamp**: $(date)" >> "$ERROR_REPORT"
    echo "" >> "$ERROR_REPORT"
    
    ((ERRORS_FOUND++))
    echo "❌ ERROR [$severity]: $description"
}

# Function to log fix
log_fix() {
    local fix_description=$1
    echo "✅ FIX APPLIED: $fix_description"
    ((FIXES_APPLIED++))
}

echo "🔍 Phase 1: Dependency Security Analysis"
echo "----------------------------------------"

# Check for high-severity vulnerabilities
echo "Scanning for security vulnerabilities..."
if npm audit --audit-level=high 2>/dev/null | grep -q "high"; then
    log_error "High" "Dependencies" "Security" "High-severity vulnerabilities detected"
    
    echo "🔧 Applying automatic security fixes..."
    npm audit fix --force 2>/dev/null || npm audit fix 2>/dev/null || true
    
    # Check frontend
    cd frontend 2>/dev/null && npm audit fix 2>/dev/null && cd .. || true
    
    # Check backend
    cd backend 2>/dev/null && npm audit fix 2>/dev/null && cd .. || true
    
    log_fix "Applied npm audit fix to all packages"
else
    echo "✅ No high-severity vulnerabilities found"
fi

# Check for outdated dependencies
echo "Checking for outdated dependencies..."
OUTDATED_OUTPUT=$(npm outdated 2>/dev/null || echo "")
if [[ -n "$OUTDATED_OUTPUT" ]]; then
    log_error "Medium" "Dependencies" "Outdated" "Outdated packages detected"
    echo "$OUTDATED_OUTPUT"
else
    echo "✅ All dependencies are up to date"
fi

echo ""
echo "🔍 Phase 2: Code Quality Analysis"
echo "---------------------------------"

# Check for missing configuration files
echo "Checking for missing configuration files..."

# Check for ESLint config
if [[ ! -f ".eslintrc.js" && ! -f ".eslintrc.json" && ! -f "eslint.config.js" ]]; then
    log_error "Medium" "Code Quality" "Configuration" "ESLint configuration missing"
    
    echo "🔧 Creating basic ESLint configuration..."
    cat > .eslintrc.js << 'EOF'
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
};
EOF
    log_fix "Created basic ESLint configuration"
fi

# Check for Prettier config
if [[ ! -f ".prettierrc" && ! -f ".prettierrc.json" && ! -f "prettier.config.js" ]]; then
    log_error "Low" "Code Quality" "Configuration" "Prettier configuration missing"
    
    echo "🔧 Creating Prettier configuration..."
    cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
EOF
    log_fix "Created Prettier configuration"
fi

echo ""
echo "🔍 Phase 3: Runtime Error Detection"
echo "-----------------------------------"

# Check for syntax errors in JavaScript files
echo "Scanning for syntax errors..."
SYNTAX_ERRORS=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./*/node_modules/*" -exec node -c {} \; 2>&1 | grep -v "^$" || echo "")
if [[ -n "$SYNTAX_ERRORS" ]]; then
    log_error "Critical" "Code" "Syntax" "JavaScript syntax errors detected"
    echo "$SYNTAX_ERRORS"
else
    echo "✅ No JavaScript syntax errors found"
fi

# Check for common error patterns in logs
echo "Checking for error patterns..."
if [[ -d "backend/logs" ]]; then
    ERROR_PATTERNS=$(grep -r "ERROR\|Error\|error" backend/logs/ 2>/dev/null | wc -l || echo "0")
    if [[ "$ERROR_PATTERNS" -gt 10 ]]; then
        log_error "High" "Runtime" "Errors" "$ERROR_PATTERNS error entries found in logs"
    else
        echo "✅ Log error levels acceptable ($ERROR_PATTERNS errors)"
    fi
fi

echo ""
echo "🔍 Phase 4: Performance Issues"
echo "------------------------------"

# Check for large files that might affect performance
echo "Scanning for large files..."
LARGE_FILES=$(find . -name "*.js" -o -name "*.css" -o -name "*.json" | grep -v node_modules | xargs wc -c 2>/dev/null | awk '$1 > 1000000 {print $2 " (" $1 " bytes)"}' || echo "")
if [[ -n "$LARGE_FILES" ]]; then
    log_error "Medium" "Performance" "File Size" "Large files detected that may impact performance"
    echo "$LARGE_FILES"
else
    echo "✅ No oversized files detected"
fi

echo ""
echo "🔍 Phase 5: Security Checks"
echo "---------------------------"

# Check for exposed secrets
echo "Scanning for exposed secrets..."
SECRET_PATTERNS=("password" "secret" "key" "token" "api_key" "private_key")
SECRET_FOUND=false

for pattern in "${SECRET_PATTERNS[@]}"; do
    MATCHES=$(grep -r -i "$pattern.*=" . --include="*.js" --include="*.json" --include="*.env*" --exclude-dir=node_modules 2>/dev/null | grep -v "console.log\|comment\|test\|example" || echo "")
    if [[ -n "$MATCHES" ]]; then
        SECRET_FOUND=true
        echo "⚠️  Potential secret pattern found: $pattern"
    fi
done

if $SECRET_FOUND; then
    log_error "High" "Security" "Secrets" "Potential exposed secrets detected"
else
    echo "✅ No obvious secret exposure found"
fi

# Check for insecure HTTP URLs in production code
echo "Checking for insecure HTTP references..."
HTTP_REFS=$(grep -r "http://" . --include="*.js" --include="*.json" --exclude-dir=node_modules 2>/dev/null | grep -v "localhost\|127.0.0.1\|test\|comment" || echo "")
if [[ -n "$HTTP_REFS" ]]; then
    log_error "Medium" "Security" "Insecure URLs" "HTTP URLs found (should use HTTPS)"
    echo "$HTTP_REFS"
else
    echo "✅ No insecure HTTP references found"
fi

echo ""
echo "🔍 Phase 6: Infrastructure Checks"
echo "---------------------------------"

# Check for missing environment files
echo "Checking environment configuration..."
ENV_FILES=(".env.example" ".env.production" ".env.development")
for env_file in "${ENV_FILES[@]}"; do
    if [[ ! -f "$env_file" ]]; then
        log_error "Medium" "Infrastructure" "Configuration" "Missing environment file: $env_file"
        
        if [[ "$env_file" == ".env.example" ]]; then
            echo "🔧 Creating example environment file..."
            cat > .env.example << 'EOF'
# AI Masterclass Environment Configuration
NODE_ENV=development
PORT=5000
DATABASE_URL=your_database_url_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
EOF
            log_fix "Created .env.example template"
        fi
    fi
done

# Check Docker configuration
echo "Checking Docker configuration..."
if [[ -f "Dockerfile" ]]; then
    # Check for common Docker issues
    if ! grep -q "USER" Dockerfile; then
        log_error "Medium" "Security" "Docker" "Dockerfile runs as root user"
    fi
    
    if ! grep -q "HEALTHCHECK" Dockerfile; then
        log_error "Low" "Infrastructure" "Docker" "Dockerfile missing health check"
    fi
    
    echo "✅ Dockerfile exists and checked"
else
    log_error "Low" "Infrastructure" "Docker" "Dockerfile missing for containerization"
fi

echo ""
echo "🔍 Phase 7: Test Coverage Analysis"
echo "---------------------------------"

# Check for test files
echo "Checking test coverage..."
TEST_FILES=$(find . -name "*.test.js" -o -name "*.spec.js" | grep -v node_modules | wc -l)
SOURCE_FILES=$(find . -name "*.js" | grep -v node_modules | grep -v test | grep -v spec | wc -l)

if [[ "$TEST_FILES" -eq 0 ]]; then
    log_error "High" "Quality" "Testing" "No test files found"
elif [[ "$TEST_FILES" -lt $(($SOURCE_FILES / 4)) ]]; then
    log_error "Medium" "Quality" "Testing" "Low test coverage ($TEST_FILES tests for $SOURCE_FILES source files)"
else
    echo "✅ Reasonable test coverage ($TEST_FILES tests for $SOURCE_FILES source files)"
fi

echo ""
echo "🔍 Phase 8: Database & API Checks"
echo "---------------------------------"

# Test API health if server is running
echo "Testing API connectivity..."
if curl -s -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ API health endpoint responding"
elif curl -s -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ API health endpoint responding on port 3001"
else
    log_error "Medium" "Infrastructure" "API" "API health endpoint not responding"
fi

# Check database connectivity (if we can determine the database type)
if [[ -f "backend/package.json" ]]; then
    if grep -q "pg\|postgres" backend/package.json; then
        echo "PostgreSQL database detected"
        # Could add database connectivity test here
    elif grep -q "mysql" backend/package.json; then
        echo "MySQL database detected"
    elif grep -q "mongodb\|mongoose" backend/package.json; then
        echo "MongoDB database detected"
    fi
fi

echo ""
echo "=============================================="
echo "📊 ERROR DETECTION SUMMARY"
echo "=============================================="
echo "Total Errors Found: $ERRORS_FOUND"
echo "Automatic Fixes Applied: $FIXES_APPLIED"
echo "Report saved to: $ERROR_REPORT"

# Add summary to report
echo "" >> "$ERROR_REPORT"
echo "## 📊 SUMMARY" >> "$ERROR_REPORT"
echo "- **Total Errors Found**: $ERRORS_FOUND" >> "$ERROR_REPORT"
echo "- **Automatic Fixes Applied**: $FIXES_APPLIED" >> "$ERROR_REPORT"
echo "- **Scan Completed**: $(date)" >> "$ERROR_REPORT"

if [[ $ERRORS_FOUND -eq 0 ]]; then
    echo "🎉 NO CRITICAL ERRORS DETECTED!"
    echo "Status: READY FOR DEPLOYMENT" >> "$ERROR_REPORT"
    exit 0
elif [[ $ERRORS_FOUND -le 5 ]]; then
    echo "⚠️  MINOR ISSUES DETECTED - REVIEW RECOMMENDED"
    echo "Status: DEPLOY WITH CAUTION" >> "$ERROR_REPORT"
    exit 0
else
    echo "❌ CRITICAL ISSUES DETECTED - DEPLOYMENT NOT RECOMMENDED"
    echo "Status: DO NOT DEPLOY" >> "$ERROR_REPORT"
    exit 1
fi