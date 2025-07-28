---
name: profile-performance
description: Complete performance analysis of code, database, and APIs
---

# Profile Performance

Comprehensive performance profiling to identify bottlenecks and optimization opportunities.

## 1. Code Profiling

### 1.1 CPU Profiling
```javascript
// Setup CPU profiler
const v8Profiler = require('v8-profiler-next');
const fs = require('fs');

class CPUProfiler {
  constructor() {
    this.profiles = [];
    this.currentProfile = null;
  }
  
  start(label = 'cpu-profile') {
    console.log(`🔍 Starting CPU profiling: ${label}`);
    v8Profiler.startProfiling(label, true);
    this.currentProfile = label;
  }
  
  stop() {
    if (!this.currentProfile) return null;
    
    const profile = v8Profiler.stopProfiling(this.currentProfile);
    
    // Export profile
    profile.export((error, result) => {
      if (!error) {
        fs.writeFileSync(`${this.currentProfile}.cpuprofile`, result);
        console.log(`✅ CPU profile saved: ${this.currentProfile}.cpuprofile`);
      }
      profile.delete();
    });
    
    // Analyze profile
    const analysis = this.analyzeProfile(profile);
    this.profiles.push(analysis);
    
    this.currentProfile = null;
    return analysis;
  }
  
  analyzeProfile(profile) {
    const analysis = {
      totalTime: profile.endTime - profile.startTime,
      hotspots: [],
      callTree: this.buildCallTree(profile)
    };
    
    // Find hot functions
    const nodes = profile.nodes;
    const hotNodes = nodes
      .filter(node => node.hitCount > 0)
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 10);
    
    analysis.hotspots = hotNodes.map(node => ({
      function: node.functionName || 'anonymous',
      file: node.url,
      line: node.lineNumber,
      samples: node.hitCount,
      percentage: (node.hitCount / profile.samples.length * 100).toFixed(2)
    }));
    
    return analysis;
  }
  
  buildCallTree(profile) {
    // Build hierarchical call tree
    const tree = {};
    
    for (const sample of profile.samples) {
      let current = tree;
      const stack = this.getStackForSample(profile, sample);
      
      for (const frame of stack) {
        if (!current[frame]) {
          current[frame] = { count: 0, children: {} };
        }
        current[frame].count++;
        current = current[frame].children;
      }
    }
    
    return tree;
  }
}
```

### 1.2 Memory Profiling
```javascript
class MemoryProfiler {
  constructor() {
    this.snapshots = [];
    this.baseline = null;
  }
  
  takeSnapshot(label) {
    const snapshot = {
      label,
      timestamp: Date.now(),
      heap: v8.getHeapStatistics(),
      heapSnapshot: null
    };
    
    // Take heap snapshot
    v8Profiler.takeSnapshot(label);
    
    // Export snapshot
    const profile = v8Profiler.takeSnapshot(label);
    profile.export((error, result) => {
      if (!error) {
        fs.writeFileSync(`${label}.heapsnapshot`, result);
        snapshot.heapSnapshot = `${label}.heapsnapshot`;
      }
      profile.delete();
    });
    
    // Analyze memory usage
    snapshot.analysis = this.analyzeMemory(snapshot.heap);
    
    this.snapshots.push(snapshot);
    return snapshot;
  }
  
  analyzeMemory(heap) {
    return {
      totalHeap: (heap.total_heap_size / 1024 / 1024).toFixed(2) + 'MB',
      usedHeap: (heap.used_heap_size / 1024 / 1024).toFixed(2) + 'MB',
      heapLimit: (heap.heap_size_limit / 1024 / 1024).toFixed(2) + 'MB',
      mallocedMemory: (heap.malloced_memory / 1024 / 1024).toFixed(2) + 'MB',
      peakMalloced: (heap.peak_malloced_memory / 1024 / 1024).toFixed(2) + 'MB',
      gcPressure: ((heap.used_heap_size / heap.heap_size_limit) * 100).toFixed(2) + '%'
    };
  }
  
  compareSnapshots(label1, label2) {
    const snap1 = this.snapshots.find(s => s.label === label1);
    const snap2 = this.snapshots.find(s => s.label === label2);
    
    if (!snap1 || !snap2) return null;
    
    return {
      heapGrowth: snap2.heap.used_heap_size - snap1.heap.used_heap_size,
      timeElapsed: snap2.timestamp - snap1.timestamp,
      growthRate: (
        (snap2.heap.used_heap_size - snap1.heap.used_heap_size) / 
        (snap2.timestamp - snap1.timestamp) * 1000
      ).toFixed(2) + ' bytes/sec'
    };
  }
}
```

### 1.3 Async Profiling
```javascript
const async_hooks = require('async_hooks');

class AsyncProfiler {
  constructor() {
    this.asyncOperations = new Map();
    this.asyncTree = new Map();
    
    this.hook = async_hooks.createHook({
      init: this.init.bind(this),
      before: this.before.bind(this),
      after: this.after.bind(this),
      destroy: this.destroy.bind(this)
    });
  }
  
  start() {
    this.hook.enable();
    console.log('🔄 Async profiling started');
  }
  
  stop() {
    this.hook.disable();
    return this.generateReport();
  }
  
  init(asyncId, type, triggerAsyncId) {
    const operation = {
      id: asyncId,
      type,
      triggerId: triggerAsyncId,
      startTime: performance.now(),
      beforeTime: null,
      afterTime: null,
      duration: null,
      state: 'initialized'
    };
    
    this.asyncOperations.set(asyncId, operation);
    
    // Build tree
    if (!this.asyncTree.has(triggerAsyncId)) {
      this.asyncTree.set(triggerAsyncId, []);
    }
    this.asyncTree.get(triggerAsyncId).push(asyncId);
  }
  
  before(asyncId) {
    const operation = this.asyncOperations.get(asyncId);
    if (operation) {
      operation.beforeTime = performance.now();
      operation.state = 'executing';
    }
  }
  
  after(asyncId) {
    const operation = this.asyncOperations.get(asyncId);
    if (operation && operation.beforeTime) {
      operation.afterTime = performance.now();
      operation.duration = operation.afterTime - operation.beforeTime;
      operation.state = 'completed';
    }
  }
  
  destroy(asyncId) {
    const operation = this.asyncOperations.get(asyncId);
    if (operation) {
      operation.state = 'destroyed';
      operation.lifetime = performance.now() - operation.startTime;
    }
  }
  
  generateReport() {
    const report = {
      totalOperations: this.asyncOperations.size,
      byType: {},
      slowOperations: [],
      pendingOperations: []
    };
    
    // Analyze operations
    for (const [id, operation] of this.asyncOperations) {
      // Count by type
      report.byType[operation.type] = (report.byType[operation.type] || 0) + 1;
      
      // Find slow operations
      if (operation.duration > 100) {
        report.slowOperations.push({
          id,
          type: operation.type,
          duration: operation.duration,
          state: operation.state
        });
      }
      
      // Find pending operations
      if (operation.state === 'initialized' || operation.state === 'executing') {
        report.pendingOperations.push({
          id,
          type: operation.type,
          startedAt: operation.startTime,
          state: operation.state
        });
      }
    }
    
    // Sort slow operations
    report.slowOperations.sort((a, b) => b.duration - a.duration);
    
    return report;
  }
}
```

## 2. Database Profiling

### 2.1 Query Performance Analysis
```javascript
class DatabaseProfiler {
  constructor(db) {
    this.db = db;
    this.queries = [];
    this.originalQuery = db.query.bind(db);
    
    this.instrumentDatabase();
  }
  
  instrumentDatabase() {
    const self = this;
    
    this.db.query = async function(sql, params) {
      const startTime = performance.now();
      const startCPU = process.cpuUsage();
      
      try {
        const result = await self.originalQuery(sql, params);
        const endTime = performance.now();
        const endCPU = process.cpuUsage(startCPU);
        
        self.queries.push({
          sql,
          params,
          duration: endTime - startTime,
          cpu: endCPU,
          rows: result.rows?.length || 0,
          timestamp: Date.now(),
          success: true
        });
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        
        self.queries.push({
          sql,
          params,
          duration: endTime - startTime,
          error: error.message,
          timestamp: Date.now(),
          success: false
        });
        
        throw error;
      }
    };
  }
  
  async analyzeQueries() {
    const analysis = {
      totalQueries: this.queries.length,
      totalTime: this.queries.reduce((sum, q) => sum + q.duration, 0),
      slowQueries: this.queries.filter(q => q.duration > 100),
      failedQueries: this.queries.filter(q => !q.success),
      queryPatterns: this.analyzePatterns(),
      recommendations: []
    };
    
    // Get execution plans for slow queries
    for (const query of analysis.slowQueries) {
      try {
        const plan = await this.getExecutionPlan(query.sql, query.params);
        query.executionPlan = plan;
        
        // Generate recommendations
        const recommendations = this.generateRecommendations(plan);
        analysis.recommendations.push(...recommendations);
      } catch (error) {
        console.error('Failed to get execution plan:', error);
      }
    }
    
    return analysis;
  }
  
  async getExecutionPlan(sql, params) {
    // PostgreSQL
    const explainSql = `EXPLAIN (ANALYZE, BUFFERS) ${sql}`;
    const result = await this.originalQuery(explainSql, params);
    
    return this.parseExecutionPlan(result.rows);
  }
  
  parseExecutionPlan(planRows) {
    const plan = {
      totalCost: 0,
      totalTime: 0,
      nodes: [],
      issues: []
    };
    
    for (const row of planRows) {
      const line = row['QUERY PLAN'];
      
      // Parse cost
      const costMatch = line.match(/cost=(\d+\.?\d*)\.\.(\d+\.?\d*)/);
      if (costMatch) {
        plan.totalCost = Math.max(plan.totalCost, parseFloat(costMatch[2]));
      }
      
      // Parse time
      const timeMatch = line.match(/actual time=(\d+\.?\d*)\.\.(\d+\.?\d*)/);
      if (timeMatch) {
        plan.totalTime = Math.max(plan.totalTime, parseFloat(timeMatch[2]));
      }
      
      // Identify issues
      if (line.includes('Seq Scan')) {
        plan.issues.push({
          type: 'sequential_scan',
          message: 'Sequential scan detected - consider adding index'
        });
      }
      
      if (line.includes('Nested Loop') && plan.totalCost > 10000) {
        plan.issues.push({
          type: 'nested_loop',
          message: 'Expensive nested loop - consider query optimization'
        });
      }
      
      plan.nodes.push(line);
    }
    
    return plan;
  }
  
  generateRecommendations(plan) {
    const recommendations = [];
    
    for (const issue of plan.issues) {
      switch (issue.type) {
        case 'sequential_scan':
          recommendations.push({
            type: 'index',
            priority: 'high',
            message: 'Add index to avoid sequential scan',
            sql: 'CREATE INDEX idx_table_column ON table(column);'
          });
          break;
          
        case 'nested_loop':
          recommendations.push({
            type: 'query',
            priority: 'medium',
            message: 'Rewrite query to avoid nested loops',
            suggestion: 'Consider using JOIN with proper indexes'
          });
          break;
      }
    }
    
    return recommendations;
  }
}
```

### 2.2 Connection Pool Analysis
```javascript
class ConnectionPoolProfiler {
  constructor(pool) {
    this.pool = pool;
    this.metrics = [];
    this.interval = null;
  }
  
  start(interval = 1000) {
    this.interval = setInterval(() => {
      this.collectMetrics();
    }, interval);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    return this.analyzeMetrics();
  }
  
  collectMetrics() {
    const metrics = {
      timestamp: Date.now(),
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
      active: this.pool.totalCount - this.pool.idleCount,
      utilization: ((this.pool.totalCount - this.pool.idleCount) / this.pool.totalCount * 100).toFixed(2)
    };
    
    this.metrics.push(metrics);
  }
  
  analyzeMetrics() {
    if (this.metrics.length === 0) return null;
    
    const analysis = {
      avgUtilization: 0,
      maxUtilization: 0,
      avgWaiting: 0,
      maxWaiting: 0,
      recommendations: []
    };
    
    // Calculate averages and maximums
    for (const metric of this.metrics) {
      analysis.avgUtilization += parseFloat(metric.utilization);
      analysis.maxUtilization = Math.max(analysis.maxUtilization, parseFloat(metric.utilization));
      analysis.avgWaiting += metric.waiting;
      analysis.maxWaiting = Math.max(analysis.maxWaiting, metric.waiting);
    }
    
    analysis.avgUtilization /= this.metrics.length;
    analysis.avgWaiting /= this.metrics.length;
    
    // Generate recommendations
    if (analysis.maxUtilization > 80) {
      analysis.recommendations.push({
        issue: 'High connection pool utilization',
        suggestion: 'Increase pool size or optimize query performance',
        severity: 'high'
      });
    }
    
    if (analysis.maxWaiting > 0) {
      analysis.recommendations.push({
        issue: 'Connections waiting in queue',
        suggestion: 'Increase pool size to avoid wait times',
        severity: 'medium'
      });
    }
    
    return analysis;
  }
}
```

## 3. API Performance

### 3.1 Endpoint Profiling
```javascript
class APIProfiler {
  constructor(app) {
    this.app = app;
    this.endpoints = new Map();
    
    this.instrumentEndpoints();
  }
  
  instrumentEndpoints() {
    // Add profiling middleware
    this.app.use((req, res, next) => {
      const start = process.hrtime.bigint();
      const startMemory = process.memoryUsage();
      
      // Capture response
      const originalSend = res.send;
      res.send = function(data) {
        const end = process.hrtime.bigint();
        const endMemory = process.memoryUsage();
        
        const endpoint = `${req.method} ${req.route?.path || req.path}`;
        
        if (!this.endpoints.has(endpoint)) {
          this.endpoints.set(endpoint, []);
        }
        
        this.endpoints.get(endpoint).push({
          timestamp: Date.now(),
          duration: Number(end - start) / 1000000, // Convert to ms
          memory: endMemory.heapUsed - startMemory.heapUsed,
          statusCode: res.statusCode,
          contentLength: Buffer.byteLength(data),
          params: req.params,
          query: req.query
        });
        
        originalSend.call(this, data);
      }.bind(this);
      
      next();
    });
  }
  
  analyzeEndpoints() {
    const analysis = {
      endpoints: [],
      slowest: [],
      mostMemory: [],
      largest: []
    };
    
    for (const [endpoint, requests] of this.endpoints) {
      const stats = this.calculateStats(requests);
      
      analysis.endpoints.push({
        endpoint,
        requests: requests.length,
        avgDuration: stats.avgDuration,
        p95Duration: stats.p95Duration,
        maxDuration: stats.maxDuration,
        avgMemory: stats.avgMemory,
        avgSize: stats.avgSize,
        errorRate: stats.errorRate
      });
    }
    
    // Sort by different metrics
    analysis.slowest = [...analysis.endpoints]
      .sort((a, b) => b.p95Duration - a.p95Duration)
      .slice(0, 10);
    
    analysis.mostMemory = [...analysis.endpoints]
      .sort((a, b) => b.avgMemory - a.avgMemory)
      .slice(0, 10);
    
    analysis.largest = [...analysis.endpoints]
      .sort((a, b) => b.avgSize - a.avgSize)
      .slice(0, 10);
    
    return analysis;
  }
  
  calculateStats(requests) {
    const durations = requests.map(r => r.duration).sort((a, b) => a - b);
    const memories = requests.map(r => r.memory);
    const sizes = requests.map(r => r.contentLength);
    const errors = requests.filter(r => r.statusCode >= 400).length;
    
    return {
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      maxDuration: durations[durations.length - 1],
      avgMemory: memories.reduce((a, b) => a + b, 0) / memories.length,
      avgSize: sizes.reduce((a, b) => a + b, 0) / sizes.length,
      errorRate: (errors / requests.length * 100).toFixed(2)
    };
  }
}
```

## 4. Frontend Performance

### 4.1 Bundle Analysis
```javascript
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

function analyzeBundles() {
  return new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    reportFilename: 'bundle-report.html',
    generateStatsFile: true,
    statsFilename: 'bundle-stats.json',
    openAnalyzer: false
  });
}

// Parse bundle stats
function parseBundleStats(statsFile) {
  const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
  
  const analysis = {
    totalSize: 0,
    bundles: [],
    largestModules: [],
    duplicates: findDuplicates(stats),
    recommendations: []
  };
  
  // Analyze each bundle
  for (const asset of stats.assets) {
    analysis.totalSize += asset.size;
    
    analysis.bundles.push({
      name: asset.name,
      size: asset.size,
      sizeHuman: (asset.size / 1024 / 1024).toFixed(2) + 'MB',
      modules: asset.modules?.length || 0
    });
  }
  
  // Find largest modules
  const allModules = [];
  for (const module of stats.modules) {
    allModules.push({
      name: module.name,
      size: module.size,
      reasons: module.reasons?.length || 0
    });
  }
  
  analysis.largestModules = allModules
    .sort((a, b) => b.size - a.size)
    .slice(0, 20);
  
  // Generate recommendations
  if (analysis.totalSize > 5 * 1024 * 1024) {
    analysis.recommendations.push({
      issue: 'Bundle size too large',
      suggestion: 'Consider code splitting and lazy loading',
      priority: 'high'
    });
  }
  
  if (analysis.duplicates.length > 0) {
    analysis.recommendations.push({
      issue: 'Duplicate modules detected',
      suggestion: 'Deduplicate dependencies',
      priority: 'medium'
    });
  }
  
  return analysis;
}

function findDuplicates(stats) {
  const moduleVersions = {};
  const duplicates = [];
  
  for (const module of stats.modules) {
    const match = module.name.match(/node_modules\/([^\/]+)/);
    if (match) {
      const packageName = match[1];
      
      if (!moduleVersions[packageName]) {
        moduleVersions[packageName] = new Set();
      }
      
      moduleVersions[packageName].add(module.name);
    }
  }
  
  for (const [packageName, versions] of Object.entries(moduleVersions)) {
    if (versions.size > 1) {
      duplicates.push({
        package: packageName,
        versions: Array.from(versions)
      });
    }
  }
  
  return duplicates;
}
```

## 5. Generate Performance Report

### 5.1 Comprehensive Report
```javascript
async function generatePerformanceReport(profilers) {
  const report = {
    timestamp: new Date(),
    summary: {
      overallScore: 0,
      criticalIssues: [],
      recommendations: []
    },
    
    cpu: profilers.cpu.profiles,
    memory: profilers.memory.snapshots,
    async: profilers.async.generateReport(),
    database: await profilers.database.analyzeQueries(),
    api: profilers.api.analyzeEndpoints(),
    
    improvements: []
  };
  
  // Calculate overall score
  let score = 100;
  
  // CPU score
  const cpuHotspots = report.cpu[0]?.hotspots || [];
  if (cpuHotspots.some(h => parseFloat(h.percentage) > 20)) {
    score -= 20;
    report.summary.criticalIssues.push('CPU hotspots detected');
  }
  
  // Memory score
  const memoryGrowth = profilers.memory.compareSnapshots('start', 'end');
  if (memoryGrowth && memoryGrowth.heapGrowth > 100 * 1024 * 1024) {
    score -= 20;
    report.summary.criticalIssues.push('Memory leak suspected');
  }
  
  // Database score
  if (report.database.slowQueries.length > 5) {
    score -= 15;
    report.summary.criticalIssues.push('Multiple slow queries');
  }
  
  // API score
  const slowEndpoints = report.api.slowest.filter(e => e.p95Duration > 1000);
  if (slowEndpoints.length > 0) {
    score -= 15;
    report.summary.criticalIssues.push('Slow API endpoints');
  }
  
  report.summary.overallScore = Math.max(0, score);
  
  // Generate improvements
  report.improvements = generateImprovements(report);
  
  // Save report
  fs.writeFileSync(
    'performance-report.json',
    JSON.stringify(report, null, 2)
  );
  
  // Generate HTML report
  generateHTMLReport(report);
  
  return report;
}

function generateImprovements(report) {
  const improvements = [];
  
  // CPU improvements
  if (report.cpu[0]?.hotspots[0]) {
    const hotspot = report.cpu[0].hotspots[0];
    improvements.push({
      category: 'CPU',
      issue: `Function "${hotspot.function}" consuming ${hotspot.percentage}% CPU`,
      solution: 'Optimize algorithm or add caching',
      impact: 'high',
      estimatedGain: `${hotspot.percentage}% CPU reduction`
    });
  }
  
  // Database improvements
  for (const rec of report.database.recommendations) {
    improvements.push({
      category: 'Database',
      issue: rec.message,
      solution: rec.sql || rec.suggestion,
      impact: rec.priority,
      estimatedGain: '50-90% query time reduction'
    });
  }
  
  // API improvements
  const slowestEndpoint = report.api.slowest[0];
  if (slowestEndpoint && slowestEndpoint.p95Duration > 500) {
    improvements.push({
      category: 'API',
      issue: `Endpoint ${slowestEndpoint.endpoint} taking ${slowestEndpoint.p95Duration}ms`,
      solution: 'Add caching or optimize database queries',
      impact: 'high',
      estimatedGain: '60% response time improvement'
    });
  }
  
  return improvements;
}

function generateHTMLReport(report) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Performance Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .score { font-size: 48px; font-weight: bold; }
    .score.good { color: #4CAF50; }
    .score.warning { color: #FF9800; }
    .score.critical { color: #F44336; }
    .issue { background: #ffebee; padding: 10px; margin: 10px 0; }
    .improvement { background: #e8f5e9; padding: 10px; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>Performance Report</h1>
  
  <div class="score ${report.summary.overallScore >= 80 ? 'good' : report.summary.overallScore >= 60 ? 'warning' : 'critical'}">
    Score: ${report.summary.overallScore}/100
  </div>
  
  <h2>Critical Issues</h2>
  ${report.summary.criticalIssues.map(issue => `
    <div class="issue">${issue}</div>
  `).join('')}
  
  <h2>Top Improvements</h2>
  ${report.improvements.slice(0, 5).map(imp => `
    <div class="improvement">
      <strong>${imp.category}:</strong> ${imp.issue}<br>
      <strong>Solution:</strong> ${imp.solution}<br>
      <strong>Expected Gain:</strong> ${imp.estimatedGain}
    </div>
  `).join('')}
  
  <h2>CPU Hotspots</h2>
  <table>
    <tr><th>Function</th><th>File</th><th>CPU %</th></tr>
    ${(report.cpu[0]?.hotspots || []).map(h => `
      <tr>
        <td>${h.function}</td>
        <td>${h.file}:${h.line}</td>
        <td>${h.percentage}%</td>
      </tr>
    `).join('')}
  </table>
  
  <h2>Slow Database Queries</h2>
  <table>
    <tr><th>Query</th><th>Duration</th><th>Rows</th></tr>
    ${report.database.slowQueries.slice(0, 10).map(q => `
      <tr>
        <td>${q.sql.substring(0, 50)}...</td>
        <td>${q.duration.toFixed(2)}ms</td>
        <td>${q.rows}</td>
      </tr>
    `).join('')}
  </table>
  
  <h2>Slowest API Endpoints</h2>
  <table>
    <tr><th>Endpoint</th><th>Avg Time</th><th>P95 Time</th><th>Requests</th></tr>
    ${report.api.slowest.slice(0, 10).map(e => `
      <tr>
        <td>${e.endpoint}</td>
        <td>${e.avgDuration.toFixed(2)}ms</td>
        <td>${e.p95Duration.toFixed(2)}ms</td>
        <td>${e.requests}</td>
      </tr>
    `).join('')}
  </table>
</body>
</html>`;
  
  fs.writeFileSync('performance-report.html', html);
  console.log('📊 Performance report generated: performance-report.html');
}
```

Generate comprehensive performance analysis.