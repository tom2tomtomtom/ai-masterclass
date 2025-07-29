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

// Import routes
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const interactiveRoutes = require('./routes/interactive');
const aiPlaygroundRoutes = require('./routes/aiPlayground');
const templateRoutes = require('./routes/templates');

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
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use(apiLimiter);

// Logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Masterclass API',
    version: '1.0.0',
    status: 'active',
    documentation: '/api/docs',
    features: [
      'AI Playground - Multi-provider AI model integration',
      'Template Library - 100+ business prompt templates',
      'Progress Tracking - Student learning analytics',
      'Interactive Learning - Hands-on practice exercises'
    ]
  });
});

// Auth routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Protected routes
app.use('/api/progress', auth, progressRoutes);
app.use('/api/interactive', auth, interactiveRoutes);
app.use('/api/ai-playground', auth, aiPlaygroundRoutes);
app.use('/api/templates', auth, templateRoutes);

// Courses endpoints with improved queries and validation
app.get('/api/courses', courseLimiter, async (req, res) => {
  try {
    const { page = 1, limit = 50, level, status = 'published' } = req.query;
    const offset = (page - 1) * limit;

    // Use modules table as courses since that's what we have
    const query = `
      SELECT
        id, title, description, difficulty as level, order_index,
        estimated_minutes, module_type, created_at, updated_at,
        (estimated_minutes / 60.0) as estimated_hours
      FROM modules
      ORDER BY order_index, title
      LIMIT $1 OFFSET $2
    `;

    const { rows } = await db.query(query, [limit, offset]);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM modules`;
    const { rows: countRows } = await db.query(countQuery);
    const total = parseInt(countRows[0].count);

    // Transform data to match expected course format
    const courses = rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      level: row.level || 'intermediate',
      order_index: row.order_index,
      estimated_hours: row.estimated_hours || (row.estimated_minutes / 60),
      status: 'published',
      created_at: row.created_at,
      updated_at: row.updated_at,
      module_type: row.module_type
    }));

    res.json({
      success: true,
      data: courses,
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

// Modules endpoint
app.get('/api/modules', courseLimiter, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
      SELECT
        id, title, description, difficulty, order_index,
        estimated_minutes, module_type, created_at, updated_at
      FROM modules
      ORDER BY order_index, title
      LIMIT $1 OFFSET $2
    `;

    const { rows } = await db.query(query, [limit, offset]);

    res.json(rows);
  } catch (err) {
    logger.error('Error fetching modules:', err);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch modules. Please try again later.'
    });
  }
});

// Lessons endpoint
app.get('/api/lessons', courseLimiter, async (req, res) => {
  try {
    const { page = 1, limit = 100, module_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        id, module_id, title, content, order_index,
        estimated_minutes, lesson_type, created_at, updated_at
      FROM lessons
    `;

    let queryParams = [];

    if (module_id) {
      query += ` WHERE module_id = $1 ORDER BY order_index LIMIT $2 OFFSET $3`;
      queryParams = [module_id, limit, offset];
    } else {
      query += ` ORDER BY module_id, order_index LIMIT $1 OFFSET $2`;
      queryParams = [limit, offset];
    }

    const { rows } = await db.query(query, queryParams);

    res.json(rows);
  } catch (err) {
    logger.error('Error fetching lessons:', err);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch lessons. Please try again later.'
    });
  }
});

// Module lessons endpoint
app.get('/api/modules/:id/lessons', courseLimiter, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        id, module_id, title, content, order_index,
        estimated_minutes, lesson_type, created_at, updated_at
      FROM lessons
      WHERE module_id = $1
      ORDER BY order_index
    `;

    const { rows } = await db.query(query, [id]);

    res.json(rows);
  } catch (err) {
    logger.error('Error fetching module lessons:', err);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch module lessons. Please try again later.'
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
    
    // Fetch modules with lessons in a single query
    const query = `
      SELECT 
        m.id as module_id,
        m.title as module_title,
        m.description as module_description,
        m.order_index as module_order,
        m.estimated_minutes as module_duration,
        m.module_type,
        m.difficulty as module_difficulty,
        l.id as lesson_id,
        l.title as lesson_title,
        l.description as lesson_description,
        l.estimated_minutes as lesson_duration,
        l.lesson_type,
        l.difficulty as lesson_difficulty,
        l.order_index as lesson_order
      FROM modules m
      LEFT JOIN lessons l ON m.id = l.module_id
      WHERE m.course_id = $1
      ORDER BY m.order_index, l.order_index
    `;
    
    const { rows } = await db.query(query, [id]);
    
    // Group lessons by module
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
          lessons: []
        });
      }
      
      if (row.lesson_id) {
        modulesMap.get(row.module_id).lessons.push({
          id: row.lesson_id,
          title: row.lesson_title,
          description: row.lesson_description,
          estimated_minutes: row.lesson_duration,
          lesson_type: row.lesson_type,
          difficulty: row.lesson_difficulty,
          order_index: row.lesson_order
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

// Course lessons endpoint
app.get('/api/courses/:id/lessons', courseLimiter, validateCourseId, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        l.id,
        l.title,
        l.description,
        l.content,
        l.order_index,
        l.estimated_minutes,
        l.lesson_type,
        l.difficulty,
        l.learning_objectives,
        l.platform_focus,
        l.created_at,
        m.title as module_title,
        m.order_index as module_order
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE m.course_id = $1
      ORDER BY m.order_index, l.order_index
    `;
    
    const { rows } = await db.query(query, [id]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    logger.error('Error fetching course lessons:', err);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch course lessons. Please try again later.'
    });
  }
});

// Course prompts endpoint
app.get('/api/courses/:id/prompts', courseLimiter, validateCourseId, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.prompt_text,
        p.platform,
        p.difficulty,
        p.expected_output,
        p.use_case,
        p.order_index,
        p.lesson_id,
        l.title as lesson_title,
        m.title as module_title
      FROM prompts p
      JOIN lessons l ON p.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      WHERE m.course_id = $1
      ORDER BY m.order_index, l.order_index, p.order_index
    `;
    
    const { rows } = await db.query(query, [id]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    logger.error('Error fetching course prompts:', err);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch course prompts. Please try again later.'
    });
  }
});

// Course quizzes endpoint
app.get('/api/courses/:id/quizzes', courseLimiter, validateCourseId, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        q.id,
        q.question_text,
        q.question_type,
        q.options,
        q.correct_answer,
        q.explanation,
        q.difficulty,
        q.order_index,
        q.lesson_id,
        l.title as lesson_title,
        m.title as module_title
      FROM quizzes q
      JOIN lessons l ON q.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      WHERE m.course_id = $1
      ORDER BY m.order_index, l.order_index, q.order_index
    `;
    
    const { rows } = await db.query(query, [id]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    logger.error('Error fetching course quizzes:', err);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch course quizzes. Please try again later.'
    });
  }
});

// Course tasks endpoint
app.get('/api/courses/:id/tasks', courseLimiter, validateCourseId, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.instructions,
        t.submission_format,
        t.is_required,
        t.estimated_minutes,
        t.validation_criteria,
        t.order_index,
        t.lesson_id,
        l.title as lesson_title,
        m.title as module_title
      FROM tasks t
      JOIN lessons l ON t.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      WHERE m.course_id = $1
      ORDER BY m.order_index, l.order_index, t.order_index
    `;
    
    const { rows } = await db.query(query, [id]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    logger.error('Error fetching course tasks:', err);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch course tasks. Please try again later.'
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
  logger.info('Features enabled: AI Playground, Template Library, Progress Tracking');
});

module.exports = app;