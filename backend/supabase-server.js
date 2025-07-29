// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Try to import logger, fallback to console if not available
let logger;
try {
  logger = require('./utils/logger');
} catch (error) {
  logger = {
    info: console.log,
    error: console.error,
    warn: console.warn
  };
}

logger.info('🚀 Starting AI-Masterclass Backend Server...');
logger.info('💡 Environment loaded:', process.env.NODE_ENV || 'development');

const app = express();
const port = process.env.PORT || 8000;

// Supabase configuration - MUST be set in environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Security check - fail fast if credentials not provided
if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.trim() === '' || supabaseServiceKey.trim() === '') {
  logger.error('❌ SECURITY ERROR: Supabase credentials not configured');
  logger.error('   Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

// Create Supabase client with proper configuration
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'User-Agent': 'AI-Masterclass/1.0.0'
    }
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://fsohtauqtcftdjcjfdpq.supabase.co"],
      fontSrc: ["'self'", "https:", "data:"],
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

// Trust proxy for Railway deployment
app.set('trust proxy', 1);

// Mount API routes
try {
  const authRoutes = require('./routes/supabase-auth');
  app.use('/api/auth', authRoutes);
  logger.info('Supabase authentication routes loaded');
} catch (error) {
  logger.error('Supabase auth routes not available', { error: error.message });
}

try {
  const progressRoutes = require('./routes/supabase-progress');
  app.use('/api/progress', progressRoutes);
  logger.info('Supabase progress routes loaded');
} catch (error) {
  logger.error('Supabase progress routes not available', { error: error.message });
}

try {
  const interactiveRoutes = require('./routes/supabase-interactive');
  app.use('/api/interactive', interactiveRoutes);
  logger.info('Supabase interactive routes loaded');
} catch (error) {
  logger.error('Supabase interactive routes not available', { error: error.message });
}

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Mount health check routes
try {
  const healthRoutes = require('./routes/health');
  app.use('/api', healthRoutes);
  logger.info('Health check routes loaded');
} catch (error) {
  logger.error('Health check routes not available', { error: error.message });
  
  // Fallback health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      // Test Supabase connection
      const { data, error } = await supabase.from('courses').select('count', { count: 'exact' }).limit(1);
      
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: error ? 'error' : 'connected',
        supabase: {
          url: supabaseUrl,
          connected: !error,
          tables_accessible: !error,
          error: error?.message || null
        }
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'error',
        supabase: {
          url: supabaseUrl,
          connected: false,
          error: error.message
        }
      });
    }
  });
}

// Root endpoint - serve React app
app.get('/', (req, res) => {
  const frontendPath = path.join(__dirname, 'build/index.html');
  res.sendFile(frontendPath, (err) => {
    if (err) {
      // Fallback to API response if frontend not found
      res.json({ 
        message: 'AI Masterclass API',
        version: '2.1.0',
        status: 'active',
        database: 'supabase',
        documentation: '/api/docs',
        frontend: 'not_found',
        error: err.message
      });
    }
  });
});

// Database initialization endpoint
app.post('/init-db', async (req, res) => {
  try {
    logger.info('Initializing Supabase database...');
    
    // Test connection first
    const { data: testData, error: testError } = await supabase.from('courses').select('*').limit(1);
    
    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }
    
    // Check if tables exist by trying to query them
    const tables = ['courses', 'lessons', 'prompts', 'quizzes', 'tasks', 'users'];
    const tableStatus = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count', { count: 'exact' }).limit(1);
        tableStatus[table] = error ? 'missing' : 'exists';
      } catch (err) {
        tableStatus[table] = 'missing';
      }
    }
    
    logger.info('Database table status:', tableStatus);
    
    res.json({ 
      status: 'OK', 
      message: 'Database connection verified',
      timestamp: new Date().toISOString(),
      tables: tableStatus,
      note: 'Run the SQL script in Supabase SQL Editor to create missing tables'
    });
  } catch (error) {
    logger.error('Database initialization failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database initialization failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all courses with pagination and filtering
app.get('/api/courses', async (req, res) => {
  try {
    const { page = 1, limit = 10, level, status = 'published', filter = 'with_lessons' } = req.query;
    const offset = (page - 1) * limit;
    
    logger.info('Courses API called with filter:', filter);
    
    if (filter === 'with_lessons') {
      // Hardcode the 3 courses that have lessons based on our analysis
      const courseIdsWithLessons = [
        'cebf3e7b-1ba5-44c0-acc4-02e6167ab0dc', // Level 1: Module 1 Strategy  
        'b3a9d47f-03e2-4021-aa4c-462d1343cf19', // Level 2: Module 3 Visual Ai
        '6457156b-3752-49de-93f4-daa9dcc47c3b'  // Level 3: Module 1 Video
      ];

      let query = supabase
        .from('courses')
        .select('id, title, description, level, estimated_hours, created_at, updated_at')
        .in('id', courseIdsWithLessons)
        .order('level', { ascending: true });

      if (level) {
        query = query.eq('level', level);
      }

      const { data: coursesWithLessons, error: coursesError } = await query;

      if (coursesError) {
        logger.error('Get courses with lessons error:', coursesError);
        return res.json({ 
          success: false, 
          error: coursesError.message,
          data: [],
          message: 'Database query failed. Please check Supabase configuration.'  
        });
      }

      // Add lesson counts for each course (count lessons through modules)
      const coursesWithCounts = await Promise.all(
        (coursesWithLessons || []).map(async (course) => {
          // Get modules for this course
          const { data: modules } = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', course.id);
          
          if (!modules || modules.length === 0) {
            return { ...course, lesson_count: 0 };
          }
          
          // Count lessons in these modules
          const moduleIds = modules.map(m => m.id);
          const { count } = await supabase
            .from('lessons')
            .select('id', { count: 'exact', head: true })
            .in('module_id', moduleIds);
          
          return {
            ...course,
            lesson_count: count || 0
          };
        })
      );

      // Apply pagination
      const paginatedCourses = coursesWithCounts.slice(offset, offset + parseInt(limit));

      res.json({ 
        success: true, 
        data: paginatedCourses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: coursesWithCounts.length,
          pages: Math.ceil(coursesWithCounts.length / limit)
        }
      });
    } else {
      // Original behavior - return all courses
      let query = supabase
        .from('courses')
        .select('id, title, description, level, estimated_hours, created_at, updated_at', { count: 'exact' })
        .order('level', { ascending: true })
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);
      
      if (level) {
        query = query.eq('level', level);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        logger.error('Get courses error:', error);
        return res.json({ 
          success: false, 
          error: error.message,
          data: [],
          message: 'Database tables may not be set up yet. Please run the SQL schema in Supabase.'
        });
      }
      
      res.json({ 
        success: true, 
        data: data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      });
    }
  } catch (error) {
    logger.error('Get courses error:', error);
    res.json({ 
      success: false, 
      error: error.message,
      data: [],
      message: 'Database connection issue. Please check Supabase configuration.'
    });
  }
});

// Get course with lessons
app.get('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (courseError) {
      if (courseError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          msg: 'Course not found or not available'
        });
      }
      throw courseError;
    }
    
    // Get modules and lessons for this specific course
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select(`
        id, title, description, order_index,
        lessons:lessons(
          id, title, content, order_index, lesson_type, estimated_minutes
        )
      `)
      .eq('course_id', id)
      .order('order_index', { ascending: true });
    
    if (modulesError) throw modulesError;
    
    res.json({ success: true, data: { ...course, modules } });
  } catch (error) {
    logger.error('Get course error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get lesson with prompts, quizzes, and tasks
app.get('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();
    
    if (lessonError) {
      if (lessonError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          msg: 'Lesson not found'
        });
      }
      throw lessonError;
    }
    
    // Get related content
    const [promptsResult, quizzesResult, tasksResult] = await Promise.all([
      supabase.from('prompts').select('*').eq('lesson_id', id).order('created_at', { ascending: true }),
      supabase.from('quizzes').select('*').eq('lesson_id', id).order('created_at', { ascending: true }),
      supabase.from('tasks').select('*').eq('lesson_id', id).order('created_at', { ascending: true })
    ]);
    
    res.json({ 
      success: true, 
      data: { 
        ...lesson, 
        prompts: promptsResult.data || [],
        quizzes: quizzesResult.data || [],
        tasks: tasksResult.data || []
      } 
    });
  } catch (error) {
    logger.error('Get lesson error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Course modules endpoint
app.get('/api/courses/:id/modules', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: modules, error } = await supabase
      .from('modules')
      .select(`
        id, title, description, order_index, module_type, estimated_minutes, difficulty,
        lessons:lessons(
          id, title, content, order_index, lesson_type, estimated_minutes, status
        )
      `)
      .eq('course_id', id)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: modules || []
    });
  } catch (error) {
    logger.error('Error fetching course modules:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      msg: 'Unable to fetch course modules. Please try again later.'
    });
  }
});

// Course lessons endpoint (through modules)
app.get('/api/courses/:id/lessons', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get lessons through modules for this course
    const { data: modules, error } = await supabase
      .from('modules')
      .select(`
        lessons:lessons(
          id, title, content, order_index, lesson_type, estimated_minutes, status,
          module_id
        )
      `)
      .eq('course_id', id)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    // Flatten lessons from all modules
    const allLessons = [];
    if (modules) {
      modules.forEach(module => {
        if (module.lessons) {
          allLessons.push(...module.lessons);
        }
      });
    }
    
    // Sort lessons by order_index
    allLessons.sort((a, b) => a.order_index - b.order_index);
    
    res.json({
      success: true,
      data: allLessons
    });
  } catch (error) {
    logger.error('Error fetching course lessons:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      msg: 'Unable to fetch course lessons. Please try again later.'
    });
  }
});

// Course prompts endpoint (optimized single query with JOIN)
app.get('/api/courses/:id/prompts', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Single optimized query using JOIN instead of N+1 queries
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select(`
        *,
        lessons!inner(course_id)
      `)
      .eq('lessons.course_id', id)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: prompts || []
    });
  } catch (error) {
    logger.error('Error fetching course prompts:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch course prompts. Please try again later.'
    });
  }
});

// Course quizzes endpoint (optimized single query with JOIN)
app.get('/api/courses/:id/quizzes', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Single optimized query using JOIN instead of N+1 queries
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        lessons!inner(course_id)
      `)
      .eq('lessons.course_id', id)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: quizzes || []
    });
  } catch (error) {
    logger.error('Error fetching course quizzes:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch course quizzes. Please try again later.'
    });
  }
});

// Course tasks endpoint (optimized single query with JOIN)
app.get('/api/courses/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Single optimized query using JOIN instead of N+1 queries
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        lessons!inner(course_id)
      `)
      .eq('lessons.course_id', id)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: tasks || []
    });
  } catch (error) {
    logger.error('Error fetching course tasks:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch course tasks. Please try again later.'
    });
  }
});

// User progress endpoint
app.get('/api/progress/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        msg: 'Authorization token required'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verify token with Supabase
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError) {
      return res.status(401).json({
        success: false,
        msg: 'Invalid token'
      });
    }
    
    // Verify user can access this progress (either their own or admin)
    if (authData.user.id !== user_id) {
      return res.status(403).json({
        success: false,
        msg: 'Access denied'
      });
    }
    
    const { data: progress, error } = await supabase
      .from('user_progress')
      .select('exercise_id, status, score, completion_percentage, time_spent_minutes, updated_at')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: progress || []
    });
  } catch (error) {
    logger.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch progress. Please try again later.'
    });
  }
});

// Simple progress tracking endpoint (no auth required for demo)
app.post('/api/progress/complete', async (req, res) => {
  try {
    // For demo purposes, just return success without storing
    res.json({
      success: true,
      msg: 'Progress marked as complete (demo mode)',
      data: { status: 'completed' }
    });
  } catch (error) {
    logger.error('Error marking progress:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to mark progress. Please try again later.'
    });
  }
});

// Test endpoint for database operations
app.get('/api/test', async (req, res) => {
  try {
    // Test basic operations
    const results = {};
    
    // Test courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .limit(3);
    
    results.courses = {
      success: !coursesError,
      count: courses?.length || 0,
      error: coursesError?.message
    };
    
    // Test lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title')
      .limit(3);
    
    results.lessons = {
      success: !lessonsError,
      count: lessons?.length || 0,
      error: lessonsError?.message
    };
    
    res.json({
      success: true,
      message: 'Database test completed',
      results
    });
  } catch (error) {
    logger.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Direct API endpoints for testing and development
app.get('/api/modules', async (req, res) => {
  try {
    const { data: modules, error } = await supabase
      .from('modules')
      .select('id, title, description, course_id, order_index')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: modules || []
    });
  } catch (error) {
    logger.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/lessons', async (req, res) => {
  try {
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('id, title, content, module_id, order_index, lesson_type, estimated_minutes')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: lessons || []
    });
  } catch (error) {
    logger.error('Error fetching lessons:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/modules/:id/lessons', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('id, title, content, order_index, lesson_type, estimated_minutes, status')
      .eq('module_id', id)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: lessons || []
    });
  } catch (error) {
    logger.error('Error fetching module lessons:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  // Don't serve React app for API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return res.status(404).json({
      success: false,
      message: 'Endpoint not found'
    });
  }
  
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(port, () => {
  // Use structured logging
  logger.info('AI Masterclass Supabase Server started', {
    port,
    environment: process.env.NODE_ENV,
    supabaseUrl,
    serviceKeyConfigured: supabaseServiceKey ? 'Yes' : 'No'
  });
});