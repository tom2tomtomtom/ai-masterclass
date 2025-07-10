require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const db = require('./db');
const logger = require('./utils/logger');
const auth = require('./middleware/auth');
const { apiLimiter, authLimiter, courseLimiter } = require('./middleware/rateLimiter');
const { validateCourseId, validateUserId } = require('./middleware/validation');
const DatabaseHealthCheck = require('./db/health-check');
const metricsCollector = require('./utils/metrics');

// Import routes
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');

const app = express();
const port = process.env.PORT || 5001;

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'DB_USER', 'DB_HOST', 'DB_DATABASE', 'DB_PORT'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// General middleware
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use(apiLimiter);

// Metrics collection middleware
app.use(metricsCollector.httpMetricsMiddleware());

// Logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Initialize database health checker
const healthChecker = new DatabaseHealthCheck(db.pool);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Advanced database health check endpoint
app.get('/health/database', healthChecker.getHealthCheckMiddleware());

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
    message: 'AI Masterclass API',
    version: '1.0.0',
    status: 'active',
    documentation: '/api/docs'
  });
});

// Auth routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Protected routes
app.use('/api/progress', auth, progressRoutes);

// Courses endpoints with improved queries and validation
app.get('/api/courses', courseLimiter, async (req, res) => {
  try {
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
});

app.get('/api/courses/:id', courseLimiter, validateCourseId, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT * FROM courses WHERE id = $1 AND status = $2', 
      [id, 'published']
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'Course not found or not available'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    logger.error('Error fetching course:', err);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch course details. Please try again later.'
    });
  }
});

// Fixed N+1 query problem with JOIN
app.get('/api/courses/:id/modules', courseLimiter, validateCourseId, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if course exists
    const { rows: courseCheck } = await db.query(
      'SELECT id FROM courses WHERE id = $1 AND status = $2', 
      [id, 'published']
    );
    
    if (courseCheck.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'Course not found or not available'
      });
    }
    
    // Fetch modules with exercises in a single query
    const query = `
      SELECT 
        m.id as module_id,
        m.title as module_title,
        m.description as module_description,
        m.order_index as module_order,
        m.estimated_minutes as module_duration,
        m.module_type,
        m.difficulty as module_difficulty,
        e.id as exercise_id,
        e.title as exercise_title,
        e.description as exercise_description,
        e.estimated_minutes as exercise_duration,
        e.difficulty as exercise_difficulty,
        e.exercise_type
      FROM modules m
      LEFT JOIN exercises e ON m.id = e.module_id
      WHERE m.course_id = $1
      ORDER BY m.order_index, e.id
    `;
    
    const { rows } = await db.query(query, [id]);
    
    // Group exercises by module
    const modulesMap = new Map();
    
    rows.forEach(row => {
      if (!modulesMap.has(row.module_id)) {
        modulesMap.set(row.module_id, {
          id: row.module_id,
          title: row.module_title,
          description: row.module_description,
          order_index: row.module_order,
          estimated_minutes: row.module_duration,
          module_type: row.module_type,
          difficulty: row.module_difficulty,
          exercises: []
        });
      }
      
      if (row.exercise_id) {
        modulesMap.get(row.module_id).exercises.push({
          id: row.exercise_id,
          title: row.exercise_title,
          description: row.exercise_description,
          estimated_minutes: row.exercise_duration,
          difficulty: row.exercise_difficulty,
          exercise_type: row.exercise_type
        });
      }
    });
    
    const modules = Array.from(modulesMap.values());
    
    res.json({
      success: true,
      data: modules
    });
  } catch (err) {
    logger.error('Error fetching course modules:', err);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch course modules. Please try again later.'
    });
  }
});

app.get('/api/progress/:user_id', auth, validateUserId, async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // Verify user can access this progress (either their own or admin)
    if (req.user.id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        msg: 'Access denied'
      });
    }
    
    const { rows } = await db.query(
      `SELECT 
        exercise_id, 
        status, 
        score, 
        completion_percentage, 
        time_spent_minutes,
        updated_at
      FROM user_progress 
      WHERE user_id = $1
      ORDER BY updated_at DESC`, 
      [user_id]
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    logger.error('Error fetching user progress:', err);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch progress. Please try again later.'
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    msg: 'An unexpected error occurred. Please try again later.'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    msg: 'Endpoint not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
    db.end();
  });
});

app.listen(port, () => {
  logger.info(`Server is running on port: ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start periodic database health monitoring
  healthChecker.startPeriodicHealthCheck(5); // Check every 5 minutes
  
  // Start metrics collection
  metricsCollector.startPeriodicCollection();
  
  logger.info('Monitoring and metrics collection started');
});

module.exports = app;