---
name: debug-production
description: Debug production issues without touching production
---

# Debug Production

Safely debug production issues using isolated environments and advanced techniques.

## 1. Production State Capture

### 1.1 Safe Data Extraction
```javascript
// Extract production state without affecting performance
async function captureProductionState(issueId) {
  const state = {
    timestamp: new Date(),
    issue: issueId,
    
    // System metrics
    metrics: await captureMetrics(),
    
    // Application state
    application: await captureAppState(),
    
    // Database snapshot
    database: await captureDatabaseState(),
    
    // Recent logs
    logs: await captureLogs(),
    
    // Error patterns
    errors: await captureErrorPatterns()
  };
  
  return state;
}

async function captureMetrics() {
  // Use read replicas to avoid production impact
  const metrics = await monitoring.query({
    timeRange: '1h',
    metrics: [
      'cpu_usage',
      'memory_usage', 
      'response_time_p95',
      'error_rate',
      'database_connections',
      'cache_hit_rate'
    ],
    resolution: '1m'
  });
  
  return metrics;
}

async function captureDatabaseState() {
  // Connect to read replica
  const readReplica = new DatabaseConnection(process.env.READ_REPLICA_URL);
  
  // Capture without locking
  const state = {
    slowQueries: await readReplica.getSlowQueries({ limit: 10 }),
    tableSizes: await readReplica.getTableSizes(),
    activeConnections: await readReplica.getActiveConnections(),
    locks: await readReplica.getCurrentLocks(),
    replicationLag: await readReplica.getReplicationLag()
  };
  
  return state;
}
```

### 1.2 Create Debug Snapshot
```bash
#!/bin/bash
# create-debug-snapshot.sh

SNAPSHOT_ID="debug_$(date +%Y%m%d_%H%M%S)"
SNAPSHOT_DIR="/tmp/debug_snapshots/$SNAPSHOT_ID"

mkdir -p "$SNAPSHOT_DIR"

# Export application state
echo "📸 Creating debug snapshot..."

# 1. Database schema only (no data)
pg_dump --schema-only "$READ_REPLICA_URL" > "$SNAPSHOT_DIR/schema.sql"

# 2. Sample data (anonymized)
psql "$READ_REPLICA_URL" << EOF > "$SNAPSHOT_DIR/sample_data.sql"
-- Sample 1000 recent records from each table
COPY (
  SELECT id, 
         'user_' || id as email,
         'User ' || id as name,
         created_at,
         updated_at
  FROM users 
  ORDER BY created_at DESC 
  LIMIT 1000
) TO STDOUT WITH CSV HEADER;
EOF

# 3. Configuration (sanitized)
cat > "$SNAPSHOT_DIR/config.json" << EOF
{
  "node_version": "$(node -v)",
  "npm_packages": $(npm list --json --depth=0),
  "environment": {
    "NODE_ENV": "$NODE_ENV",
    "API_VERSION": "$API_VERSION",
    "FEATURES": $(echo $FEATURE_FLAGS | jq -R '. | split(",")'),
    "REGION": "$AWS_REGION"
  }
}
EOF

# 4. Recent logs (last 1000 lines)
tail -n 1000 /var/log/app/production.log > "$SNAPSHOT_DIR/recent.log"

# 5. Current metrics
curl -s "$METRICS_ENDPOINT/current" > "$SNAPSHOT_DIR/metrics.json"

# Create archive
tar -czf "$SNAPSHOT_ID.tar.gz" -C "/tmp/debug_snapshots" "$SNAPSHOT_ID"

echo "✅ Snapshot created: $SNAPSHOT_ID.tar.gz"
```

## 2. Local Debug Environment

### 2.1 Mirror Production Setup
```javascript
// setup-debug-environment.js
async function setupDebugEnvironment(snapshot) {
  console.log('🔧 Setting up production mirror...');
  
  const config = {
    name: `debug_${snapshot.id}`,
    
    // Match production specifications
    resources: {
      cpu: snapshot.metrics.cpu,
      memory: snapshot.metrics.memory,
      disk: '10GB'
    },
    
    // Same versions as production
    versions: {
      node: snapshot.config.node_version,
      database: snapshot.config.database_version,
      redis: snapshot.config.redis_version
    },
    
    // Production-like constraints
    constraints: {
      maxConnections: snapshot.config.max_connections,
      requestTimeout: snapshot.config.request_timeout,
      memoryLimit: snapshot.config.memory_limit
    }
  };
  
  // Create Docker environment
  const dockerCompose = generateDockerCompose(config);
  fs.writeFileSync('docker-compose.debug.yml', dockerCompose);
  
  // Start services
  await exec('docker-compose -f docker-compose.debug.yml up -d');
  
  // Wait for services
  await waitForServices();
  
  // Import snapshot data
  await importSnapshot(snapshot);
  
  return config;
}
```

### 2.2 Production Traffic Replay
```javascript
// replay-traffic.js
async function replayProductionTraffic(duration = '5m') {
  // Get recent production traffic patterns
  const trafficLog = await fetchTrafficLog(duration);
  
  // Generate replay script
  const replayScript = `
const autocannon = require('autocannon');

const scenarios = ${JSON.stringify(trafficLog.patterns)};

async function replay() {
  for (const scenario of scenarios) {
    console.log(\`Replaying: \${scenario.name}\`);
    
    const result = await autocannon({
      url: 'http://localhost:3000',
      connections: scenario.concurrent_users,
      duration: scenario.duration,
      requests: scenario.requests.map(req => ({
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body
      }))
    });
    
    console.log('Results:', result);
  }
}

replay().catch(console.error);
`;

  fs.writeFileSync('replay-traffic.js', replayScript);
  
  // Execute replay
  const results = await exec('node replay-traffic.js');
  
  return analyzeReplayResults(results);
}
```

## 3. Advanced Debugging

### 3.1 Distributed Tracing
```javascript
// setup-tracing.js
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');

function setupDebugTracing() {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      'service.name': 'debug-instance',
      'deployment.environment': 'debug'
    })
  });
  
  // Add debug-specific instrumentation
  provider.addSpanProcessor({
    onStart(span) {
      // Log all span starts
      console.log(`[TRACE START] ${span.name}`);
    },
    
    onEnd(span) {
      // Log span with timing
      const duration = span.endTime - span.startTime;
      console.log(`[TRACE END] ${span.name} - ${duration}ms`);
      
      // Flag slow operations
      if (duration > 1000) {
        console.warn(`[SLOW] ${span.name} took ${duration}ms`);
      }
    }
  });
  
  provider.register();
  
  return provider;
}
```

### 3.2 Memory Analysis
```javascript
// memory-analysis.js
const v8 = require('v8');
const fs = require('fs');

class MemoryDebugger {
  constructor() {
    this.snapshots = [];
    this.baseline = null;
  }
  
  captureBaseline() {
    this.baseline = {
      heap: v8.getHeapStatistics(),
      timestamp: Date.now(),
      snapshot: v8.writeHeapSnapshot()
    };
    
    console.log('📸 Baseline memory captured');
  }
  
  captureSnapshot(label) {
    const snapshot = {
      label,
      heap: v8.getHeapStatistics(),
      timestamp: Date.now(),
      snapshot: v8.writeHeapSnapshot(),
      diff: null
    };
    
    if (this.baseline) {
      snapshot.diff = {
        heapUsed: snapshot.heap.used_heap_size - this.baseline.heap.used_heap_size,
        external: snapshot.heap.external_memory - this.baseline.heap.external_memory
      };
    }
    
    this.snapshots.push(snapshot);
    
    console.log(`📸 Snapshot captured: ${label}`);
    if (snapshot.diff) {
      console.log(`   Heap diff: ${(snapshot.diff.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }
    
    return snapshot;
  }
  
  findLeaks() {
    if (this.snapshots.length < 2) return [];
    
    const leaks = [];
    
    // Compare consecutive snapshots
    for (let i = 1; i < this.snapshots.length; i++) {
      const prev = this.snapshots[i - 1];
      const curr = this.snapshots[i];
      
      const growth = curr.heap.used_heap_size - prev.heap.used_heap_size;
      const growthRate = growth / (curr.timestamp - prev.timestamp) * 1000; // bytes/sec
      
      if (growthRate > 1024 * 1024) { // 1MB/sec
        leaks.push({
          between: `${prev.label} -> ${curr.label}`,
          growth: growth,
          rate: growthRate,
          suspicious: true
        });
      }
    }
    
    return leaks;
  }
  
  async analyzeHeapDump(snapshotPath) {
    const heapdump = require('heapdump');
    
    // Analyze object allocations
    const analysis = await heapdump.analyze(snapshotPath);
    
    return {
      largestObjects: analysis.nodes
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .map(node => ({
          constructor: node.name,
          size: node.size,
          retainedSize: node.retainedSize,
          count: node.instancesCount
        })),
      
      summary: {
        totalSize: analysis.snapshot.meta.node_count,
        stringCount: analysis.strings.length,
        objectCount: analysis.nodes.filter(n => n.type === 'object').length
      }
    };
  }
}
```

### 3.3 Performance Profiling
```javascript
// performance-profiler.js
const { performance, PerformanceObserver } = require('perf_hooks');

class PerformanceDebugger {
  constructor() {
    this.marks = new Map();
    this.measures = [];
    
    // Auto-instrument async operations
    this.setupAutoInstrumentation();
  }
  
  setupAutoInstrumentation() {
    // Monitor all async operations
    const async_hooks = require('async_hooks');
    
    const asyncHook = async_hooks.createHook({
      init: (asyncId, type, triggerAsyncId) => {
        if (type === 'PROMISE' || type === 'ASYNC') {
          this.marks.set(asyncId, {
            type,
            start: performance.now(),
            trigger: triggerAsyncId
          });
        }
      },
      
      destroy: (asyncId) => {
        const mark = this.marks.get(asyncId);
        if (mark) {
          const duration = performance.now() - mark.start;
          if (duration > 100) { // Log slow async operations
            console.log(`[SLOW ASYNC] ${mark.type} took ${duration.toFixed(2)}ms`);
          }
          this.marks.delete(asyncId);
        }
      }
    });
    
    asyncHook.enable();
  }
  
  profileFunction(fn, label) {
    return async (...args) => {
      const startMark = `${label}-start-${Date.now()}`;
      const endMark = `${label}-end-${Date.now()}`;
      
      performance.mark(startMark);
      
      const startMemory = process.memoryUsage();
      const startCpu = process.cpuUsage();
      
      try {
        const result = await fn(...args);
        
        performance.mark(endMark);
        performance.measure(label, startMark, endMark);
        
        const endMemory = process.memoryUsage();
        const endCpu = process.cpuUsage(startCpu);
        
        const measure = performance.getEntriesByName(label)[0];
        
        this.measures.push({
          label,
          duration: measure.duration,
          memory: {
            heapUsed: endMemory.heapUsed - startMemory.heapUsed,
            external: endMemory.external - startMemory.external
          },
          cpu: {
            user: endCpu.user / 1000, // Convert to ms
            system: endCpu.system / 1000
          }
        });
        
        return result;
        
      } catch (error) {
        performance.mark(endMark);
        performance.measure(`${label}-error`, startMark, endMark);
        throw error;
      }
    };
  }
  
  getBottlenecks() {
    return this.measures
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(m => ({
        operation: m.label,
        duration: `${m.duration.toFixed(2)}ms`,
        memory: `${(m.memory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        cpu: `${m.cpu.user.toFixed(2)}ms`
      }));
  }
}
```

## 4. Root Cause Analysis

### 4.1 Automated RCA
```javascript
async function performRootCauseAnalysis(debugData) {
  const analysis = {
    symptoms: identifySymptoms(debugData),
    correlations: findCorrelations(debugData),
    suspects: [],
    evidence: [],
    conclusion: null
  };
  
  // Check common patterns
  const patterns = [
    {
      name: 'Memory Leak',
      check: () => debugData.memory.trend === 'increasing',
      evidence: () => debugData.memory.snapshots
    },
    {
      name: 'Database Bottleneck',
      check: () => debugData.database.slowQueries.length > 5,
      evidence: () => debugData.database.slowQueries
    },
    {
      name: 'Cache Stampede',
      check: () => debugData.cache.missRate > 0.5 && debugData.traffic.concurrent > 100,
      evidence: () => ({ missRate: debugData.cache.missRate, concurrent: debugData.traffic.concurrent })
    },
    {
      name: 'Resource Exhaustion',
      check: () => debugData.metrics.cpu > 90 || debugData.metrics.memory > 90,
      evidence: () => debugData.metrics
    }
  ];
  
  for (const pattern of patterns) {
    if (pattern.check()) {
      analysis.suspects.push(pattern.name);
      analysis.evidence.push({
        pattern: pattern.name,
        data: pattern.evidence()
      });
    }
  }
  
  // Generate conclusion
  if (analysis.suspects.length === 1) {
    analysis.conclusion = `Root cause identified: ${analysis.suspects[0]}`;
  } else if (analysis.suspects.length > 1) {
    analysis.conclusion = `Multiple issues detected: ${analysis.suspects.join(', ')}`;
  } else {
    analysis.conclusion = 'Root cause unclear - needs manual investigation';
  }
  
  return analysis;
}
```

## 5. Fix Development

### 5.1 Generate Fix Suggestions
```javascript
function generateFixSuggestions(rootCause) {
  const fixes = {
    'Memory Leak': [
      {
        description: 'Add proper cleanup in event listeners',
        code: `
// Before
emitter.on('data', handler);

// After  
emitter.on('data', handler);
// Cleanup
emitter.removeListener('data', handler);`
      },
      {
        description: 'Clear references in closures',
        code: `
// Add cleanup method
cleanup() {
  this.cache = null;
  this.listeners = [];
}`
      }
    ],
    
    'Database Bottleneck': [
      {
        description: 'Add missing index',
        code: `CREATE INDEX CONCURRENTLY idx_users_email ON users(email);`
      },
      {
        description: 'Optimize slow query',
        code: `
// Before
SELECT * FROM orders o 
JOIN users u ON o.user_id = u.id 
WHERE u.email = $1;

// After - with index
SELECT o.* FROM orders o 
WHERE o.user_id = (SELECT id FROM users WHERE email = $1 LIMIT 1);`
      }
    ]
  };
  
  return fixes[rootCause] || [];
}
```

## 6. Debug Report

### 6.1 Generate Debug Summary
```markdown
# Production Debug Report

## Issue Summary
- **Symptoms**: High memory usage, increased response times
- **Impact**: 15% of requests timing out
- **Duration**: 2 hours (10:00 - 12:00 UTC)
- **Root Cause**: Memory leak in WebSocket handler

## Debug Process

### 1. Initial Analysis
- Captured production metrics showing memory growth
- Identified correlation with WebSocket connections
- No corresponding CPU increase (ruled out computation)

### 2. Local Reproduction  
- Mirrored production environment locally
- Replayed production traffic pattern
- Successfully reproduced memory growth

### 3. Root Cause Identification
Used memory profiling to identify:
- WebSocket event handlers not being removed
- Each connection leaked ~2MB
- 1000 connections = 2GB memory leak

### 4. Fix Applied
```javascript
// Added cleanup on disconnect
ws.on('close', () => {
  ws.removeAllListeners();
  clearInterval(ws.pingInterval);
  delete activeConnections[ws.id];
});
```

### 5. Verification
- Memory usage stable after fix
- No performance degradation
- All tests passing

## Metrics Comparison
| Metric | Before | After |
|--------|--------|-------|
| Memory Usage | 2.1GB (growing) | 800MB (stable) |
| Response Time p95 | 2500ms | 150ms |
| Error Rate | 15% | 0.01% |

## Lessons Learned
1. Always cleanup event listeners
2. Monitor WebSocket connection lifecycle
3. Add memory leak detection to CI/CD
```

Save debug session for knowledge base.