const promClient = require('prom-client');
const logger = require('./logger');

// Initialize Prometheus metrics
class MetricsCollector {
  constructor() {
    // Create a Registry which registers the metrics
    this.register = new promClient.Registry();

    // Add a default label which is added to all metrics
    this.register.setDefaultLabels({
      app: 'ai-masterclass',
      version: process.env.API_VERSION || '1.0.0'
    });

    // Enable the collection of default metrics
    promClient.collectDefaultMetrics({
      register: this.register,
      prefix: 'nodejs_'
    });

    this.initCustomMetrics();
  }

  initCustomMetrics() {
    // HTTP Request Duration
    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10]
    });

    // HTTP Request Counter
    this.httpRequestTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    // Database Query Duration
    this.dbQueryDuration = new promClient.Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['query_type', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
    });

    // Database Connection Pool
    this.dbConnectionPool = new promClient.Gauge({
      name: 'db_connection_pool_size',
      help: 'Current database connection pool size',
      labelNames: ['state']
    });

    // Authentication Metrics
    this.authAttempts = new promClient.Counter({
      name: 'auth_attempts_total',
      help: 'Total number of authentication attempts',
      labelNames: ['type', 'success']
    });

    // User Sessions
    this.activeSessions = new promClient.Gauge({
      name: 'active_user_sessions',
      help: 'Number of active user sessions'
    });

    // Course Completion Metrics
    this.courseCompletions = new promClient.Counter({
      name: 'course_completions_total',
      help: 'Total number of course completions',
      labelNames: ['course_id', 'level']
    });

    // Memory Usage
    this.memoryUsage = new promClient.Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type']
    });

    // API Rate Limiting
    this.rateLimitHits = new promClient.Counter({
      name: 'rate_limit_hits_total',
      help: 'Total number of rate limit hits',
      labelNames: ['endpoint', 'ip']
    });

    // AI Service Metrics
    this.aiRequestDuration = new promClient.Histogram({
      name: 'ai_request_duration_seconds',
      help: 'Duration of AI API requests in seconds',
      labelNames: ['provider', 'model', 'status'],
      buckets: [0.5, 1, 2, 5, 10, 15, 30, 60]
    });

    this.aiRequestTotal = new promClient.Counter({
      name: 'ai_requests_total',
      help: 'Total number of AI API requests',
      labelNames: ['provider', 'model', 'status']
    });

    this.aiTokensUsed = new promClient.Counter({
      name: 'ai_tokens_used_total',
      help: 'Total number of AI tokens consumed',
      labelNames: ['provider', 'model', 'token_type']
    });

    this.aiResponseQuality = new promClient.Histogram({
      name: 'ai_response_quality_score',
      help: 'AI response quality scores',
      labelNames: ['provider', 'model'],
      buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    });

    // Register all metrics
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestTotal);
    this.register.registerMetric(this.dbQueryDuration);
    this.register.registerMetric(this.dbConnectionPool);
    this.register.registerMetric(this.authAttempts);
    this.register.registerMetric(this.activeSessions);
    this.register.registerMetric(this.courseCompletions);
    this.register.registerMetric(this.memoryUsage);
    this.register.registerMetric(this.rateLimitHits);
    this.register.registerMetric(this.aiRequestDuration);
    this.register.registerMetric(this.aiRequestTotal);
    this.register.registerMetric(this.aiTokensUsed);
    this.register.registerMetric(this.aiResponseQuality);

    logger.info('Prometheus metrics initialized');
  }

  // Middleware to collect HTTP metrics
  httpMetricsMiddleware() {
    return (req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;
        const labels = {
          method: req.method,
          route: route,
          status_code: res.statusCode
        };

        this.httpRequestDuration.observe(labels, duration);
        this.httpRequestTotal.inc(labels);
      });

      next();
    };
  }

  // Record database query metrics
  recordDbQuery(queryType, table, duration) {
    this.dbQueryDuration.observe(
      { query_type: queryType, table: table },
      duration
    );
  }

  // Update database connection pool metrics
  updateDbConnectionPool(total, idle, waiting) {
    this.dbConnectionPool.set({ state: 'total' }, total);
    this.dbConnectionPool.set({ state: 'idle' }, idle);
    this.dbConnectionPool.set({ state: 'waiting' }, waiting);
  }

  // Record authentication attempt
  recordAuthAttempt(type, success) {
    this.authAttempts.inc({ type: type, success: success ? 'true' : 'false' });
  }

  // Update active sessions count
  updateActiveSessions(count) {
    this.activeSessions.set(count);
  }

  // Record course completion
  recordCourseCompletion(courseId, level) {
    this.courseCompletions.inc({ course_id: courseId, level: level.toString() });
  }

  // Update memory usage
  updateMemoryUsage() {
    const memUsage = process.memoryUsage();
    this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    this.memoryUsage.set({ type: 'heapTotal' }, memUsage.heapTotal);
    this.memoryUsage.set({ type: 'heapUsed' }, memUsage.heapUsed);
    this.memoryUsage.set({ type: 'external' }, memUsage.external);
  }

  // Record rate limit hit
  recordRateLimitHit(endpoint, ip) {
    this.rateLimitHits.inc({ endpoint: endpoint, ip: ip });
  }

  // Record AI API request metrics
  recordAIRequest(provider, model, duration, status) {
    const durationInSeconds = duration / 1000;
    const labels = { provider, model, status };
    
    this.aiRequestDuration.observe(labels, durationInSeconds);
    this.aiRequestTotal.inc(labels);
  }

  // Record AI token usage
  recordAITokenUsage(provider, model, promptTokens, completionTokens) {
    if (promptTokens > 0) {
      this.aiTokensUsed.inc({ provider, model, token_type: 'prompt' }, promptTokens);
    }
    if (completionTokens > 0) {
      this.aiTokensUsed.inc({ provider, model, token_type: 'completion' }, completionTokens);
    }
  }

  // Record AI response quality score
  recordAIQualityScore(provider, model, score) {
    if (score >= 0 && score <= 1) {
      this.aiResponseQuality.observe({ provider, model }, score);
    }
  }

  // Get metrics for Prometheus scraping
  async getMetrics() {
    return await this.register.metrics();
  }

  // Start collecting system metrics
  startPeriodicCollection() {
    // Update memory usage every 30 seconds
    setInterval(() => {
      this.updateMemoryUsage();
    }, 30000);

    // Update database connection pool metrics every 60 seconds
    setInterval(async () => {
      try {
        const db = require('../db');
        if (db.pool) {
          this.updateDbConnectionPool(
            db.pool.totalCount || 0,
            db.pool.idleCount || 0,
            db.pool.waitingCount || 0
          );
        }
      } catch (error) {
        logger.error('Failed to collect DB pool metrics:', error);
      }
    }, 60000);

    logger.info('Started periodic metrics collection');
  }

  // Create a summary report of key metrics
  async getSummaryReport() {
    try {
      const metrics = await this.getMetrics();
      const lines = metrics.split('\n');
      
      const summary = {
        timestamp: new Date().toISOString(),
        http_requests_total: this.extractMetricValue(lines, 'http_requests_total'),
        avg_response_time: this.extractMetricValue(lines, 'http_request_duration_seconds'),
        memory_used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptime_seconds: Math.round(process.uptime()),
        auth_attempts: this.extractMetricValue(lines, 'auth_attempts_total'),
        course_completions: this.extractMetricValue(lines, 'course_completions_total'),
        ai_requests_total: this.extractMetricValue(lines, 'ai_requests_total'),
        ai_tokens_used: this.extractMetricValue(lines, 'ai_tokens_used_total')
      };

      return summary;
    } catch (error) {
      logger.error('Failed to generate metrics summary:', error);
      return null;
    }
  }

  extractMetricValue(lines, metricName) {
    const line = lines.find(l => l.startsWith(metricName) && !l.includes('#'));
    if (line) {
      const parts = line.split(' ');
      return parseFloat(parts[parts.length - 1]) || 0;
    }
    return 0;
  }
}

// Singleton instance
const metricsCollector = new MetricsCollector();

module.exports = metricsCollector;