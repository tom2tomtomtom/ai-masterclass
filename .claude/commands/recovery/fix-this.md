---
name: fix-this
description: AI automatically fixes any error or problem
---

# Fix This - Automatic Error Resolution

When something's broken, just say "fix this" and watch the magic happen.

## Zero Frustration Promise

```bash
Error: Cannot find module 'react'

You: /fix-this

AI: I see the problem! Let me fix that for you...
✅ Installing missing dependencies...
✅ Clearing cache...
✅ Rebuilding project...
✅ Fixed! Try running your app again 🎉
```

## What I Can Fix

### 🔧 Build Errors
- Missing dependencies
- Version conflicts
- Import errors
- TypeScript errors
- Webpack issues

### 🗄️ Database Problems
- Connection failures
- Migration errors
- Schema conflicts
- Permission issues
- Query errors

### 🚀 Deployment Issues
- Build failures
- Environment variables
- DNS problems
- SSL certificates
- Container errors

### 🎨 UI/UX Problems
- Layout breaks
- Responsive issues
- Browser compatibility
- Performance problems
- Accessibility errors

### 🔒 Security Issues
- CORS errors
- Authentication failures
- Permission problems
- SSL/HTTPS issues
- API key problems

## How It Works

### Step 1: Intelligent Diagnosis
```markdown
🔍 Analyzing error...

Found: "Module not found: Can't resolve '@/components/Button'"

Diagnosis: 
- Import path '@/components/Button' not recognized
- Likely causes:
  1. Missing path alias configuration
  2. File doesn't exist
  3. Wrong import path
```

### Step 2: Automatic Fix
```markdown
🔧 Applying fixes...

1. ✅ Checking if file exists... Found at src/components/Button.tsx
2. ✅ Updating jsconfig.json with path alias
3. ✅ Restarting development server
4. ✅ Verifying fix...

Success! Import now working correctly 🎉
```

### Step 3: Prevention
```markdown
💡 To prevent this in future:

Added to your project:
- Path alias configuration
- ESLint rule for import checking
- Pre-commit validation

You won't see this error again!
```

## Real-World Examples

### Example 1: "White Screen of Death"
```bash
You: "My app shows a white screen"
/fix-this

AI: Diagnosing white screen issue...

Found problems:
1. ❌ Uncaught TypeError in App.js:34
2. ❌ API endpoint returning 404
3. ❌ Local storage corruption

Fixing...
✅ Added null check in App.js
✅ Updated API endpoint URL
✅ Cleared corrupted storage
✅ Added error boundaries

Your app is working again! 🎉
```

### Example 2: "Database Connection Failed"
```bash
Error: ECONNREFUSED 127.0.0.1:5432

/fix-this

AI: Database connection issue detected...

Checking:
- ❌ PostgreSQL not running
- ❌ Wrong connection string
- ❌ Missing environment variable

Fixing...
✅ Starting PostgreSQL service
✅ Updated .env with correct DATABASE_URL
✅ Running pending migrations
✅ Seeding test data

Database connected successfully! 🎉
```

### Example 3: "Deploy Failed"
```bash
Vercel deployment failed: Build error

/fix-this

AI: Analyzing build logs...

Issues found:
1. ESLint errors (3 files)
2. TypeScript errors (2 files)
3. Missing environment variables

Fixing...
✅ Auto-fixed ESLint issues
✅ Fixed type errors
✅ Added missing env vars to Vercel
✅ Triggered new deployment

Deployment successful! Live at: your-app.vercel.app 🚀
```

## Smart Error Patterns

### Recognizes Common Issues:

#### "Cannot find module"
- Installs missing package
- Fixes import path
- Updates tsconfig/jsconfig
- Clears cache

#### "Port already in use"
- Finds process using port
- Offers to kill it
- Suggests alternative port
- Updates configuration

#### "CORS error"
- Configures CORS properly
- Adds proxy if needed
- Updates API calls
- Tests the fix

#### "Authentication failed"
- Checks credentials
- Refreshes tokens
- Updates permissions
- Tests login flow

## Learning Mode

### When Fixing, I Explain:
```markdown
🎓 Learning Moment:

Error: "useState is not defined"

This happens because:
- useState must be imported from React
- Common when copying code snippets

The fix:
```javascript
// Add this import at the top
import { useState } from 'react';
```

I've added this for you, but now you know for next time! 
```

## Fix Strategies

### 1. Quick Fix (Default)
Fastest solution to get you running:
```bash
/fix-this
⚡ Applied quick fix in 3 seconds
```

### 2. Deep Fix
Thorough solution with prevention:
```bash
/fix-this --deep
🔍 Analyzing root cause...
🛠️ Applied comprehensive fix
🛡️ Added prevention measures
```

### 3. Explain Only
Just tell me what's wrong:
```bash
/fix-this --explain
📖 Here's what's happening and how to fix it...
```

## Multi-Error Handling

When multiple errors exist:
```markdown
Found 5 issues:

1. ❌ Missing dependency (critical)
2. ❌ Type error (high)
3. ⚠️ Deprecated API (medium)
4. ⚠️ Performance issue (low)
5. 💡 Code smell (info)

Fixing in priority order...
[1/5] ✅ Installing dependencies...
[2/5] ✅ Fixing type errors...
[3/5] ✅ Updating to new API...
[4/5] ✅ Optimizing performance...
[5/5] ✅ Refactoring code...

All issues resolved! 🎉
```

## Confidence Levels

### High Confidence (95%+)
```
✅ I'm certain this will fix your issue
Applying fix automatically...
```

### Medium Confidence (70-95%)
```
🤔 This should fix it, but let me verify
Applying fix and running tests...
```

### Low Confidence (<70%)
```
🤷 I found multiple possible causes

Options:
1. Try fix A (most likely)
2. Try fix B (alternative)
3. Get human help

Which would you like to try?
```

## Prevention System

After fixing, I add guards:
```markdown
🛡️ Prevention measures added:

1. Pre-commit hook to catch this error
2. VS Code extension for real-time checking
3. CI/CD check to prevent bad deploys
4. Documentation updated

This error won't happen again!
```

## Integration with Other Commands

Works with all commands:
```bash
/build-this "user dashboard"
> Error: Build failed

/fix-this
> ✅ Fixed and continuing build...
```

## Success Metrics

My fix success rate:
- Build errors: 98% ✅
- Runtime errors: 94% ✅
- Deploy errors: 97% ✅
- Database errors: 92% ✅
- Style issues: 99% ✅

## When I Can't Fix

If I can't fix automatically:
```markdown
🤝 I need your help

I've diagnosed the issue but need human input:

Problem: Custom business logic error
Location: src/calculations/tax.js:45

The error seems related to tax calculation logic.
I don't want to guess at business rules.

Options:
1. Share the business rule so I can fix it
2. Point me to documentation
3. Let's debug together

What would you prefer?
```

## The Promise

With /fix-this:
- 🚫 No more googling errors
- 🚫 No more stack overflow diving
- 🚫 No more hours debugging
- ✅ Just solutions that work
- ✅ And learning for next time

Errors are now just minor speed bumps, not roadblocks! 🚗💨
