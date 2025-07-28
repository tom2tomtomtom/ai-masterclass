---
name: generate-migration
description: Auto-generate database migrations with rollback scripts
---

# Generate Migration

Automatically create forward and backward database migrations from model changes.

## 1. Detect Changes

### 1.1 Analyze Current Models
```javascript
// Scan for model definitions
const models = {
  // Prisma
  prisma: parsePrismaSchema('./prisma/schema.prisma'),
  
  // Sequelize
  sequelize: parseSequelizeModels('./models'),
  
  // TypeORM
  typeorm: parseTypeORMEntities('./src/entities'),
  
  // Mongoose
  mongoose: parseMongooseSchemas('./models'),
  
  // Django
  django: parseDjangoModels('./models.py'),
  
  // Rails
  rails: parseRailsModels('./app/models')
};
```

### 1.2 Compare with Database
```javascript
async function detectChanges() {
  const currentSchema = await introspectDatabase();
  const desiredSchema = parseModels();
  
  const changes = {
    tables: {
      added: [],
      removed: [],
      modified: []
    },
    columns: {
      added: [],
      removed: [],
      modified: []
    },
    indexes: {
      added: [],
      removed: []
    },
    constraints: {
      added: [],
      removed: []
    }
  };
  
  // Compare tables
  for (const table of desiredSchema.tables) {
    if (!currentSchema.tables.find(t => t.name === table.name)) {
      changes.tables.added.push(table);
    }
  }
  
  // Compare columns
  for (const table of currentSchema.tables) {
    const desiredTable = desiredSchema.tables.find(t => t.name === table.name);
    if (desiredTable) {
      const columnChanges = compareColumns(table.columns, desiredTable.columns);
      changes.columns.added.push(...columnChanges.added);
      changes.columns.removed.push(...columnChanges.removed);
      changes.columns.modified.push(...columnChanges.modified);
    }
  }
  
  return changes;
}
```

## 2. Generate Migration Files

### 2.1 SQL Migrations
```sql
-- Migration: 20240115103000_add_user_verification.sql
-- Generated: 2024-01-15T10:30:00Z

-- ====== UP MIGRATION ======
BEGIN;

-- Add email_verified column
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE NOT NULL;

-- Add verification_token column
ALTER TABLE users 
ADD COLUMN verification_token VARCHAR(255) UNIQUE;

-- Add verified_at timestamp
ALTER TABLE users 
ADD COLUMN verified_at TIMESTAMP;

-- Create index for faster token lookups
CREATE INDEX idx_users_verification_token 
ON users(verification_token) 
WHERE verification_token IS NOT NULL;

-- Add check constraint
ALTER TABLE users 
ADD CONSTRAINT chk_verified_consistency 
CHECK (
  (email_verified = TRUE AND verified_at IS NOT NULL) OR
  (email_verified = FALSE AND verified_at IS NULL)
);

COMMIT;

-- ====== DOWN MIGRATION ======
BEGIN;

-- Drop constraint first
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS chk_verified_consistency;

-- Drop index
DROP INDEX IF EXISTS idx_users_verification_token;

-- Drop columns
ALTER TABLE users 
DROP COLUMN IF EXISTS verified_at,
DROP COLUMN IF EXISTS verification_token,
DROP COLUMN IF EXISTS email_verified;

COMMIT;
```

### 2.2 ORM-Specific Migrations

#### Prisma Migration
```javascript
// migrations/20240115103000_add_user_verification/migration.ts
export async function up(prisma) {
  // Add fields
  await prisma.$executeRaw`
    ALTER TABLE "User" 
    ADD COLUMN "emailVerified" BOOLEAN DEFAULT false NOT NULL,
    ADD COLUMN "verificationToken" TEXT,
    ADD COLUMN "verifiedAt" TIMESTAMP
  `;
  
  // Add unique constraint
  await prisma.$executeRaw`
    CREATE UNIQUE INDEX "User_verificationToken_key" 
    ON "User"("verificationToken")
  `;
}

export async function down(prisma) {
  // Remove constraint
  await prisma.$executeRaw`
    DROP INDEX "User_verificationToken_key"
  `;
  
  // Remove fields
  await prisma.$executeRaw`
    ALTER TABLE "User" 
    DROP COLUMN "emailVerified",
    DROP COLUMN "verificationToken",
    DROP COLUMN "verifiedAt"
  `;
}
```

#### Django Migration
```python
# migrations/0002_add_user_verification.py
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='email_verified',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='verification_token',
            field=models.CharField(max_length=255, unique=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='verified_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(
                fields=['verification_token'],
                condition=models.Q(verification_token__isnull=False),
                name='idx_verification_token'
            ),
        ),
    ]
```

## 3. Data Migration

### 3.1 Handle Existing Data
```javascript
// data-migration.js
export async function migrateExistingData(db) {
  // For NOT NULL columns, provide defaults
  await db.transaction(async (trx) => {
    // Count existing records
    const userCount = await trx('users').count('* as count');
    console.log(`Migrating ${userCount[0].count} users...`);
    
    // Set default values for existing records
    await trx('users')
      .update({
        email_verified: false,
        verification_token: null,
        verified_at: null
      });
    
    // For users who have confirmed emails via old system
    const confirmedUsers = await trx('email_confirmations')
      .select('user_id', 'confirmed_at');
    
    for (const user of confirmedUsers) {
      await trx('users')
        .where('id', user.user_id)
        .update({
          email_verified: true,
          verified_at: user.confirmed_at
        });
    }
  });
}
```

### 3.2 Validation Script
```javascript
// validate-migration.js
export async function validateMigration(db) {
  const tests = [
    {
      name: 'All users have email_verified field',
      test: async () => {
        const result = await db('users')
          .whereNull('email_verified')
          .count('* as count');
        return result[0].count === 0;
      }
    },
    {
      name: 'Verified users have verified_at timestamp',
      test: async () => {
        const result = await db('users')
          .where('email_verified', true)
          .whereNull('verified_at')
          .count('* as count');
        return result[0].count === 0;
      }
    },
    {
      name: 'Verification tokens are unique',
      test: async () => {
        const result = await db.raw(`
          SELECT verification_token, COUNT(*) as count
          FROM users
          WHERE verification_token IS NOT NULL
          GROUP BY verification_token
          HAVING COUNT(*) > 1
        `);
        return result.rows.length === 0;
      }
    }
  ];
  
  const results = [];
  for (const { name, test } of tests) {
    try {
      const passed = await test();
      results.push({ name, passed, error: null });
    } catch (error) {
      results.push({ name, passed: false, error: error.message });
    }
  }
  
  return results;
}
```

## 4. Safety Checks

### 4.1 Migration Analysis
```javascript
function analyzeMigration(migration) {
  const analysis = {
    risk: 'low', // low, medium, high
    dataLoss: false,
    downtime: false,
    requiresLock: false,
    estimatedTime: '< 1s',
    warnings: [],
    blockers: []
  };
  
  // Check for dangerous operations
  if (migration.includes('DROP TABLE')) {
    analysis.risk = 'high';
    analysis.dataLoss = true;
    analysis.blockers.push('Dropping tables will lose all data');
  }
  
  if (migration.includes('DROP COLUMN')) {
    analysis.risk = 'high';
    analysis.dataLoss = true;
    analysis.warnings.push('Dropping columns will lose data');
  }
  
  if (migration.includes('ALTER TABLE') && migration.includes('NOT NULL')) {
    analysis.warnings.push('Adding NOT NULL requires default or data migration');
  }
  
  if (migration.includes('RENAME')) {
    analysis.risk = 'medium';
    analysis.warnings.push('Renaming requires application code updates');
  }
  
  // Estimate time based on table size
  const tableSize = await getTableSize(tableName);
  if (tableSize > 1000000) {
    analysis.estimatedTime = `~${Math.ceil(tableSize / 1000000)}min`;
    analysis.requiresLock = true;
    analysis.downtime = true;
  }
  
  return analysis;
}
```

### 4.2 Rollback Plan
```javascript
// rollback-plan.js
export const rollbackPlan = {
  automatic: {
    enabled: true,
    conditions: [
      'Application fails health check',
      'Error rate > 5%',
      'Response time > 2x baseline'
    ],
    procedure: 'Run down migration automatically'
  },
  
  manual: {
    command: 'npm run migrate:rollback',
    steps: [
      '1. Verify current migration state',
      '2. Run rollback migration',
      '3. Verify data integrity',
      '4. Deploy previous code version',
      '5. Monitor for 30 minutes'
    ]
  },
  
  verification: {
    preRollback: [
      'Backup current data',
      'Document current state',
      'Notify team'
    ],
    postRollback: [
      'Verify data consistency',
      'Run integration tests',
      'Check application health'
    ]
  }
};
```

## 5. Migration Testing

### 5.1 Test Migration Script
```bash
#!/bin/bash
# test-migration.sh

echo "🧪 Testing migration..."

# Create test database
createdb test_migration_db

# Copy production schema
pg_dump -s production_db | psql test_migration_db

# Copy sample data
pg_dump -a -t users -t orders production_db | 
  head -n 10000 | 
  psql test_migration_db

# Run up migration
echo "⬆️  Running UP migration..."
psql test_migration_db < migrations/up.sql

# Validate
node validate-migration.js test_migration_db

# Run down migration
echo "⬇️  Running DOWN migration..."
psql test_migration_db < migrations/down.sql

# Verify rollback
echo "🔍 Verifying rollback..."
if psql test_migration_db -c "\d users" | grep -q "email_verified"; then
  echo "❌ Rollback failed - column still exists"
  exit 1
fi

# Cleanup
dropdb test_migration_db

echo "✅ Migration test passed!"
```

## 6. Generate Migration Package

### 6.1 Create Migration Bundle
```
migrations/
├── 20240115103000_add_user_verification/
│   ├── up.sql
│   ├── down.sql
│   ├── data-migration.js
│   ├── validate.js
│   ├── README.md
│   └── rollback-plan.md
```

### 6.2 Migration README
```markdown
# Migration: Add User Verification

## Overview
- **Date**: 2024-01-15
- **Author**: Auto-generated
- **Risk Level**: Low
- **Estimated Time**: < 1 minute
- **Downtime Required**: No

## Changes
1. Add `email_verified` boolean column to users table
2. Add `verification_token` unique string column
3. Add `verified_at` timestamp column
4. Create index on verification_token

## Testing
```bash
# Test on staging
./test-migration.sh staging

# Test rollback
./test-rollback.sh staging
```

## Deployment
1. Run migration: `npm run migrate:up`
2. Deploy new code
3. Monitor for 30 minutes
4. If issues: `npm run migrate:down`
```

Save migration metadata for tracking.
