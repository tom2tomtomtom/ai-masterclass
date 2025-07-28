---
name: rollback-safe
description: Instant database rollback with data integrity verification
---

# Rollback Safe

Safely rollback database changes with confidence and data integrity checks.

## 1. Pre-Rollback Analysis

### 1.1 Current State Assessment
```javascript
// Capture current state before rollback
const currentState = {
  migrationVersion: await getCurrentMigrationVersion(),
  rowCounts: await getTableRowCounts(),
  schemaSnapshot: await getSchemaSnapshot(),
  activeConnections: await getActiveConnections(),
  runningQueries: await getRunningQueries()
};

// Verify we can rollback
if (currentState.runningQueries.some(q => q.isWriting)) {
  console.error('⚠️  Active write operations detected. Waiting...');
  await waitForQueries(currentState.runningQueries);
}
```

### 1.2 Rollback Safety Check
```javascript
function canSafelyRollback(migration) {
  const checks = {
    hasDownMigration: fs.existsSync(migration.downFile),
    noDataDependencies: !hasDataDependencies(migration),
    backupAvailable: checkBackupExists(migration.version),
    noActiveTransactions: getActiveTransactionCount() === 0
  };
  
  const issues = [];
  
  if (!checks.hasDownMigration) {
    issues.push('No down migration file found');
  }
  
  if (!checks.noDataDependencies) {
    issues.push('Other migrations depend on this one');
  }
  
  if (!checks.backupAvailable) {
    issues.push('No backup available for safety');
  }
  
  return {
    canRollback: issues.length === 0,
    issues,
    checks
  };
}
```

## 2. Create Safety Checkpoint

### 2.1 Backup Current Data
```bash
#!/bin/bash
# Create rollback checkpoint

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="rollback_checkpoints/${TIMESTAMP}"

mkdir -p "$BACKUP_DIR"

# Backup database
pg_dump \
  --no-owner \
  --no-acl \
  --if-exists \
  --clean \
  "$DATABASE_URL" > "$BACKUP_DIR/database.sql"

# Backup application state
cp .env "$BACKUP_DIR/.env.backup"
git rev-parse HEAD > "$BACKUP_DIR/git_commit.txt"

# Create restore script
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash
echo "🔄 Restoring from checkpoint..."
psql "$DATABASE_URL" < database.sql
cp .env.backup ../.env
echo "✅ Checkpoint restored"
EOF

chmod +x "$BACKUP_DIR/restore.sh"
```

## 3. Execute Rollback

### 3.1 Run Down Migration
```javascript
async function executeRollback(migration) {
  const rollbackLog = {
    startTime: new Date(),
    migration: migration.version,
    steps: [],
    errors: []
  };
  
  try {
    // 1. Notify monitoring
    await notifyMonitoring('rollback_started', migration);
    
    // 2. Set application to maintenance mode
    await setMaintenanceMode(true);
    rollbackLog.steps.push('Maintenance mode enabled');
    
    // 3. Close active connections
    await closeUserConnections();
    rollbackLog.steps.push('User connections closed');
    
    // 4. Execute down migration
    console.log('⬇️  Executing rollback migration...');
    const downSql = fs.readFileSync(migration.downFile, 'utf8');
    
    await db.transaction(async (trx) => {
      // Run in transaction for atomicity
      const statements = downSql.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        await trx.raw(statement);
        rollbackLog.steps.push(`Executed: ${statement.substring(0, 50)}...`);
      }
    });
    
    // 5. Update migration version
    await updateMigrationVersion(migration.previousVersion);
    rollbackLog.steps.push('Migration version updated');
    
    // 6. Clear caches
    await clearApplicationCaches();
    rollbackLog.steps.push('Caches cleared');
    
    rollbackLog.success = true;
    
  } catch (error) {
    rollbackLog.success = false;
    rollbackLog.error = error.message;
    rollbackLog.errors.push({
      step: rollbackLog.steps.length,
      error: error.message,
      stack: error.stack
    });
    
    // Attempt recovery from checkpoint
    await restoreFromCheckpoint();
    
  } finally {
    // Always disable maintenance mode
    await setMaintenanceMode(false);
    rollbackLog.endTime = new Date();
    rollbackLog.duration = rollbackLog.endTime - rollbackLog.startTime;
    
    // Save rollback log
    await saveRollbackLog(rollbackLog);
  }
  
  return rollbackLog;
}
```

### 3.2 Verify Rollback Success
```javascript
async function verifyRollback(beforeState, afterState) {
  const verifications = [];
  
  // Schema verification
  verifications.push({
    name: 'Schema restored',
    check: () => {
      const before = beforeState.schemaSnapshot;
      const after = afterState.schemaSnapshot;
      return JSON.stringify(before) === JSON.stringify(after);
    }
  });
  
  // Data integrity
  verifications.push({
    name: 'Data integrity maintained',
    check: async () => {
      // Check row counts
      for (const [table, count] of Object.entries(beforeState.rowCounts)) {
        const currentCount = await db(table).count('* as count');
        if (currentCount[0].count < count * 0.99) {
          throw new Error(`Data loss in ${table}: ${count} -> ${currentCount[0].count}`);
        }
      }
      return true;
    }
  });
  
  // Application health
  verifications.push({
    name: 'Application healthy',
    check: async () => {
      const health = await fetch('/health');
      return health.status === 200;
    }
  });
  
  // Run verifications
  const results = [];
  for (const verification of verifications) {
    try {
      const passed = await verification.check();
      results.push({
        name: verification.name,
        passed,
        error: null
      });
    } catch (error) {
      results.push({
        name: verification.name,
        passed: false,
        error: error.message
      });
    }
  }
  
  return results;
}
```

## 4. Recovery Procedures

### 4.1 Automatic Recovery
```javascript
// auto-recovery.js
async function autoRecover(error) {
  console.log('🚨 Rollback failed, attempting auto-recovery...');
  
  const recoverySteps = [
    {
      name: 'Restore from checkpoint',
      action: async () => {
        const latestCheckpoint = await findLatestCheckpoint();
        await restoreCheckpoint(latestCheckpoint);
      }
    },
    {
      name: 'Repair schema inconsistencies',
      action: async () => {
        await repairSchema();
      }
    },
    {
      name: 'Rebuild indexes',
      action: async () => {
        await rebuildIndexes();
      }
    },
    {
      name: 'Verify foreign keys',
      action: async () => {
        await verifyForeignKeys();
      }
    }
  ];
  
  for (const step of recoverySteps) {
    try {
      console.log(`🔧 ${step.name}...`);
      await step.action();
      console.log(`✅ ${step.name} successful`);
    } catch (stepError) {
      console.error(`❌ ${step.name} failed:`, stepError.message);
    }
  }
}
```

### 4.2 Manual Recovery Guide
```markdown
## Manual Recovery Procedures

### If Automatic Recovery Fails:

1. **Stop all services**
   ```bash
   systemctl stop myapp
   systemctl stop myapp-workers
   ```

2. **Restore from backup**
   ```bash
   cd rollback_checkpoints/latest
   ./restore.sh
   ```

3. **Verify database**
   ```sql
   -- Check for corruption
   SELECT schemaname, tablename 
   FROM pg_tables 
   WHERE schemaname = 'public';
   
   -- Verify row counts
   SELECT relname, n_live_tup 
   FROM pg_stat_user_tables;
   ```

4. **Restart services**
   ```bash
   systemctl start myapp
   systemctl start myapp-workers
   ```

5. **Monitor logs**
   ```bash
   tail -f /var/log/myapp/*.log
   ```
```

## 5. Post-Rollback Actions

### 5.1 Notification and Monitoring
```javascript
async function postRollbackActions(rollbackResult) {
  // Notify team
  await sendNotification({
    channel: 'deployments',
    level: rollbackResult.success ? 'warning' : 'critical',
    message: `Database rollback ${rollbackResult.success ? 'completed' : 'failed'}`,
    details: rollbackResult
  });
  
  // Enhanced monitoring
  await enableEnhancedMonitoring({
    duration: '2h',
    metrics: [
      'error_rate',
      'response_time',
      'database_connections',
      'query_performance'
    ],
    alertThreshold: 0.8 // Lower threshold for quick detection
  });
  
  // Create incident report
  await createIncidentReport({
    type: 'rollback',
    trigger: rollbackResult.trigger,
    impact: await assessImpact(),
    resolution: rollbackResult.steps,
    followUp: [
      'Root cause analysis',
      'Update rollback procedures',
      'Test in staging environment'
    ]
  });
}
```

## 6. Rollback Report

### 6.1 Generate Rollback Summary
```markdown
# Rollback Report

## Summary
- **Rollback Started**: 2024-01-15 14:30:00 UTC
- **Rollback Completed**: 2024-01-15 14:31:45 UTC
- **Duration**: 1m 45s
- **Status**: ✅ Successful

## Migration Rolled Back
- **Version**: 20240115103000_add_user_verification
- **Original Applied**: 2024-01-15 10:00:00 UTC
- **Reason**: Performance degradation detected

## Verification Results
| Check | Status | Details |
|-------|--------|---------|
| Schema Restored | ✅ | All changes reverted |
| Data Integrity | ✅ | No data loss detected |
| Foreign Keys | ✅ | All relationships intact |
| Application Health | ✅ | All endpoints responding |

## Impact Assessment
- **Downtime**: 1m 45s
- **Affected Users**: ~2,500 (during maintenance window)
- **Failed Requests**: 127
- **Data Loss**: None

## Follow-Up Actions
1. [ ] Root cause analysis
2. [ ] Fix migration issues
3. [ ] Test in staging
4. [ ] Schedule retry

## Logs
- Full rollback log: `/var/log/rollbacks/20240115_143000.log`
- Database backup: `/backups/pre_rollback_20240115_143000.sql`
```

Save rollback metadata for analysis.