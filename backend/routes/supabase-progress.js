const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIyNjc4MCwiZXhwIjoyMDY3ODAyNzgwfQ.vLRzjcMIrpn8m3nEDI7pE7bSZg20Msdw60CHcsV1otI';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Get user progress
router.get('/user/:user_id', async (req, res) => {
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
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch progress. Please try again later.'
    });
  }
});

// Complete an exercise
router.post('/complete', async (req, res) => {
  try {
    const { user_id, exercise_id, score = 100 } = req.body;
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
    
    // Verify user can update this progress (either their own or admin)
    if (authData.user.id !== user_id) {
      return res.status(403).json({
        success: false,
        msg: 'Access denied'
      });
    }
    
    // Insert or update progress
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user_id,
        exercise_id: exercise_id,
        status: 'completed',
        score: score,
        completion_percentage: 100,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data,
      msg: 'Exercise completed successfully'
    });
  } catch (error) {
    console.error('Error completing exercise:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to complete exercise. Please try again later.'
    });
  }
});

// Update progress
router.put('/update', async (req, res) => {
  try {
    const { user_id, exercise_id, status, score, completion_percentage, time_spent_minutes } = req.body;
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
    
    // Verify user can update this progress (either their own or admin)
    if (authData.user.id !== user_id) {
      return res.status(403).json({
        success: false,
        msg: 'Access denied'
      });
    }
    
    // Update progress
    const updateData = {
      updated_at: new Date().toISOString()
    };
    
    if (status) updateData.status = status;
    if (score !== undefined) updateData.score = score;
    if (completion_percentage !== undefined) updateData.completion_percentage = completion_percentage;
    if (time_spent_minutes !== undefined) updateData.time_spent_minutes = time_spent_minutes;
    
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user_id,
        exercise_id: exercise_id,
        ...updateData
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data,
      msg: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to update progress. Please try again later.'
    });
  }
});

// Get progress statistics
router.get('/stats/:user_id', async (req, res) => {
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
      .select('status, score, completion_percentage, time_spent_minutes')
      .eq('user_id', user_id);
    
    if (error) throw error;
    
    const stats = {
      total_exercises: progress.length,
      completed_exercises: progress.filter(p => p.status === 'completed').length,
      average_score: progress.length > 0 ? progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length : 0,
      total_time_spent: progress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0),
      overall_completion: progress.length > 0 ? progress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / progress.length : 0
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching progress stats:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch progress statistics. Please try again later.'
    });
  }
});

module.exports = router;