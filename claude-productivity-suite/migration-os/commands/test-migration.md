---
name: test-migration
description: Test migrations safely with production-like data
---

# Test Migration

Test database migrations thoroughly before applying to production.

## 1. Test Environment Setup

### 1.1 Create Test Database
```bash
#!/bin/bash
# setup-test-db.sh

# Database-specific setup
case "$DB_TYPE" in
  "postgres")
    createdb "${DB_NAME}_migration_test"
    pg_dump -s "$PROD_DB_NAME" | psql "${DB_NAME}_migration_test"
    ;;
  
  "mysql")
    mysql -e "CREATE DATABASE ${DB_NAME}_migration_test"
    mysqldump --no-data "$PROD_DB_NAME" | mysql "${DB_NAME}_migration_test"
    ;;
  
  "mongodb")
    mongodump --db="$PROD_DB_NAME" --excludeCollection=sessions
    mongorestore --db="${DB_NAME}_migration_test" dump/"$PROD_DB_NAME"
    ;;
esac
```

### 1.2 Load Test Data
```javascript
// load-test-data.js
async function loadTestData(sourceDb, testDb) {
  const config = {
    // Sample size for each table
    sampleSizes: {
      users: 10000,
      orders: 50000,
      products: 5000,
      // Large tables - take smaller sample
      audit_logs: 1000,
      sessions: 100
    },
    
    // Anonymize sensitive data
    anonymize: {
      users: ['email', 'phone', 'ssn'],
      orders: ['credit_card', 'billing_address']
    }
  };
  
  // Load and anonymize data
  for (const [table, size] of Object.entries(config.sampleSizes)) {
    await loadTableData(table, size, config.anonymize[table]);
  }
}
```

## 2. Run Migration Tests

### 2.1 Performance Testing
Test migration on different data sizes:
- Small dataset (1K rows)
- Medium dataset (100K rows)  
- Large dataset (1M+ rows)

Measure:
- Execution time
- Lock duration
- Memory usage
- Query performance impact

### 2.2 Data Integrity Testing
Verify after migration:
- Row counts unchanged
- No data loss
- Foreign keys intact
- Constraints satisfied
- Business logic preserved

### 2.3 Concurrent Access Testing
Test migration with:
- Active read queries
- Active write operations
- Multiple connections
- Transaction conflicts

## 3. Rollback Testing

### 3.1 Test Rollback
- Take snapshot before migration
- Run UP migration
- Verify changes applied
- Run DOWN migration
- Compare with original snapshot
- Ensure complete restoration

### 3.2 Partial Rollback
Test rollback scenarios:
- Mid-migration failure
- After partial completion
- With dirty data
- Under load

## 4. Edge Case Testing

### 4.1 Large Tables
- Tables with millions of rows
- Tables with many indexes
- Tables with complex constraints
- Partitioned tables

### 4.2 Special Data Types
- JSON/JSONB columns
- Array columns
- Custom types
- Binary data

### 4.3 Replication Testing
- Test on replica
- Verify replication lag
- Check consistency
- Test failover scenario

## 5. Generate Test Report

### 5.1 Performance Metrics
```markdown
## Performance Test Results
- Small Dataset: 0.2s (no locks)
- Medium Dataset: 2.1s (0.5s lock)
- Large Dataset: 45s (12s lock)

## Query Impact
- SELECT queries: +2% latency
- INSERT queries: No impact
- UPDATE queries: +5% latency during migration
```

### 5.2 Safety Validation
```markdown
## Data Integrity ✅
- Row count verified: 1,234,567
- Foreign keys valid: 100%
- Constraints satisfied: All passing
- Business rules: Verified

## Rollback Test ✅
- Rollback duration: 1.5s
- Data restored: 100%
- No orphaned data
```

### 5.3 Risk Assessment
```markdown
## Migration Risk: LOW
- No data loss risk
- Minimal downtime (< 1 min)
- Rollback tested successfully
- Performance impact acceptable

## Recommendations
1. Run during low-traffic window
2. Monitor for 30 minutes post-deployment
3. Have rollback script ready
```

Generate complete test results in `migration-test-results.md`