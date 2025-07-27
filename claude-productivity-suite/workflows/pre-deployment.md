---
name: pre-deploy
description: Pre-deployment checklist workflow
---

Complete pre-deployment workflow to ensure production readiness.

## 1. Code Quality Check
```
/analyze-codebase
```
Review the report and fix any critical issues.

## 2. Clean Up Code
```
/clean-codebase
```
Remove unnecessary code and optimize.

## 3. Run All Tests
```
/fix-and-test
```
Ensure all tests pass and fix any failures.

## 4. Performance Check
- Bundle size analysis
- Load time testing
- API response times
- Database query optimization

## 5. Security Audit
- Run security scanners
- Check for exposed secrets
- Verify authentication
- Test authorization

## 6. Documentation Update
- API documentation current?
- README up to date?
- Deployment guide ready?
- Environment variables documented?

## 7. Staging Deployment
- Deploy to staging
- Run smoke tests
- Get team approval
- Document any issues

## 8. Final Checklist
- [ ] All tests passing
- [ ] No security vulnerabilities  
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Rollback plan ready
- [ ] Team notified
- [ ] Monitoring configured

Ready for production deployment!
