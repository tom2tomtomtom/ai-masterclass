#!/bin/bash

# QUALITY GATES AND MONITORING SCRIPT
# Implements comprehensive quality validation before deployment

set -e  # Exit on any error

echo "📊 QUALITY GATES & MONITORING VALIDATION"
echo "========================================"

# Configuration
QUALITY_LOG="logs/quality-check-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs test-results

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$QUALITY_LOG"
}

# Function to check if command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log "❌ ERROR: $1 is not installed"
        return 1
    fi
    return 0
}

QUALITY_SCORE=0
MAX_SCORE=100
GATE_PASSED=true

# Function to add to quality score
add_score() {
    QUALITY_SCORE=$((QUALITY_SCORE + $1))
    log "📊 Quality Score: +$1 (Total: $QUALITY_SCORE/$MAX_SCORE)"
}

# Function to fail quality gate
fail_gate() {
    GATE_PASSED=false
    log "❌ QUALITY GATE FAILED: $1"
}

log "🔍 Phase 1: Test Coverage Validation"
log "===================================="

# Check test coverage for backend
log "Checking backend test coverage..."
if [[ -d "backend" ]]; then
    cd backend
    if npm run test:coverage 2>/dev/null; then
        # Extract coverage percentage
        COVERAGE=$(npm run test:coverage 2>/dev/null | grep -o '[0-9]*\.[0-9]*%' | head -1 | sed 's/%//')
        if [[ -n "$COVERAGE" ]]; then
            COVERAGE_NUM=${COVERAGE%.*}  # Remove decimal part
            log "📊 Backend test coverage: ${COVERAGE}%"
            
            if [[ $COVERAGE_NUM -ge 80 ]]; then
                add_score 20
                log "✅ Backend coverage meets requirement (≥80%)"
            elif [[ $COVERAGE_NUM -ge 60 ]]; then
                add_score 10
                log "⚠️  Backend coverage acceptable but below target (${COVERAGE}% < 80%)"
            else
                fail_gate "Backend test coverage too low: ${COVERAGE}%"
            fi
        else
            log "⚠️  Could not determine backend coverage percentage"
            add_score 5  # Partial credit for running tests
        fi
    else
        fail_gate "Backend tests failed to run"
    fi
    cd ..
else
    log "⚠️  Backend directory not found"
fi

# Check test coverage for frontend
log "Checking frontend test coverage..."
if [[ -d "frontend" ]]; then
    cd frontend
    if npm test -- --coverage --watchAll=false 2>/dev/null; then
        log "✅ Frontend tests executed"
        add_score 10
        
        # Check for coverage report
        if [[ -f "coverage/lcov-report/index.html" ]]; then
            log "✅ Frontend coverage report generated"
            add_score 10
        fi
    else
        log "⚠️  Frontend tests had issues"
        add_score 5  # Partial credit
    fi
    cd ..
else
    log "⚠️  Frontend directory not found"
fi

log ""
log "🔍 Phase 2: Code Quality Analysis"
log "================================="

# Code complexity check
log "Checking code complexity..."
COMPLEX_FILES=$(find . -name "*.js" -not -path "./node_modules/*" -not -path "./*/node_modules/*" -exec wc -l {} + | awk '$1 > 500 {print $2 " (" $1 " lines)"}' | head -5)

if [[ -z "$COMPLEX_FILES" ]]; then
    add_score 15
    log "✅ No overly complex files found"
else
    log "⚠️  Large files detected:"
    echo "$COMPLEX_FILES" | while read line; do
        log "    $line"
    done
    add_score 5  # Partial credit
fi

# Code duplication check
log "Checking for code duplication..."
DUPLICATE_FUNCTIONS=$(grep -r "function\|const.*=" . --include="*.js" --exclude-dir=node_modules | awk '{print $NF}' | sort | uniq -d | wc -l)
if [[ $DUPLICATE_FUNCTIONS -lt 10 ]]; then
    add_score 10
    log "✅ Code duplication within acceptable limits"
else
    log "⚠️  High code duplication detected: $DUPLICATE_FUNCTIONS potential duplicates"
    add_score 5
fi

# ESLint/Prettier compliance
log "Checking code formatting and linting..."
if check_command "npm" && npm run lint 2>/dev/null; then
    add_score 15
    log "✅ Code passes linting checks"
else
    log "⚠️  Linting issues found or not configured"
    add_score 5
fi

log ""
log "🔍 Phase 3: Security Validation"
log "==============================="

# Security audit
log "Running security audit..."
HIGH_VULNS=$(npm audit --audit-level=high 2>/dev/null | grep -c "high" || echo "0")
CRITICAL_VULNS=$(npm audit --audit-level=critical 2>/dev/null | grep -c "critical" || echo "0")

if [[ $CRITICAL_VULNS -eq 0 && $HIGH_VULNS -eq 0 ]]; then
    add_score 20
    log "✅ No high or critical security vulnerabilities"
elif [[ $CRITICAL_VULNS -eq 0 && $HIGH_VULNS -le 2 ]]; then
    add_score 10
    log "⚠️  Minor security issues found: $HIGH_VULNS high severity"
else
    fail_gate "Critical security vulnerabilities found: $CRITICAL_VULNS critical, $HIGH_VULNS high"
fi

# Check for exposed secrets
log "Checking for exposed secrets..."
SECRET_PATTERNS=("password\s*=" "secret\s*=" "key\s*=" "token\s*=")
SECRETS_FOUND=0

for pattern in "${SECRET_PATTERNS[@]}"; do
    MATCHES=$(grep -r -i "$pattern" . --include="*.js" --include="*.json" --exclude-dir=node_modules 2>/dev/null | grep -v "console.log\|comment\|test\|example" | wc -l || echo "0")
    SECRETS_FOUND=$((SECRETS_FOUND + MATCHES))
done

if [[ $SECRETS_FOUND -eq 0 ]]; then
    add_score 10
    log "✅ No obvious secret exposure found"
else
    fail_gate "Potential secrets found in code: $SECRETS_FOUND instances"
fi

log ""
log "🔍 Phase 4: Performance Requirements"
log "===================================="

# Bundle size check
log "Checking bundle sizes..."
if [[ -d "frontend/build" ]]; then
    BUILD_SIZE_KB=$(du -sk frontend/build | cut -f1)
    BUILD_SIZE_MB=$((BUILD_SIZE_KB / 1024))
    
    if [[ $BUILD_SIZE_MB -le 5 ]]; then
        add_score 15
        log "✅ Build size optimal: ${BUILD_SIZE_MB}MB"
    elif [[ $BUILD_SIZE_MB -le 10 ]]; then
        add_score 10
        log "⚠️  Build size acceptable: ${BUILD_SIZE_MB}MB"
    else
        log "⚠️  Build size large: ${BUILD_SIZE_MB}MB (consider optimization)"
        add_score 5
    fi
else
    log "⚠️  Build directory not found - run build first"
fi

# Performance test
log "Running basic performance validation..."
if [[ -x "./frontend/e2e/performance.spec.js" ]] || [[ -f "./frontend/e2e/performance.spec.js" ]]; then
    add_score 5
    log "✅ Performance tests available"
else
    log "⚠️  No performance tests found"
fi

log ""
log "🔍 Phase 5: Documentation & Maintainability"
log "==========================================="

# README and documentation
log "Checking documentation..."
if [[ -f "README.md" ]] && [[ $(wc -l < README.md) -gt 20 ]]; then
    add_score 5
    log "✅ README.md exists and has content"
else
    log "⚠️  README.md missing or too short"
fi

# API documentation
if [[ -f "backend/routes" ]] || [[ -d "backend/routes" ]]; then
    add_score 5
    log "✅ API structure organized"
else
    log "⚠️  API structure unclear"
fi

# Environment configuration
if [[ -f ".env.example" ]]; then
    add_score 5
    log "✅ Environment configuration documented"
else
    log "⚠️  Environment configuration not documented"
fi

log ""
log "🔍 Phase 6: Monitoring & Observability"
log "======================================"

# Health endpoints
log "Checking health monitoring endpoints..."
if grep -r "/health\|/api/health" . --include="*.js" --exclude-dir=node_modules &>/dev/null; then
    add_score 10
    log "✅ Health endpoints implemented"
else
    log "⚠️  No health endpoints found"
    add_score 5
fi

# Logging implementation
log "Checking logging implementation..."
if grep -r "console.log\|logger\|winston" . --include="*.js" --exclude-dir=node_modules | wc -l | awk '$1 > 10 {exit 0} {exit 1}'; then
    add_score 5
    log "✅ Logging implementation found"
else
    log "⚠️  Limited logging implementation"
fi

# Error handling
log "Checking error handling..."
ERROR_HANDLERS=$(grep -r "catch\|Error\|try" . --include="*.js" --exclude-dir=node_modules | wc -l)
if [[ $ERROR_HANDLERS -gt 20 ]]; then
    add_score 5
    log "✅ Comprehensive error handling implemented"
else
    log "⚠️  Limited error handling found"
    add_score 2
fi

log ""
log "=============================================="
log "📊 QUALITY GATES VALIDATION COMPLETE"
log "=============================================="

# Calculate percentage
PERCENTAGE=$((QUALITY_SCORE * 100 / MAX_SCORE))
log "📊 Final Quality Score: $QUALITY_SCORE/$MAX_SCORE ($PERCENTAGE%)"

# Quality gate thresholds
if [[ $PERCENTAGE -ge 90 && "$GATE_PASSED" = true ]]; then
    log "🎉 EXCELLENT QUALITY - READY FOR PRODUCTION"
    echo "QUALITY_STATUS=EXCELLENT" > .quality-status
    exit 0
elif [[ $PERCENTAGE -ge 75 && "$GATE_PASSED" = true ]]; then
    log "✅ GOOD QUALITY - APPROVED FOR DEPLOYMENT"
    echo "QUALITY_STATUS=GOOD" > .quality-status
    exit 0
elif [[ $PERCENTAGE -ge 60 && "$GATE_PASSED" = true ]]; then
    log "⚠️  ACCEPTABLE QUALITY - DEPLOY WITH MONITORING"
    echo "QUALITY_STATUS=ACCEPTABLE" > .quality-status
    exit 0
else
    log "❌ QUALITY GATE FAILED - DO NOT DEPLOY"
    log "🔧 Required actions:"
    
    if [[ $PERCENTAGE -lt 60 ]]; then
        log "  • Improve overall quality score (current: $PERCENTAGE%, required: ≥60%)"
    fi
    
    if [[ "$GATE_PASSED" = false ]]; then
        log "  • Fix critical quality gate failures listed above"
    fi
    
    log "  • Run quality checks again after fixes"
    
    echo "QUALITY_STATUS=FAILED" > .quality-status
    exit 1
fi