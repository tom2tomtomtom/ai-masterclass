---
name: reproduce-error
description: Reproduce production errors locally with full context
---

# Reproduce Error

Capture and recreate production errors in your local environment for debugging.

## 1. Error Capture

### 1.1 Extract Error Context
```javascript
// Extract from error tracking service
async function captureErrorContext(errorId) {
  const errorData = await errorTracker.getError(errorId);
  
  return {
    // Error details
    error: {
      message: errorData.message,
      stack: errorData.stack,
      type: errorData.type,
      code: errorData.code
    },
    
    // Environment context
    environment: {
      nodeVersion: errorData.context.runtime,
      memory: errorData.context.memory,
      cpu: errorData.context.cpu,
      env: sanitizeEnvVars(errorData.context.env)
    },
    
    // Request context
    request: {
      method: errorData.request?.method,
      path: errorData.request?.path,
      headers: errorData.request?.headers,
      body: errorData.request?.body,
      query: errorData.request?.query,
      params: errorData.request?.params,
      user: errorData.request?.user
    },
    
    // Application state
    state: {
      database: errorData.state?.database,
      cache: errorData.state?.cache,
      session: errorData.state?.session,
      features: errorData.state?.features
    },
    
    // Timeline
    timeline: errorData.breadcrumbs || [],
    
    // Related data
    relatedData: await fetchRelatedData(errorData)
  };
}

async function fetchRelatedData(errorData) {
  const related = {};
  
  // Fetch user data if user was logged in
  if (errorData.userId) {
    related.user = await db('users')
      .where('id', errorData.userId)
      .first();
  }
  
  // Fetch related records mentioned in error
  const recordIds = extractRecordIds(errorData.stack);
  for (const { table, id } of recordIds) {
    related[`${table}_${id}`] = await db(table)
      .where('id', id)
      .first();
  }
  
  return related;
}
```

### 1.2 Create Reproduction Environment
```javascript
// setup-repro-env.js
async function setupReproductionEnvironment(errorContext) {
  console.log('🔧 Setting up reproduction environment...');
  
  // 1. Create isolated database
  const reproDb = `repro_${errorContext.error.id}`;
  await createDatabase(reproDb);
  
  // 2. Import relevant data
  await importProductionData(reproDb, {
    users: [errorContext.relatedData.user],
    // Import related records
    ...errorContext.relatedData
  });
  
  // 3. Set environment variables
  const envFile = `.env.repro`;
  const envVars = {
    ...errorContext.environment.env,
    DATABASE_URL: `postgresql://localhost/${reproDb}`,
    NODE_ENV: 'reproduction',
    DEBUG: '*',
    ERROR_REPRO_MODE: 'true'
  };
  
  fs.writeFileSync(envFile, 
    Object.entries(envVars)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')
  );
  
  // 4. Setup application state
  await setupApplicationState(errorContext.state);
  
  return {
    database: reproDb,
    envFile,
    stateRestored: true
  };
}
```

## 2. State Recreation

### 2.1 Database State
```javascript
async function recreateDatabaseState(errorContext) {
  const { timestamp, queries } = errorContext.timeline
    .filter(event => event.type === 'database')
    .reverse(); // Work backwards from error
  
  // Replay database operations
  for (const query of queries) {
    try {
      await db.raw(query.sql, query.bindings);
      console.log(`✅ Replayed: ${query.sql.substring(0, 50)}...`);
    } catch (err) {
      console.warn(`⚠️  Could not replay query: ${err.message}`);
    }
  }
  
  // Set specific record states
  if (errorContext.state.database) {
    for (const [table, records] of Object.entries(errorContext.state.database)) {
      for (const record of records) {
        await db(table)
          .where('id', record.id)
          .update(record);
      }
    }
  }
}
```

### 2.2 Cache State
```javascript
async function recreateCacheState(errorContext) {
  const redis = new Redis(process.env.REDIS_URL);
  
  // Clear existing cache
  await redis.flushdb();
  
  // Restore cache entries
  if (errorContext.state.cache) {
    for (const [key, value] of Object.entries(errorContext.state.cache)) {
      if (value.ttl) {
        await redis.setex(key, value.ttl, JSON.stringify(value.data));
      } else {
        await redis.set(key, JSON.stringify(value.data));
      }
    }
  }
  
  console.log(`✅ Restored ${Object.keys(errorContext.state.cache).length} cache entries`);
}
```

### 2.3 Session State
```javascript
async function recreateSessionState(errorContext) {
  if (!errorContext.state.session) return;
  
  // Create session file or database entry
  const sessionId = errorContext.request?.sessionId;
  if (sessionId) {
    await sessionStore.set(sessionId, {
      ...errorContext.state.session,
      reproductionMode: true
    });
  }
}
```

## 3. Request Replay

### 3.1 Generate Replay Script
```javascript
function generateReplayScript(errorContext) {
  const script = `
#!/usr/bin/env node
// Auto-generated replay script for error ${errorContext.error.id}

const axios = require('axios');

async function replayRequest() {
  try {
    const response = await axios({
      method: '${errorContext.request.method}',
      url: 'http://localhost:3000${errorContext.request.path}',
      headers: ${JSON.stringify(errorContext.request.headers, null, 2)},
      params: ${JSON.stringify(errorContext.request.query, null, 2)},
      data: ${JSON.stringify(errorContext.request.body, null, 2)}
    });
    
    console.log('Response:', response.status, response.data);
  } catch (error) {
    console.error('Error reproduced!');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    // Compare with original
    if (error.message === '${errorContext.error.message}') {
      console.log('✅ Successfully reproduced the exact error!');
    } else {
      console.log('⚠️  Different error occurred');
    }
  }
}

// Replay timeline events first
async function replayTimeline() {
  const timeline = ${JSON.stringify(errorContext.timeline, null, 2)};
  
  for (const event of timeline) {
    console.log(\`Replaying: \${event.type} - \${event.message}\`);
    
    switch (event.type) {
      case 'http':
        await axios({
          method: event.data.method,
          url: \`http://localhost:3000\${event.data.path}\`,
          data: event.data.body
        }).catch(() => {});
        break;
        
      case 'database':
        // Database operations already replayed
        break;
        
      case 'custom':
        console.log('Custom event:', event.data);
        break;
    }
    
    // Respect timing
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function main() {
  console.log('🔄 Replaying error scenario...');
  
  // Wait for services to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Replay timeline
  await replayTimeline();
  
  // Replay the error-causing request
  await replayRequest();
}

main().catch(console.error);
`;

  fs.writeFileSync('replay-error.js', script);
  fs.chmodSync('replay-error.js', '755');
  
  return 'replay-error.js';
}
```

### 3.2 Interactive Replay
```javascript
// interactive-replay.js
async function interactiveReplay(errorContext) {
  const repl = require('repl');
  
  console.log('🔍 Interactive Error Reproduction Mode');
  console.log('=====================================');
  console.log(`Error: ${errorContext.error.message}`);
  console.log(`Location: ${errorContext.error.stack.split('\n')[1]}`);
  console.log('');
  console.log('Available commands:');
  console.log('  replay() - Replay the request');
  console.log('  state() - Show current state');
  console.log('  timeline() - Show event timeline');
  console.log('  debug() - Start debugger at error point');
  
  const replServer = repl.start('debug> ');
  
  // Add debugging helpers
  replServer.context.errorContext = errorContext;
  replServer.context.replay = async () => {
    await replayRequest(errorContext);
  };
  
  replServer.context.state = () => {
    console.log('Current State:', JSON.stringify(errorContext.state, null, 2));
  };
  
  replServer.context.timeline = () => {
    errorContext.timeline.forEach((event, i) => {
      console.log(`${i}: [${event.timestamp}] ${event.type} - ${event.message}`);
    });
  };
  
  replServer.context.debug = async () => {
    // Set breakpoint at error location
    const errorFile = extractFileFromStack(errorContext.error.stack);
    const errorLine = extractLineFromStack(errorContext.error.stack);
    
    console.log(`Setting breakpoint at ${errorFile}:${errorLine}`);
    require('inspector').open();
  };
}
```

## 4. Debugging Tools

### 4.1 Time Travel Debugging
```javascript
class TimeTravelDebugger {
  constructor(errorContext) {
    this.timeline = errorContext.timeline;
    this.currentIndex = 0;
    this.states = [];
  }
  
  async replayTo(index) {
    // Reset to initial state
    await this.reset();
    
    // Replay events up to index
    for (let i = 0; i <= index && i < this.timeline.length; i++) {
      await this.replayEvent(this.timeline[i]);
      this.currentIndex = i;
      
      // Capture state snapshot
      this.states[i] = await this.captureState();
    }
    
    console.log(`⏮️  Replayed to event ${index}: ${this.timeline[index].message}`);
  }
  
  async stepForward() {
    if (this.currentIndex < this.timeline.length - 1) {
      this.currentIndex++;
      await this.replayEvent(this.timeline[this.currentIndex]);
      console.log(`⏭️  Step ${this.currentIndex}: ${this.timeline[this.currentIndex].message}`);
    }
  }
  
  async stepBackward() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      await this.restoreState(this.states[this.currentIndex]);
      console.log(`⏮️  Back to ${this.currentIndex}: ${this.timeline[this.currentIndex].message}`);
    }
  }
  
  showCurrentState() {
    const event = this.timeline[this.currentIndex];
    console.log(`
📍 Current Position: ${this.currentIndex}/${this.timeline.length - 1}
🕐 Timestamp: ${event.timestamp}
📝 Event: ${event.type} - ${event.message}
📊 State: ${JSON.stringify(this.states[this.currentIndex], null, 2)}
    `);
  }
}
```

### 4.2 Comparison Debugging
```javascript
async function compareWithProduction(errorContext, localResult) {
  const comparison = {
    error: {
      production: errorContext.error,
      local: localResult.error
    },
    
    environment: compareEnvironments(
      errorContext.environment,
      await captureLocalEnvironment()
    ),
    
    state: {
      database: await compareDatabaseStates(),
      cache: await compareCacheStates()
    },
    
    timeline: compareTimelines(
      errorContext.timeline,
      localResult.timeline
    )
  };
  
  // Generate visual diff
  const diff = generateDiff(comparison);
  
  console.log('📊 Production vs Local Comparison:');
  console.log(diff);
  
  // Identify key differences
  const keyDifferences = identifyKeyDifferences(comparison);
  if (keyDifferences.length > 0) {
    console.log('\n🔍 Key Differences Found:');
    keyDifferences.forEach(diff => {
      console.log(`  - ${diff.path}: ${diff.production} → ${diff.local}`);
    });
  }
  
  return comparison;
}
```

## 5. Fix Verification

### 5.1 Test Fix
```javascript
async function testFix(errorContext, fixCode) {
  console.log('🧪 Testing fix...');
  
  // Apply fix
  await applyFix(fixCode);
  
  // Replay scenario
  const result = await replayError(errorContext);
  
  if (result.success) {
    console.log('✅ Fix verified! Error no longer occurs.');
    
    // Run regression tests
    const regressionResults = await runRegressionTests();
    if (regressionResults.passed) {
      console.log('✅ All regression tests passed');
    } else {
      console.log('⚠️  Some regression tests failed:', regressionResults.failures);
    }
    
    return { success: true, regressionSafe: regressionResults.passed };
  } else {
    console.log('❌ Fix did not resolve the error');
    console.log('New error:', result.error.message);
    return { success: false, newError: result.error };
  }
}
```

## 6. Generate Debug Report

### 6.1 Reproduction Summary
```markdown
# Error Reproduction Report

## Error Details
- **ID**: err_k3j4h5k6
- **Message**: Cannot read property 'email' of undefined
- **Location**: /src/services/userService.js:45:23
- **Timestamp**: 2024-01-15T10:30:45Z
- **User**: user_123 (john@example.com)

## Reproduction Status: ✅ Successfully Reproduced

## Environment Comparison
| Aspect | Production | Local |
|--------|------------|-------|
| Node Version | v18.17.0 | v18.17.0 ✅ |
| Memory | 2GB | 16GB ⚠️ |
| Database | PostgreSQL 15.2 | PostgreSQL 15.2 ✅ |

## Key Findings
1. **Root Cause**: User object was null due to cache miss
2. **Trigger**: Concurrent requests after cache expiry
3. **Impact**: 2,341 failed requests over 5 minutes

## Timeline Analysis
1. 10:30:00 - User logs in (cache populated)
2. 10:30:30 - Cache expires
3. 10:30:45 - Concurrent requests arrive
4. 10:30:45 - First request clears stale cache
5. 10:30:45 - Second request reads null from cache
6. 10:30:45 - Error: Cannot read 'email' of undefined

## Fix Applied
```javascript
// Added null check and cache race condition prevention
const user = await cache.get(userId) || await db.users.findById(userId);
if (!user) {
  throw new NotFoundError(`User ${userId} not found`);
}
```

## Verification
- ✅ Error no longer reproducible
- ✅ All regression tests pass
- ✅ Performance impact: < 5ms added latency
```

Save reproduction data for future reference.