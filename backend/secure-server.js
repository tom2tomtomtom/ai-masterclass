require('dotenv').config();
const express = require('express');
const compression = require('compression');
const logger = require('./utils/logger');

// Import comprehensive security middleware
const {
  getSecurityConfig,
  setupHoneypots,
  trackFailedAuth,
  corsErrorHandler,
  validateSearchQuery
} = require('./middleware/security');

// Import existing middleware and routes
const auth = require('./middleware/auth');
const DatabaseHealthCheck = require('./db/health-check');
const metricsCollector = require('./utils/metrics');

// Import routes
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');

const app = express();
const port = process.env.PORT || 5001;

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (\!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Get security configuration
const securityConfig = getSecurityConfig();

// Apply core security middleware first
securityConfig.core.forEach(middleware => {
  app.use(middleware);
});

// Apply CORS with security enhancements
app.use(securityConfig.cors);

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply API rate limiting
app.use(securityConfig.rateLimiting.api);

// Metrics collection middleware
app.use(metricsCollector.httpMetricsMiddleware());

// Logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Trust proxy for proper IP detection behind load balancers
app.set('trust proxy', 1);

// Setup honeypot routes for bot detection
setupHoneypots(app);

// Initialize database health checker if database is configured
let healthChecker;
if (process.env.DB_HOST) {
  const db = require('./db');
  healthChecker = new DatabaseHealthCheck(db.pool);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    security: {
      cors: 'enabled',
      rateLimit: 'enabled',
      validation: 'enhanced',
      headers: 'secure'
    }
  });
});

// Advanced database health check endpoint
if (healthChecker) {
  app.get('/health/database', healthChecker.getHealthCheckMiddleware());
}

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await metricsCollector.getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    logger.error('Error serving metrics:', error);
    res.status(500).send('Error generating metrics');
  }
});

// API metrics endpoint for internal monitoring
app.get('/api/metrics', async (req, res) => {
  try {
    const summary = await metricsCollector.getSummaryReport();
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Error generating metrics summary:', error);
    res.status(500).json({
      success: false,
      msg: 'Error generating metrics summary'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Masterclass API - Secure',
    version: '2.0.0',
    status: 'active',
    security: 'enhanced',
    documentation: '/api/docs'
  });
});

// Auth routes with enhanced rate limiting and tracking
app.use('/api/auth', 
  securityConfig.rateLimiting.auth, 
  trackFailedAuth,
  authRoutes
);

// Protected routes with session security
app.use('/api/progress', 
  ...securityConfig.session,
  auth, 
  progressRoutes
);

// Courses endpoints with enhanced security
app.get('/api/courses', 
  securityConfig.rateLimiting.courses,
  validateSearchQuery,
  async (req, res) => {
    try {
      // If database is not configured, return mock data
      if (\!process.env.DB_HOST) {
        return res.json({
          success: true,
          data: [],
          msg: 'Database not configured - returning empty result'
        });
      }

      const db = require('./db');
      const { page = 1, limit = 10, level, status = 'published' } = req.query;
      const offset = (page - 1) * limit;
      
      let whereClause = 'WHERE status = $1';
      let queryParams = [status];
      let paramCount = 1;
      
      if (level) {
        paramCount++;
        whereClause += ` AND level = $${paramCount}`;
        queryParams.push(level);
      }
      
      const query = `
        SELECT 
          id, title, description, level, order_index, 
          estimated_hours, status, created_at, updated_at
        FROM courses 
        ${whereClause}
        ORDER BY level, order_index 
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      
      queryParams.push(limit, offset);
      
      const { rows } = await db.query(query, queryParams);
      
      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) FROM courses ${whereClause}`;
      const { rows: countRows } = await db.query(countQuery, queryParams.slice(0, -2));
      const total = parseInt(countRows[0].count);
      
      res.json({
        success: true,
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      logger.error('Error fetching courses:', err);
      res.status(500).json({
        success: false,
        msg: 'Unable to fetch courses. Please try again later.'
      });
    }
  }
);

// Global error handler with security awareness
app.use((err, req, res, next) => {
  // Log security-related errors with more detail
  if (err.status === 403 || err.status === 401 || err.message.includes('CORS')) {
    logger.warn('Security-related error:', {
      error: err.message,
      status: err.status,
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
  } else {
    logger.error('Unhandled error:', err);
  }
  
  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    msg: isDevelopment ? err.message : 'An unexpected error occurred. Please try again later.',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Apply error handlers
securityConfig.errorHandlers.forEach(handler => {
  app.use(handler);
});

// 404 handler with logging
app.use('*', (req, res) => {
  logger.warn('404 - Route not found:', {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({
    success: false,
    msg: 'Endpoint not found'
  });
});

// Graceful shutdown with security cleanup
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  
  // Cleanup security-related resources
  if (healthChecker) {
    healthChecker.stop();
  }
  
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start server
app.listen(port, () => {
  logger.info(`Secure AI Masterclass API server running on port: ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Security features enabled:');
  logger.info('  ✓ Enhanced input validation and sanitization');
  logger.info('  ✓ Advanced rate limiting with progressive penalties');
  logger.info('  ✓ Comprehensive security headers');
  logger.info('  ✓ CORS with environment-specific configuration');
  logger.info('  ✓ Session security with JWT enhancements');
  logger.info('  ✓ SQL injection and XSS prevention');
  logger.info('  ✓ Honeypot endpoints for bot detection');
  
  // Start periodic health monitoring if configured
  if (healthChecker) {
    healthChecker.startPeriodicHealthCheck(5);
    logger.info('  ✓ Database health monitoring started');
  }
  
  // Start metrics collection
  metricsCollector.startPeriodicCollection();
  logger.info('  ✓ Security metrics collection started');
});

module.exports = app;
EOF < /dev/null