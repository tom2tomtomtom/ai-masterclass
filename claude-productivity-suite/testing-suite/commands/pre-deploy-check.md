---
name: pre-deploy-check
description: Quick 5-minute pre-deployment safety check with expert validation
---

# Pre-Deploy Check

Perform a rapid pre-deployment check focusing on critical issues with expert assistance.

## 🤖 Sub-Agent Support

Claude will automatically use relevant sub-agents:
- **security-auditor** - Security validation
- **deployment-engineer** - Deployment readiness
- **performance-optimizer** - Performance checks
- **test-automator** - Test verification
- **devops-troubleshooter** - Configuration review

For specific concerns:
> "Use the security-auditor sub agent to check for vulnerabilities"

## 1. Syntax & Build Check (1 minute)
```bash
# Check if the app builds without errors
npm run build
```
- Fix any TypeScript errors that prevent building
- Fix any import errors
- Ensure all dependencies are installed

## 2. Critical Security Scan (1 minute)
- Search for exposed API keys in code: 
  - Look for strings matching: /[A-Z0-9_]{20,}/
  - Check for hardcoded passwords
  - Find any localhost URLs that should be environment variables
- Check if .env is in .gitignore
- Ensure no sensitive files are being committed

## 3. Console Cleanup (1 minute)
- Remove or comment out all console.log statements
- Remove any debugger statements
- Remove any alert() calls
- Keep console.error for actual error handling

## 4. Quick Smoke Test (2 minutes)
Start the app and verify:
- Homepage loads without errors
- Can navigate to main pages
- No obvious visual breaks
- Database connects successfully
- API health endpoint responds

## 5. Expert Validation

Sub-agents provide additional checks:
- **Security**: OWASP compliance, auth flows
- **Performance**: Bundle size, load times
- **Deployment**: Environment configs, secrets
- **Database**: Migration readiness
- **Testing**: Coverage thresholds

## 6. Generate Quick Report

Create a deployment readiness checklist:
- [ ] App builds successfully
- [ ] No exposed secrets
- [ ] Console statements removed  
- [ ] Basic functionality works
- [ ] Security audit passed
- [ ] Performance acceptable
- [ ] Configs verified
- [ ] Ready for deployment: YES/NO

If any critical issues found, fix them immediately and re-run.

## Enhanced with Sub-Agents

Expert validation includes:
- **Deeper Security Scans** - Beyond basic checks
- **Configuration Validation** - Environment-specific
- **Performance Baselines** - Load time targets
- **Deployment Prerequisites** - Platform-specific

The check becomes more thorough with available expertise!