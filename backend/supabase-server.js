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

const app = express();
const port = process.env.PORT || 5000;

// Supabase configuration - MUST be set in environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Security check - fail fast if credentials not provided
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SECURITY ERROR: Supabase credentials not configured');
  console.error('   Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
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
  console.log('✅ Supabase authentication routes loaded');
} catch (error) {
  console.log('❌ Supabase auth routes not available:', error.message);
}

try {
  const progressRoutes = require('./routes/supabase-progress');
  app.use('/api/progress', progressRoutes);
  console.log('✅ Supabase progress routes loaded');
} catch (error) {
  console.log('❌ Supabase progress routes not available:', error.message);
}

try {
  const interactiveRoutes = require('./routes/supabase-interactive');
  app.use('/api/interactive', interactiveRoutes);
  console.log('✅ Supabase interactive routes loaded');
} catch (error) {
  console.log('❌ Supabase interactive routes not available:', error.message);
}

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Mount health check routes
try {
  const healthRoutes = require('./routes/health');
  app.use('/api', healthRoutes);
  console.log('✅ Health check routes loaded');
} catch (error) {
  console.log('❌ Health check routes not available:', error.message);
  
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
    const { page = 1, limit = 10, level, status = 'published' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('courses')
      .select('id, title, description, level, duration_minutes, created_at, updated_at', { count: 'exact' })
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
    
    // Get lessons for this specific course
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .limit(10)
      .order('created_at', { ascending: true });
    
    if (lessonsError) throw lessonsError;
    
    res.json({ success: true, data: { ...course, lessons } });
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

// Course modules endpoint (simplified - modules table doesn't exist yet)
app.get('/api/courses/:id/modules', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Return empty modules for now since table doesn't exist
    res.json({
      success: true,
      data: [],
      message: 'Modules table not yet implemented'
    });
  } catch (error) {
    logger.error('Error fetching course modules:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch course modules. Please try again later.'
    });
  }
});

// Course lessons endpoint (fixed to filter by course_id)
app.get('/api/courses/:id/lessons', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Filter lessons by course_id
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: lessons || []
    });
  } catch (error) {
    logger.error('Error fetching course lessons:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch course lessons. Please try again later.'
    });
  }
});

// Course prompts endpoint (fixed to filter by course_id through lessons)
app.get('/api/courses/:id/prompts', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get lessons for this course first, then their prompts
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', id);
    
    if (lessonsError) throw lessonsError;
    
    if (!lessons || lessons.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const lessonIds = lessons.map(lesson => lesson.id);
    
    // Get prompts for these lessons
    const { data: prompts, error } = await supabase
      .from('prompts')
      .select('*')
      .in('lesson_id', lessonIds)
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

// Course quizzes endpoint (fixed to filter by course_id through lessons)
app.get('/api/courses/:id/quizzes', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get lessons for this course first, then their quizzes
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', id);
    
    if (lessonsError) throw lessonsError;
    
    if (!lessons || lessons.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const lessonIds = lessons.map(lesson => lesson.id);
    
    // Get quizzes for these lessons
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*')
      .in('lesson_id', lessonIds)
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

// Course tasks endpoint (fixed to filter by course_id through lessons)
app.get('/api/courses/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get lessons for this course first, then their tasks
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .eq('course_id', id);
    
    if (lessonsError) throw lessonsError;
    
    if (!lessons || lessons.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const lessonIds = lessons.map(lesson => lesson.id);
    
    // Get tasks for these lessons
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .in('lesson_id', lessonIds)
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
  console.log(`🚀 AI Masterclass Supabase Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Service Role Key configured: ${supabaseServiceKey ? 'Yes' : 'No'}`);
  
  // Use logger if available
  if (logger) {
    logger.info(`AI Masterclass Server running on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Supabase URL: ${supabaseUrl}`);
    logger.info(`Service Role Key configured: ${supabaseServiceKey ? 'Yes' : 'No'}`);
  }
});