 performance
    let optimized = funcString;
    
    // Optimize filter().map() to single reduce
    optimized = optimized.replace(
      /\.filter\((.*?)\)\.map\((.*?)\)/g,
      `.reduce((acc, item) => {
        if ($1) {
          acc.push($2);
        }
        return acc;
      }, [])`
    );
    
    // Optimize multiple array iterations
    optimized = optimized.replace(
      /array\.forEach\((.*?)\);\s*array\.forEach\((.*?)\);/g,
      `array.forEach((item) => {
        $1;
        $2;
      });`
    );
    
    // Cache array length in loops
    optimized = optimized.replace(
      /for\s*\(\s*let\s+(\w+)\s*=\s*0;\s*\1\s*<\s*(\w+)\.length;\s*\1\+\+\s*\)/g,
      'for (let $1 = 0, len = $2.length; $1 < len; $1++)'
    );
    
    return {
      code: optimized,
      explanation: 'Optimize loop performance by reducing iterations and caching length',
      improvement: '20-40% for large arrays'
    };
  }
}
```

### 2.3 Caching Implementation
```javascript
class CacheOptimizer {
  constructor() {
    this.cacheStrategies = new Map();
  }
  
  async implementCaching(endpoint, profile) {
    const strategy = this.determineStrategy(endpoint, profile);
    
    switch (strategy.type) {
      case 'memory':
        return this.implementMemoryCache(endpoint, strategy);
      
      case 'redis':
        return this.implementRedisCache(endpoint, strategy);
      
      case 'cdn':
        return this.implementCDNCache(endpoint, strategy);
      
      case 'database':
        return this.implementQueryCache(endpoint, strategy);
      
      default:
        return null;
    }
  }
  
  determineStrategy(endpoint, profile) {
    const strategy = {
      type: null,
      ttl: 300, // 5 minutes default
      invalidation: 'time-based',
      key: null
    };
    
    // Analyze endpoint characteristics
    const isStatic = this.isStaticContent(endpoint);
    const updateFrequency = this.getUpdateFrequency(endpoint, profile);
    const dataSize = profile.avgSize;
    
    if (isStatic) {
      strategy.type = 'cdn';
      strategy.ttl = 86400; // 24 hours
    } else if (updateFrequency < 0.1) { // Updates less than once per 10 requests
      strategy.type = 'redis';
      strategy.ttl = 3600; // 1 hour
    } else if (dataSize < 1024 * 10) { // Less than 10KB
      strategy.type = 'memory';
      strategy.ttl = 300; // 5 minutes
    } else {
      strategy.type = 'database';
      strategy.ttl = 60; // 1 minute
    }
    
    // Determine cache key pattern
    strategy.key = this.generateCacheKeyPattern(endpoint);
    
    return strategy;
  }
  
  implementMemoryCache(endpoint, strategy) {
    const cacheCode = `
// Memory cache implementation for ${endpoint.path}
const cache = new Map();
const cacheTTL = ${strategy.ttl * 1000}; // ${strategy.ttl} seconds

// Middleware
function cacheMiddleware(req, res, next) {
  const key = \`${strategy.key}\`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < cacheTTL) {
    return res.json(cached.data);
  }
  
  // Store original send
  const originalSend = res.json;
  
  res.json = function(data) {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Limit cache size
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    originalSend.call(this, data);
  };
  
  next();
}

// Apply to endpoint
app.get('${endpoint.path}', cacheMiddleware, originalHandler);
`;
    
    return {
      type: 'memory_cache',
      code: cacheCode,
      explanation: `In-memory cache for ${endpoint.path}`,
      estimatedImprovement: '95% response time reduction for cache hits',
      implementation: {
        middleware: true,
        ttl: strategy.ttl,
        maxSize: 1000
      }
    };
  }
  
  implementRedisCache(endpoint, strategy) {
    const cacheCode = `
// Redis cache implementation for ${endpoint.path}
const redis = require('redis').createClient();

async function redisCacheMiddleware(req, res, next) {
  const key = \`api:${strategy.key}\`;
  
  try {
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
  } catch (error) {
    console.error('Redis cache error:', error);
    // Continue without cache on error
  }
  
  // Store original send
  const originalSend = res.json;
  
  res.json = async function(data) {
    try {
      await redis.setex(key, ${strategy.ttl}, JSON.stringify(data));
    } catch (error) {
      console.error('Redis cache write error:', error);
    }
    
    originalSend.call(this, data);
  };
  
  next();
}

// Cache invalidation
function invalidateCache(pattern) {
  return new Promise((resolve, reject) => {
    const stream = redis.scanStream({ match: pattern });
    
    stream.on('data', (keys) => {
      if (keys.length) {
        redis.unlink(keys);
      }
    });
    
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

// Apply to endpoint
app.get('${endpoint.path}', redisCacheMiddleware, originalHandler);
`;
    
    return {
      type: 'redis_cache',
      code: cacheCode,
      explanation: `Redis distributed cache for ${endpoint.path}`,
      estimatedImprovement: '90% response time reduction, handles high load',
      implementation: {
        middleware: true,
        ttl: strategy.ttl,
        distributed: true,
        invalidation: 'pattern-based'
      }
    };
  }
  
  generateCacheKeyPattern(endpoint) {
    // Generate cache key based on endpoint pattern
    let key = endpoint.path.replace(/\//g, ':');
    
    // Replace path parameters
    key = key.replace(/:(\w+)/g, '${req.params.$1}');
    
    // Add query parameters if present
    if (endpoint.queryParams && endpoint.queryParams.length > 0) {
      key += ':${JSON.stringify(req.query)}';
    }
    
    // Add user context if authenticated endpoint
    if (endpoint.requiresAuth) {
      key = '${req.user.id}:' + key;
    }
    
    return key;
  }
}
```

## 3. Bundle Optimization

### 3.1 Code Splitting
```javascript
class BundleOptimizer {
  constructor(webpackConfig) {
    this.config = webpackConfig;
    this.optimizations = [];
  }
  
  analyzeAndOptimize() {
    const optimizations = [];
    
    // Implement code splitting
    optimizations.push(this.implementCodeSplitting());
    
    // Optimize chunks
    optimizations.push(this.optimizeChunks());
    
    // Tree shaking
    optimizations.push(this.enableTreeShaking());
    
    // Lazy loading
    optimizations.push(this.implementLazyLoading());
    
    return optimizations;
  }
  
  implementCodeSplitting() {
    const splitConfig = {
      optimization: {
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true
            },
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true
            },
            // Split large libraries
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              priority: 20
            },
            lodash: {
              test: /[\\/]node_modules[\\/]lodash[\\/]/,
              name: 'lodash',
              priority: 20
            }
          }
        }
      }
    };
    
    return {
      type: 'code_splitting',
      config: splitConfig,
      explanation: 'Split code into separate bundles for better caching',
      estimatedImprovement: '40% initial load time reduction'
    };
  }
  
  implementLazyLoading() {
    const lazyLoadCode = `
// Convert static imports to dynamic imports
// Before:
import HeavyComponent from './HeavyComponent';

// After:
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Usage with Suspense
<React.Suspense fallback={<Loading />}>
  <HeavyComponent />
</React.Suspense>

// Route-based code splitting
const routes = [
  {
    path: '/dashboard',
    component: React.lazy(() => import('./pages/Dashboard'))
  },
  {
    path: '/analytics',
    component: React.lazy(() => import('./pages/Analytics'))
  }
];
`;
    
    return {
      type: 'lazy_loading',
      code: lazyLoadCode,
      explanation: 'Lazy load components and routes',
      estimatedImprovement: '50% initial bundle size reduction'
    };
  }
  
  enableTreeShaking() {
    const treeShakingConfig = {
      optimization: {
        usedExports: true,
        sideEffects: false,
        providedExports: true,
        concatenateModules: true,
        innerGraph: true
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            sideEffects: false
          }
        ]
      }
    };
    
    // Package.json update
    const packageJsonUpdate = {
      sideEffects: false,
      // Or specify files with side effects
      sideEffects: [
        "*.css",
        "*.scss",
        "./src/polyfills.js"
      ]
    };
    
    return {
      type: 'tree_shaking',
      config: treeShakingConfig,
      packageJson: packageJsonUpdate,
      explanation: 'Remove unused code from bundles',
      estimatedImprovement: '20-30% bundle size reduction'
    };
  }
}
```

## 4. Database Optimization

### 4.1 Connection Pool Optimization
```javascript
class ConnectionPoolOptimizer {
  constructor(pool) {
    this.pool = pool;
    this.metrics = [];
  }
  
  async optimizePool() {
    // Collect metrics
    const metrics = await this.collectMetrics();
    
    // Calculate optimal settings
    const optimal = this.calculateOptimalSettings(metrics);
    
    // Generate new configuration
    return {
      current: this.pool.options,
      recommended: optimal,
      explanation: this.explainChanges(this.pool.options, optimal)
    };
  }
  
  calculateOptimalSettings(metrics) {
    const settings = {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    };
    
    // Base calculations on metrics
    const avgConcurrent = metrics.avgActive;
    const maxConcurrent = metrics.maxActive;
    const waitingRequests = metrics.maxWaiting;
    
    // Set min to average concurrent connections
    settings.min = Math.max(2, Math.floor(avgConcurrent));
    
    // Set max to peak + buffer
    settings.max = Math.min(100, Math.ceil(maxConcurrent * 1.5));
    
    // Adjust timeouts based on wait times
    if (metrics.avgWaitTime > 1000) {
      settings.acquireTimeoutMillis = Math.min(60000, metrics.avgWaitTime * 3);
    }
    
    // Idle timeout based on connection reuse
    if (metrics.connectionReuse < 0.5) {
      settings.idleTimeoutMillis = 10000; // Shorter idle time
    }
    
    return settings;
  }
  
  explainChanges(current, recommended) {
    const explanations = [];
    
    if (recommended.min !== current.min) {
      explanations.push({
        setting: 'min',
        from: current.min,
        to: recommended.min,
        reason: 'Match average concurrent usage to reduce connection overhead'
      });
    }
    
    if (recommended.max !== current.max) {
      explanations.push({
        setting: 'max',
        from: current.max,
        to: recommended.max,
        reason: 'Handle peak load with buffer while preventing resource exhaustion'
      });
    }
    
    return explanations;
  }
}
```

## 5. Implementation Report

### 5.1 Generate Optimization Report
```javascript
async function generateOptimizationReport(optimizations) {
  const report = {
    timestamp: new Date(),
    summary: {
      totalOptimizations: 0,
      estimatedImprovement: 0,
      implementationTime: '2-4 hours',
      risk: 'low'
    },
    
    optimizations: {
      critical_path: [],
      database: [],
      caching: [],
      code: [],
      bundle: []
    },
    
    implementation_plan: [],
    
    monitoring: {
      before: {},
      after: {},
      metrics_to_track: []
    }
  };
  
  // Categorize optimizations
  for (const opt of optimizations) {
    const category = determineCategory(opt);
    report.optimizations[category].push(opt);
    report.summary.totalOptimizations++;
  }
  
  // Calculate total improvement
  report.summary.estimatedImprovement = calculateTotalImprovement(optimizations);
  
  // Generate implementation plan
  report.implementation_plan = generateImplementationPlan(optimizations);
  
  // Define monitoring strategy
  report.monitoring = {
    metrics_to_track: [
      'Response time (p50, p95, p99)',
      'Throughput (requests/second)',
      'Error rate',
      'CPU usage',
      'Memory usage',
      'Cache hit rate'
    ],
    
    before: await captureCurrentMetrics(),
    
    validation_tests: [
      'Load test with current traffic pattern',
      'Spike test with 2x traffic',
      'Endurance test for memory leaks',
      'Cache effectiveness test'
    ]
  };
  
  // Generate report files
  fs.writeFileSync(
    'optimization-report.json',
    JSON.stringify(report, null, 2)
  );
  
  generateImplementationGuide(report);
  
  return report;
}

function generateImplementationGuide(report) {
  const guide = `# Critical Path Optimization Guide

## Summary
- **Total Optimizations**: ${report.summary.totalOptimizations}
- **Estimated Improvement**: ${report.summary.estimatedImprovement}%
- **Implementation Time**: ${report.summary.implementationTime}
- **Risk Level**: ${report.summary.risk}

## Implementation Plan

${report.implementation_plan.map((step, index) => `
### Step ${index + 1}: ${step.title}

**What to do:**
${step.description}

**Code changes:**
\`\`\`${step.language || 'javascript'}
${step.code}
\`\`\`

**Validation:**
${step.validation}

**Rollback plan:**
${step.rollback}
`).join('\n')}

## Monitoring Plan

### Metrics to Track
${report.monitoring.metrics_to_track.map(m => `- ${m}`).join('\n')}

### Success Criteria
- Response time improvement > 40%
- No increase in error rate
- Cache hit rate > 80%
- CPU usage reduced by 20%

### A/B Testing Strategy
1. Deploy optimizations behind feature flag
2. Start with 10% of traffic
3. Monitor for 24 hours
4. Gradually increase to 50%, then 100%
5. Keep feature flag for quick rollback

## Next Steps
1. Review optimizations with team
2. Implement in development environment
3. Run performance tests
4. Deploy to staging
5. Conduct load testing
6. Deploy to production with monitoring
`;
  
  fs.writeFileSync('optimization-guide.md', guide);
  console.log('📚 Optimization guide generated: optimization-guide.md');
}
```

Automatically optimize the critical performance paths.