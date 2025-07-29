const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get user scenarios
router.get('/scenarios/:user_id', async (req, res) => {
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
    
    // Verify user can access this data (either their own or admin)
    if (authData.user.id !== user_id) {
      return res.status(403).json({
        success: false,
        msg: 'Access denied'
      });
    }
    
    const { data: scenarios, error } = await supabase
      .from('user_scenarios')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: scenarios || []
    });
  } catch (error) {
    logger.error('Error fetching user scenarios:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch scenarios. Please try again later.'
    });
  }
});

// Create user scenario
router.post('/scenarios', async (req, res) => {
  try {
    const { user_id, scenario_template_id, industry, role, specific_challenges, goals } = req.body;
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
    
    // Verify user can create this scenario (either their own or admin)
    if (authData.user.id !== user_id) {
      return res.status(403).json({
        success: false,
        msg: 'Access denied'
      });
    }
    
    // Input validation
    if (!scenario_template_id || !industry || !role) {
      return res.status(400).json({
        success: false,
        msg: 'Missing required fields: scenario_template_id, industry, role'
      });
    }
    
    const { data: scenario, error } = await supabase
      .from('user_scenarios')
      .insert({
        user_id: user_id,
        scenario_template_id: scenario_template_id,
        industry: industry,
        role: role,
        specific_challenges: specific_challenges || null,
        goals: goals || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: scenario,
      msg: 'Scenario created successfully'
    });
  } catch (error) {
    logger.error('Error creating scenario:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to create scenario. Please try again later.'
    });
  }
});

// Submit quiz answer
router.post('/quiz/submit', async (req, res) => {
  try {
    const { user_id, quiz_id, selected_answer, time_spent_seconds } = req.body;
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
    
    // Verify user can submit this quiz (either their own or admin)
    if (authData.user.id !== user_id) {
      return res.status(403).json({
        success: false,
        msg: 'Access denied'
      });
    }
    
    // Input validation
    if (!quiz_id || !selected_answer) {
      return res.status(400).json({
        success: false,
        msg: 'Missing required fields: quiz_id, selected_answer'
      });
    }
    
    // Get quiz details to check correct answer
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('correct_answer, explanation')
      .eq('id', quiz_id)
      .single();
    
    if (quizError) throw quizError;
    
    const is_correct = selected_answer === quiz.correct_answer;
    const score = is_correct ? 100 : 0;
    
    // Record the quiz submission
    const { data: submission, error } = await supabase
      .from('user_quiz_progress')
      .upsert({
        user_id: user_id,
        quiz_id: quiz_id,
        selected_answer: selected_answer,
        is_correct: is_correct,
        score: score,
        time_spent_seconds: time_spent_seconds || 0,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: {
        ...submission,
        correct_answer: quiz.correct_answer,
        explanation: quiz.explanation
      },
      msg: is_correct ? 'Correct answer!' : 'Incorrect answer. Please review the explanation.'
    });
  } catch (error) {
    logger.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to submit quiz. Please try again later.'
    });
  }
});

// Submit task
router.post('/task/submit', async (req, res) => {
  try {
    const { user_id, task_id, submission_content, submission_type } = req.body;
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
    
    // Verify user can submit this task (either their own or admin)
    if (authData.user.id !== user_id) {
      return res.status(403).json({
        success: false,
        msg: 'Access denied'
      });
    }
    
    // Input validation
    if (!task_id || !submission_content) {
      return res.status(400).json({
        success: false,
        msg: 'Missing required fields: task_id, submission_content'
      });
    }
    
    // Record the task submission
    const { data: submission, error } = await supabase
      .from('user_task_progress')
      .upsert({
        user_id: user_id,
        task_id: task_id,
        submission_content: submission_content,
        submission_type: submission_type || 'text',
        status: 'submitted',
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: submission,
      msg: 'Task submitted successfully'
    });
  } catch (error) {
    logger.error('Error submitting task:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to submit task. Please try again later.'
    });
  }
});

// Get personalized content
router.get('/personalized/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { content_type, lesson_id } = req.query;
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
    
    // Verify user can access this data (either their own or admin)
    if (authData.user.id !== user_id) {
      return res.status(403).json({
        success: false,
        msg: 'Access denied'
      });
    }
    
    let query = supabase
      .from('personalized_content')
      .select('*')
      .eq('user_id', user_id);
    
    if (content_type) {
      query = query.eq('content_type', content_type);
    }
    
    if (lesson_id) {
      query = query.eq('lesson_id', lesson_id);
    }
    
    const { data: content, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: content || []
    });
  } catch (error) {
    logger.error('Error fetching personalized content:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch personalized content. Please try again later.'
    });
  }
});

// Get scenario templates
router.get('/scenario-templates', async (req, res) => {
  try {
    const { data: templates, error } = await supabase
      .from('scenario_templates')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: templates || []
    });
  } catch (error) {
    logger.error('Error fetching scenario templates:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch scenario templates. Please try again later.'
    });
  }
});

module.exports = router;