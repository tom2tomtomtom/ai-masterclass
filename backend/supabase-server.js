const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createClient } = require('@supabase/supabase-js');
const logger = require('./utils/logger');

const app = express();
const port = process.env.PORT || 5000;

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIyNjc4MCwiZXhwIjoyMDY3ODAyNzgwfQ.vLRzjcMIrpn8m3nEDI7pE7bSZg20Msdw60CHcsV1otI';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase.from('courses').select('count', { count: 'exact' }).limit(1);
    
    if (error) {
      throw error;
    }
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      supabase: {
        url: supabaseUrl,
        connected: true,
        tables_accessible: true
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected',
      supabase: {
        url: supabaseUrl,
        connected: false,
        error: error.message
      }
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Masterclass API',
    version: '1.0.0',
    status: 'active',
    database: 'supabase',
    documentation: '/api/docs'
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

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('level', { ascending: true });
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Get courses error:', error);
    res.status(500).json({ success: false, error: error.message });
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
    
    if (courseError) throw courseError;
    
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('order_index', { ascending: true });
    
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
    
    if (lessonError) throw lessonError;
    
    // Get related content
    const [promptsResult, quizzesResult, tasksResult] = await Promise.all([
      supabase.from('prompts').select('*').eq('lesson_id', id),
      supabase.from('quizzes').select('*').eq('lesson_id', id),
      supabase.from('tasks').select('*').eq('lesson_id', id)
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(port, () => {
  logger.info(`AI Masterclass Server running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Supabase URL: ${supabaseUrl}`);
  logger.info(`Service Role Key configured: ${supabaseServiceKey ? 'Yes' : 'No'}`);
});