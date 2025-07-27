---
name: fix-and-test
description: Comprehensive error fixing and testing workflow for production deployment
---

Execute a complete error fixing and testing workflow to ensure the application is production-ready.

## 🔍 Phase 1: Error Detection & Analysis

### 1.1 Static Code Analysis
- Run TypeScript compiler in strict mode to find type errors
- Execute ESLint with all rules enabled
- Run security audit with `npm audit` and `snyk test`
- Check for unused dependencies and code
- Scan for hardcoded secrets or API keys
- Validate all environment variables are properly typed

### 1.2 Console & Debug Statement Removal
- Search for all console.log, console.error, console.warn statements
- Remove or convert to proper logging service
- Find and remove all debugger statements
- Check for commented-out code blocks
- Remove TODO and FIXME comments or convert to issues

### 1.3 Error Boundary Implementation
- Ensure all components have error boundaries
- Add fallback UI for error states
- Implement proper error logging
- Create user-friendly error messages
- Add error recovery mechanisms

## 🧪 Phase 2: Automated Testing Suite

### 2.1 Unit Testing
- Ensure 80% code coverage minimum
- Test all utility functions
- Test all API endpoints
- Test data transformations
- Test validation functions
- Mock external dependencies properly

### 2.2 Integration Testing
- Test database connections
- Test API integrations
- Test authentication flows
- Test payment processing (if applicable)
- Test email sending functionality
- Test file upload/download

### 2.3 End-to-End Testing with Playwright
```bash
# Start the development server
npm run dev &

# Wait for server to be ready
npx wait-on http://localhost:3000

# Run Playwright tests
npx playwright test
```

Test scenarios to execute:
1. **Authentication Flow**
   - Successful registration
   - Login with valid credentials
   - Login with invalid credentials
   - Password reset flow
   - Session persistence
   - Logout functionality

2. **Core User Journeys**
   - Complete primary user workflow
   - Create, read, update, delete operations
   - Search and filter functionality
   - Data export/import features
   - Settings management

3. **Edge Cases**
   - Network disconnection handling
   - Slow network simulation (3G)
   - Browser back button behavior
   - Multiple tab handling
   - Session timeout behavior
   - Concurrent user actions

4. **Error Scenarios**
   - Form validation errors
   - API failure handling
   - 404 page functionality
   - 500 error recovery
   - Rate limiting behavior
   - Invalid data handling

### 2.4 Visual Regression Testing
- Take baseline screenshots of all pages
- Compare against previous versions
- Flag any unexpected visual changes
- Test on multiple viewports (mobile, tablet, desktop)
- Verify responsive design breakpoints

## 🔧 Phase 3: Performance & Optimization

### 3.1 Performance Testing
- Measure page load times (target: <3s)
- Check Time to Interactive (TTI)
- Analyze bundle sizes
- Implement code splitting where needed
- Optimize images and assets
- Enable compression (gzip/brotli)

### 3.2 Database Optimization
- Add missing indexes
- Optimize slow queries
- Implement connection pooling
- Add query result caching
- Test under load (1000+ concurrent users)

### 3.3 API Optimization
- Implement request rate limiting
- Add response caching headers
- Optimize payload sizes
- Implement pagination
- Add request validation
- Test API response times (<200ms)

## 🔒 Phase 4: Security Hardening

### 4.1 Security Headers
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- X-XSS-Protection: 1; mode=block

### 4.2 Input Validation
- Sanitize all user inputs
- Implement SQL injection prevention
- Add XSS protection
- Validate file uploads
- Check for path traversal vulnerabilities
- Implement CSRF tokens

### 4.3 Authentication Security
- Enforce strong passwords
- Implement account lockout
- Add 2FA capability
- Secure session management
- Implement JWT properly
- Add refresh token rotation

## 🌐 Phase 5: Cross-Browser & Device Testing

### 5.1 Browser Testing
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

### 5.2 Device Testing
Test on:
- iPhone (multiple models)
- Android phones
- iPad
- Android tablets
- Various desktop resolutions

### 5.3 Accessibility Testing
- Keyboard navigation
- Screen reader compatibility
- Color contrast (WCAG AA)
- Focus indicators
- Alt text for images
- ARIA labels

## 📊 Phase 6: Production Readiness

### 6.1 Environment Configuration
- Verify all production environment variables
- Check database connection strings
- Validate API endpoints
- Confirm third-party service credentials
- Test email configuration
- Verify payment gateway settings

### 6.2 Monitoring Setup
- Configure error tracking (Sentry)
- Set up performance monitoring
- Implement uptime monitoring
- Add custom metric tracking
- Configure alerting rules
- Create operational dashboards

### 6.3 Backup & Recovery
- Test database backup procedures
- Verify restore processes
- Document rollback procedures
- Test disaster recovery plan
- Ensure data export functionality

## 🚀 Phase 7: Deployment Validation

### 7.1 Pre-Deployment Checklist
- [ ] All tests passing (unit, integration, e2e)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Security vulnerabilities resolved
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Database migrations ready
- [ ] Rollback plan documented

### 7.2 Staging Deployment
- Deploy to staging environment
- Run smoke tests
- Verify all integrations
- Test with production-like data
- Perform load testing
- Get stakeholder approval

### 7.3 Production Deployment Preparation
- Create deployment runbook
- Schedule deployment window
- Notify team members
- Prepare rollback scripts
- Enable maintenance mode
- Configure monitoring alerts

## 📝 Phase 8: Final Report Generation

Generate comprehensive report including:

1. **Executive Summary**
   - Overall health score
   - Critical issues found and fixed
   - Test coverage metrics
   - Performance improvements

2. **Detailed Findings**
   - Errors fixed by category
   - Test results summary
   - Performance metrics
   - Security scan results

3. **Deployment Readiness**
   - ✅ All critical issues resolved
   - ✅ Test coverage above threshold
   - ✅ Performance targets met
   - ✅ Security requirements satisfied

4. **Recommendations**
   - Post-deployment monitoring
   - Future improvements
   - Technical debt items
   - Scaling considerations

## 🎯 Success Criteria

The application is ready for production when:
- Zero critical errors
- All tests passing
- Performance targets met
- Security scan clean
- Accessibility compliant
- Documentation complete

Execute all phases and provide detailed feedback on any issues that need manual intervention.
