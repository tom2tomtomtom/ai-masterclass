---
name: implement-caching
description: Add smart caching strategies where they'll have the most impact
---

# Implement Caching

Automatically implement intelligent caching strategies based on usage patterns.

## 1. Cache Analysis

### 1.1 Identify Caching Opportunities
```javascript
class CacheAnalyzer {
  constructor() {
    this.requests = new Map();
    this.patterns = new Map();
  }
  
  // Monitor requests to find patterns
  analyze(req, res, executionTime, responseSize) {
    const key = `${req.method} ${req.path}`;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, {
        count: 0,
        totalTime: 0,
        totalSize: 0,
        variations: new Map(),
        timestamps: []
      });
    }
    
    const stats = this.requests.get(key);
    stats.count++;
    stats.totalTime += executionTime;
    stats.totalSize += responseSize;
    stats.timestamps.push(Date.now());
    
    // Track request variations
    const variation = this.getRequestVariation(req);
    stats.variations.set(variation, (stats.variations.get(variation) || 0) + 1);
    
    // Analyze patterns every 100 requests
    if (stats.count % 100 === 0) {
      this.analyzePattern(key, stats);
    }
  }
  
  getRequestVariation(req) {
    // Create a signature based on query params and headers
    return JSON.stringify({
      query: req.query,
      userAgent: req.headers['user-agent'],
      acceptLanguage: req.headers['accept-language'],
      userId: req.user?.id
    });
  }
  
  analyzePattern(endpoint, stats) {
    const pattern = {
      endpoint,
      avgTime: stats.totalTime / stats.count,
      avgSize: stats.totalSize / stats.count,
      requestsPerMinute: this.calculateRPM(stats.timestamps),
      uniqueVariations: stats.variations.size,
      cacheability: this.calculateCacheability(stats),
      recommendedStrategy: null
    };
    
    // Determine caching strategy
    pattern.recommendedStrategy = this.recommendStrategy(pattern);
    
    this.patterns.set(endpoint, pattern);
  }
  
  calculateCacheability(stats) {
    let score = 100;
    
    // High variation reduces cacheability
    if (stats.variations.size > 10) {
      score -= 30;
    }
    
    // Very frequent updates reduce cacheability
    const updateFrequency = this.detectUpdateFrequency(stats);
    if (updateFrequency > 0.5) { // Updates more than 50% of the time
      score -= 40;
    }
    
    // Large responses benefit more from caching
    if (stats.totalSize / stats.count > 100000) { // > 100KB average
      score += 20;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  recommendStrategy(pattern) {
    const strategy = {
      type: null,
      ttl: 300,
      storage: 'memory',
      key: null,
      invalidation: 'ttl'
    };
    
    // High traffic + good cacheability = aggressive caching
    if (pattern.requestsPerMinute > 10 && pattern.cacheability > 70) {
      strategy.type = 'aggressive';
      strategy.ttl = 3600; // 1 hour
      strategy.storage = pattern.avgSize > 50000 ? 'redis' : 'memory';
    }
    // Moderate traffic + moderate cacheability = standard caching
    else if (pattern.requestsPerMinute > 1 && pattern.cacheability > 50) {
      strategy.type = 'standard';
      strategy.ttl = 300; // 5 minutes
      strategy.storage = 'memory';
    }
    // Low cacheability but high traffic = micro-caching
    else if (pattern.requestsPerMinute > 5 && pattern.cacheability < 50) {
      strategy.type = 'micro';
      strategy.ttl = 10; // 10 seconds
      strategy.storage = 'memory';
    }
    // Everything else = conditional caching
    else {
      strategy.type = 'conditional';
      strategy.ttl = 60;
      strategy.storage = 'memory';
    }
    
    return strategy;
  }
}
```

### 1.2 Cache Key Generation
```javascript
class CacheKeyGenerator {
  constructor() {
    this.keyStrategies = new Map();
  }
  
  generateKeyStrategy(endpoint, variations) {
    // Analyze which parts of the request create variations
    const varyingParts = this.analyzeVariations(variations);
    
    const strategy = {
      base: endpoint.replace(/[/:]/g, '_'),
      include: [],
      exclude: [],
      transform: {}
    };
    
    // Determine what to include in cache key
    if (varyingParts.query.length > 0) {
      strategy.include.push(...varyingParts.query.map(q => `query.${q}`));
    }
    
    if (varyingParts.headers.length > 0) {
      strategy.include.push(...varyingParts.headers.map(h => `headers.${h}`));
    }
    
    if (varyingParts.user) {
      strategy.include.push('user.id');
    }
    
    // Exclude non-significant variations
    strategy.exclude = this.findInsignificantVariations(variations);
    
    // Add transformations for normalization
    strategy.transform = {
      query: {
        // Sort query params for consistent keys
        sort: true,
        // Lowercase string values
        lowercase: ['search', 'filter'],
        // Round numeric values
        round: { page: 1, limit: 10 }
      }
    };
    
    this.keyStrategies.set(endpoint, strategy);
    return strategy;
  }
  
  generateKey(req, strategy) {
    const keyParts = [strategy.base];
    
    // Add included parts
    for (const include of strategy.include) {
      const [type, ...path] = include.split('.');
      let value = req[type];
      
      for (const p of path) {
        value = value?.[p];
      }
      
      if (value !== undefined) {
        // Apply transformations
        value = this.applyTransform(value, strategy.transform[type]?.[path.join('.')]);
        keyParts.push(`${include}:${value}`);
      }
    }
    
    // Generate final key
    return keyParts.join(':');
  }
  
  applyTransform(value, transform) {
    if (!transform) return value;
    
    if (transform.lowercase && typeof value === 'string') {
      return value.toLowerCase();
    }
    
    if (transform.round && typeof value === 'number') {
      return Math.round(value / transform.round) * transform.round;
    }
    
    return value;
  }
}
```

## 2. Cache Implementation

### 2.1 Multi-Level Cache
```javascript
class MultiLevelCache {
  constructor(config) {
    this.levels = [];
    
    // L1: In-memory cache (fastest, smallest)
    if (config.memory) {
      this.levels.push(new MemoryCache(config.memory));
    }
    
    // L2: Redis cache (fast, medium size)
    if (config.redis) {
      this.levels.push(new RedisCache(config.redis));
    }
    
    // L3: CDN cache (slower, unlimited size)
    if (config.cdn) {
      this.levels.push(new CDNCache(config.cdn));
    }
  }
  
  async get(key) {
    for (let i = 0; i < this.levels.length; i++) {
      const value = await this.levels[i].get(key);
      
      if (value !== null) {
        // Promote to higher levels
        for (let j = 0; j < i; j++) {
          await this.levels[j].set(key, value, this.levels[i].ttl);
        }
        
        return {
          value,
          level: i,
          hit: true
        };
      }
    }
    
    return { hit: false };
  }
  
  async set(key, value, ttl) {
    // Set in all levels
    const promises = this.levels.map(level => 
      level.set(key, value, ttl).catch(err => 
        console.error(`Cache set error at level ${level.name}:`, err)
      )
    );
    
    await Promise.all(promises);
  }
  
  async invalidate(pattern) {
    // Invalidate in all levels
    const promises = this.levels.map(level =>
      level.invalidate(pattern).catch(err =>
        console.error(`Cache invalidation error at level ${level.name}:`, err)
      )
    );
    
    await Promise.all(promises);
  }
}

// L1: Memory Cache
class MemoryCache {
  constructor(config) {
    this.name = 'memory';
    this.cache = new Map();
    this.maxSize = config.maxSize || 1000;
    this.ttl = config.ttl || 300;
  }
  
  async get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  async set(key, value, ttl = this.ttl) {
    // Implement LRU eviction
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
  }
  
  async invalidate(pattern) {
    const regex = new RegExp(pattern);
    
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// L2: Redis Cache
class RedisCache {
  constructor(config) {
    this.name = 'redis';
    this.client = redis.createClient(config);
    this.ttl = config.ttl || 3600;
  }
  
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }
  
  async set(key, value, ttl = this.ttl) {
    try {
      await this.client.setex(
        key,
        ttl,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }
  
  async invalidate(pattern) {
    return new Promise((resolve, reject) => {
      const stream = this.client.scanStream({
        match: pattern,
        count: 100
      });
      
      stream.on('data', (keys) => {
        if (keys.length) {
          this.client.unlink(keys);
        }
      });
      
      stream.on('end', resolve);
      stream.on('error', reject);
    });
  }
}
```

### 2.2 Smart Invalidation
```javascript
class CacheInvalidator {
  constructor(cache) {
    this.cache = cache;
    this.dependencies = new Map();
    this.tags = new Map();
  }
  
  // Track dependencies between cache entries
  addDependency(key, dependsOn) {
    if (!this.dependencies.has(dependsOn)) {
      this.dependencies.set(dependsOn, new Set());
    }
    
    this.dependencies.get(dependsOn).add(key);
  }
  
  // Tag-based invalidation
  addTags(key, tags) {
    for (const tag of tags) {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      
      this.tags.get(tag).add(key);
    }
  }
  
  // Invalidate by dependency
  async invalidateDependents(key) {
    const dependents = this.dependencies.get(key);
    
    if (dependents) {
      for (const dependent of dependents) {
        await this.cache.invalidate(dependent);
        
        // Recursively invalidate
        await this.invalidateDependents(dependent);
      }
    }
  }
  
  // Invalidate by tag
  async invalidateTag(tag) {
    const keys = this.tags.get(tag);
    
    if (keys) {
      for (const key of keys) {
        await this.cache.invalidate(key);
      }
      
      this.tags.delete(tag);
    }
  }
  
  // Time-based invalidation with jitter
  scheduleInvalidation(key, ttl) {
    // Add random jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * ttl; // 10% jitter
    const timeout = (ttl + jitter) * 1000;
    
    setTimeout(() => {
      this.cache.invalidate(key);
    }, timeout);
  }
}
```

### 2.3 Cache Warming
```javascript
class CacheWarmer {
  constructor(cache, analyzer) {
    this.cache = cache;
    this.analyzer = analyzer;
    this.warmupQueue = [];
    this.isWarming = false;
  }
  
  // Identify what to warm
  async identifyWarmupTargets() {
    const patterns = this.analyzer.patterns;
    const targets = [];
    
    for (const [endpoint, pattern] of patterns) {
      // High traffic endpoints with good cacheability
      if (pattern.requestsPerMinute > 5 && pattern.cacheability > 70) {
        targets.push({
          endpoint,
          priority: pattern.requestsPerMinute * pattern.cacheability,
          variations: this.getMostCommonVariations(pattern)
        });
      }
    }
    
    // Sort by priority
    return targets.sort((a, b) => b.priority - a.priority);
  }
  
  getMostCommonVariations(pattern) {
    // Get top 10 most common request variations
    const variations = Array.from(pattern.variations.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([variation]) => JSON.parse(variation));
    
    return variations;
  }
  
  // Warm cache before deployment
  async warmCache() {
    if (this.isWarming) return;
    
    this.isWarming = true;
    const targets = await this.identifyWarmupTargets();
    
    console.log(`🔥 Warming cache for ${targets.length} endpoints...`);
    
    for (const target of targets) {
      for (const variation of target.variations) {
        this.warmupQueue.push({
          endpoint: target.endpoint,
          params: variation
        });
      }
    }
    
    // Process queue with rate limiting
    await this.processWarmupQueue();
    
    this.isWarming = false;
    console.log('✅ Cache warming complete');
  }
  
  async processWarmupQueue() {
    const concurrent = 5;
    const delay = 100; // ms between batches
    
    while (this.warmupQueue.length > 0) {
      const batch = this.warmupQueue.splice(0, concurrent);
      
      await Promise.all(
        batch.map(item => this.warmEndpoint(item))
      );
      
      if (this.warmupQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  async warmEndpoint({ endpoint, params }) {
    try {
      // Make internal request to populate cache
      const response = await internalRequest({
        method: 'GET',
        path: endpoint,
        query: params.query,
        headers: params.headers,
        user: params.userId ? { id: params.userId } : null
      });
      
      console.log(`✅ Warmed: ${endpoint}`);
    } catch (error) {
      console.error(`❌ Failed to warm ${endpoint}:`, error.message);
    }
  }
}
```

## 3. Cache Strategies

### 3.1 Write-Through Cache
```javascript
class WriteThroughCache {
  constructor(cache, database) {
    this.cache = cache;
    this.database = database;
  }
  
  async write(key, value) {
    // Write to database first
    await this.database.write(key, value);
    
    // Then update cache
    await this.cache.set(key, value);
    
    // Invalidate related caches
    await this.invalidateRelated(key);
  }
  
  async read(key) {
    // Try cache first
    const cached = await this.cache.get(key);
    if (cached.hit) return cached.value;
    
    // Load from database
    const value = await this.database.read(key);
    
    // Update cache
    if (value) {
      await this.cache.set(key, value);
    }
    
    return value;
  }
}
```

### 3.2 Write-Behind Cache
```javascript
class WriteBehindCache {
  constructor(cache, database, config = {}) {
    this.cache = cache;
    this.database = database;
    this.writeQueue = [];
    this.batchSize = config.batchSize || 100;
    this.flushInterval = config.flushInterval || 5000;
    
    this.startFlushing();
  }
  
  async write(key, value) {
    // Update cache immediately
    await this.cache.set(key, value);
    
    // Queue database write
    this.writeQueue.push({ key, value, timestamp: Date.now() });
    
    // Flush if queue is full
    if (this.writeQueue.length >= this.batchSize) {
      await this.flush();
    }
  }
  
  startFlushing() {
    setInterval(() => {
      if (this.writeQueue.length > 0) {
        this.flush().catch(console.error);
      }
    }, this.flushInterval);
  }
  
  async flush() {
    const batch = this.writeQueue.splice(0, this.batchSize);
    
    if (batch.length === 0) return;
    
    try {
      // Batch write to database
      await this.database.batchWrite(batch);
      console.log(`✅ Flushed ${batch.length} writes to database`);
    } catch (error) {
      console.error('❌ Write-behind flush failed:', error);
      
      // Re-queue failed writes
      this.writeQueue.unshift(...batch);
    }
  }
}
```

## 4. Cache Monitoring

### 4.1 Cache Metrics
```javascript
class CacheMetrics {
  constructor() {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      latency: []
    };
    
    this.startTime = Date.now();
  }
  
  recordHit(latency) {
    this.metrics.hits++;
    this.metrics.latency.push(latency);
  }
  
  recordMiss(latency) {
    this.metrics.misses++;
    this.metrics.latency.push(latency);
  }
  
  getStats() {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? this.metrics.hits / total : 0;
    
    const latencies = this.metrics.latency.sort((a, b) => a - b);
    
    return {
      hitRate: (hitRate * 100).toFixed(2) + '%',
      totalRequests: total,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      avgLatency: this.average(latencies),
      p50Latency: this.percentile(latencies, 50),
      p95Latency: this.percentile(latencies, 95),
      p99Latency: this.percentile(latencies, 99),
      uptime: Date.now() - this.startTime
    };
  }
  
  average(arr) {
    return arr.length > 0 
      ? arr.reduce((a, b) => a + b) / arr.length 
      : 0;
  }
  
  percentile(arr, p) {
    if (arr.length === 0) return 0;
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[index];
  }
}
```

## 5. Implementation Guide

### 5.1 Generate Cache Implementation
```javascript
function generateCacheImplementation(analysis) {
  const implementations = [];
  
  for (const [endpoint, pattern] of analysis.patterns) {
    if (pattern.cacheability < 30) continue;
    
    const impl = {
      endpoint,
      strategy: pattern.recommendedStrategy,
      code: generateCacheCode(endpoint, pattern),
      config: generateCacheConfig(pattern),
      monitoring: generateMonitoringCode(endpoint)
    };
    
    implementations.push(impl);
  }
  
  return implementations;
}

function generateCacheCode(endpoint, pattern) {
  return `
// Cache implementation for ${endpoint}
const cacheKey = generateKey(req, ${JSON.stringify(pattern.keyStrategy)});
const cache = new MultiLevelCache({
  memory: { maxSize: 1000, ttl: ${pattern.recommendedStrategy.ttl} },
  redis: { ttl: ${pattern.recommendedStrategy.ttl * 2} }
});

// Middleware
async function cacheMiddleware(req, res, next) {
  const key = cacheKey(req);
  const startTime = Date.now();
  
  // Try cache
  const cached = await cache.get(key);
  
  if (cached.hit) {
    metrics.recordHit(Date.now() - startTime);
    res.setHeader('X-Cache', \`HIT; level=\${cached.level}\`);
    return res.json(cached.value);
  }
  
  metrics.recordMiss(Date.now() - startTime);
  
  // Store original send
  const originalSend = res.json.bind(res);
  
  res.json = async function(data) {
    // Cache the response
    await cache.set(key, data, ${pattern.recommendedStrategy.ttl});
    
    // Tag for invalidation
    if (req.user) {
      invalidator.addTags(key, [\`user:\${req.user.id}\`]);
    }
    
    res.setHeader('X-Cache', 'MISS');
    originalSend(data);
  };
  
  next();
}

// Apply to endpoint
router.get('${endpoint}', cacheMiddleware, originalHandler);
`;
}
```

## 6. Cache Report

### 6.1 Generate Implementation Report
```markdown
# Cache Implementation Report

## Summary
- **Endpoints Analyzed**: 47
- **Cacheable Endpoints**: 31
- **Estimated Performance Gain**: 65%
- **Cache Hit Rate Target**: 85%

## Implementation Priority

### High Priority (Implement First)
| Endpoint | RPM | Cacheability | Strategy | TTL |
|----------|-----|--------------|----------|-----|
| /api/products | 450 | 95% | Aggressive | 1h |
| /api/categories | 230 | 90% | Aggressive | 24h |
| /api/user/profile | 180 | 75% | Standard | 5m |

### Medium Priority
| Endpoint | RPM | Cacheability | Strategy | TTL |
|----------|-----|--------------|----------|-----|
| /api/search | 120 | 60% | Conditional | 1m |
| /api/recommendations | 90 | 55% | Standard | 5m |

### Micro-Caching (High Traffic, Low Cache)
| Endpoint | RPM | Reason | TTL |
|----------|-----|--------|-----|
| /api/feed | 600 | Personalized | 10s |
| /api/notifications | 450 | Real-time | 5s |

## Implementation Steps

1. **Install Dependencies**
   ```bash
   npm install redis ioredis cache-manager
   ```

2. **Configure Redis**
   ```javascript
   const redis = {
     host: process.env.REDIS_HOST,
     port: 6379,
     maxRetriesPerRequest: 3
   };
   ```

3. **Apply Middleware**
   - Add cache middleware to routes
   - Configure TTLs per endpoint
   - Set up monitoring

4. **Warm Cache**
   ```bash
   npm run cache:warm
   ```

## Monitoring Dashboard

Access cache metrics at: `/admin/cache-metrics`

Key metrics to track:
- Hit rate by endpoint
- Cache size and memory usage
- Latency improvements
- Invalidation frequency

## Invalidation Strategy

### Event-Based Invalidation
- User profile update → Invalidate user:* tags
- Product update → Invalidate product:${id}
- Category change → Invalidate all category caches

### Time-Based Invalidation
- Products: 1 hour
- User profiles: 5 minutes
- Search results: 1 minute
- Static content: 24 hours
```

Implement intelligent caching for maximum performance.