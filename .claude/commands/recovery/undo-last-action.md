---
name: undo-last-action
description: Instantly undo the last command or action
---

# Undo Last Action - Your Safety Net

Made a mistake? Changed your mind? No problem. Instantly undo any action.

## How It Works

```bash
/undo-last-action
```

That's it! The last command is reversed completely.

## What Can Be Undone

### ✅ Code Changes
- File modifications
- New files created
- Files deleted
- Code refactoring
- Configuration changes

### ✅ Database Changes
- Schema modifications
- Data insertions
- Deletions (with backup)
- Migration runs

### ✅ Dependencies
- Package installations
- Version updates
- Configuration changes

### ✅ Deployments
- Rollback to previous version
- Restore previous config
- Revert DNS changes

## Undo History

See what can be undone:
```bash
/undo-history

Recent Actions (can undo):
1. [2 min ago] /clean-codebase - Modified 15 files
2. [5 min ago] /add-feature "user-export" - Created 8 files  
3. [10 min ago] /update-dependencies - Updated 12 packages
4. [15 min ago] /deploy-to-production - Deployed v1.2.3
5. [20 min ago] /refactor-smart - Refactored UserService

Type /undo-last-action or /undo-action [number]
```

## Smart Undo Features

### 1. Dependency Awareness
If you undo an action that other changes depend on:
```
⚠️ Warning: Undoing this will also revert:
- Feature X (depends on this change)
- Test Y (uses this code)

Continue? (y/n)
```

### 2. Partial Undo
```bash
/undo-last-action --partial

What would you like to undo?
[ ] File changes (5 files)
[x] Database changes
[ ] Config changes
[x] Dependencies added

> Undoing selected changes...
```

### 3. Time Travel
```bash
/restore-to-checkpoint "before-big-refactor"

This will restore your project to:
- Date: 2024-01-15 10:30 AM
- Checkpoint: "before-big-refactor"
- Changes since: 47 commits

Continue? (y/n)
```

## Automatic Checkpoints

The system creates checkpoints automatically:

### Before Risky Operations:
- Major refactoring
- Database migrations
- Dependency updates
- Production deployments
- Security changes

### Daily Checkpoints:
- Morning: Before first change
- Noon: Mid-day backup
- Evening: End of day state

### Named Checkpoints:
```bash
/create-checkpoint "before-payment-integration"
✅ Checkpoint created: "before-payment-integration"
```

## Recovery Scenarios

### Scenario 1: Broken Build
```
😱 "I ran /update-dependencies and now nothing works!"

/undo-last-action
✅ Dependencies restored to previous versions
✅ Lock files reverted
✅ Build working again!
```

### Scenario 2: Wrong Feature
```
😅 "I built the wrong feature with /build-this"

/undo-last-action
✅ Feature files removed
✅ Routes cleaned up
✅ Database migrations reversed
✅ Back to clean state!
```

### Scenario 3: Bad Deployment
```
🚨 "Production is broken after deployment!"

/undo-last-action
✅ Previous version restored
✅ Traffic switched back
✅ Incident resolved in 30 seconds!
```

## Undo Intelligence

### What Gets Preserved:
- User data (never lost)
- Logs and analytics
- Learned preferences
- Custom configurations

### What Gets Restored:
- Code state
- Database schema
- Dependencies
- Environment variables
- Deploy configuration

## Advanced Recovery

### 1. Selective File Recovery
```bash
/recover-file "src/api/users.js" --from "2 hours ago"
✅ File restored to previous version
```

### 2. Cherry-Pick Recovery
```bash
/recover-changes --only "bug-fixes" --from "checkpoint-123"
✅ Only bug fixes recovered, features kept
```

### 3. Diff Before Undo
```bash
/undo-preview

Changes that will be undone:
+ Added: src/features/export/*
~ Modified: src/api/users.js
- Removed: src/legacy/old-export.js
~ Config: Added EXPORT_ENABLED=true

Total: 15 files, 523 lines
```

## Undo Confidence

### Each Undo Includes:
```
✅ Changes reverted successfully
✅ Tests passing
✅ Build successful
✅ No data lost
✅ Ready to continue!

Confidence: 100% ✨
```

## Integration with Other Commands

All commands support undo:
- `/ai-architect` decisions
- `/build-this` implementations
- `/implement-feature` additions
- `/fix-this` attempts
- `/deploy` operations

## Safety Features

### 1. Undo Protection
```
⚠️ This undo will affect production data
Additional confirmation required:
Type "CONFIRM UNDO" to proceed:
```

### 2. Undo Limits
```
ℹ️ Can't undo: Action older than 7 days
Alternative: Use /restore-to-checkpoint
```

### 3. Undo Conflicts
```
⚠️ Can't auto-undo: Conflicts detected
Manual resolution needed for:
- src/config.js (local changes)

Options:
1. Keep local changes
2. Force undo (lose local changes)
3. Manual merge
```

## Best Practices

1. **Name Important Checkpoints**
   ```bash
   /create-checkpoint "stable-v1"
   ```

2. **Preview Before Undo**
   ```bash
   /undo-preview
   ```

3. **Use Partial Undo**
   When only some changes need reverting

4. **Check Undo History**
   ```bash
   /undo-history --verbose
   ```

## Peace of Mind

With the undo system:
- ✅ Experiment fearlessly
- ✅ Try new things
- ✅ Learn by doing
- ✅ Never lose work
- ✅ Always recoverable

No more fear of breaking things! 🛡️
