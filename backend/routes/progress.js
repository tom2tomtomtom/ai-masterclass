const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { validateProgressCompletion } = require('../middleware/validation');
const logger = require('../utils/logger');

// Get user progress
router.get('/user/:user_id', auth, async (req, res) => {
  const { user_id } = req.params;

  try {
    // Verify user can access this progress (either their own or admin role)
    if (req.user.id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        msg: 'Access denied: You can only view your own progress'
      });
    }

    const { rows } = await db.query(
      'SELECT exercise_id, status, score, completion_percentage, time_spent_minutes, updated_at FROM user_progress WHERE user_id = $1 ORDER BY updated_at DESC',
      [user_id]
    );

    res.json({
      success: true,
      data: rows || []
    });
  } catch (err) {
    logger.error('Progress retrieval error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error while retrieving progress'
    });
  }
});

// Complete an exercise
router.post('/complete', auth, validateProgressCompletion, async (req, res) => {
  const { user_id, exercise_id, score = 100 } = req.body;

  try {
    // Verify user can update this progress (either their own or admin role)
    if (req.user.id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        msg: 'Access denied: You can only update your own progress'
      });
    }

    // Check if progress already exists
    const { rows } = await db.query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND exercise_id = $2',
      [user_id, exercise_id]
    );

    if (rows.length > 0) {
      // Update existing progress
      const { rows: updatedRows } = await db.query(
        'UPDATE user_progress SET status = $1, score = $2, completion_percentage = 100, updated_at = NOW() WHERE user_id = $3 AND exercise_id = $4 RETURNING *',
        ['completed', score, user_id, exercise_id]
      );
      
      res.json({
        success: true,
        data: updatedRows[0],
        msg: 'Exercise completed successfully'
      });
    } else {
      // Insert new progress
      const { rows: newRows } = await db.query(
        'INSERT INTO user_progress (user_id, exercise_id, status, score, completion_percentage) VALUES ($1, $2, $3, $4, 100) RETURNING *',
        [user_id, exercise_id, 'completed', score]
      );
      
      res.json({
        success: true,
        data: newRows[0],
        msg: 'Exercise completed successfully'
      });
    }
  } catch (err) {
    logger.error('Progress completion error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error while updating progress'
    });
  }
});

// Update progress
router.put('/update', auth, async (req, res) => {
  const { user_id, exercise_id, status, score, completion_percentage, time_spent_minutes } = req.body;

  try {
    // Verify user can update this progress (either their own or admin role)
    if (req.user.id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        msg: 'Access denied: You can only update your own progress'
      });
    }

    // Build update fields dynamically
    const updateFields = [];
    const updateValues = [];
    let valueIndex = 1;

    if (status) {
      updateFields.push(`status = $${valueIndex++}`);
      updateValues.push(status);
    }
    if (score !== undefined) {
      updateFields.push(`score = $${valueIndex++}`);
      updateValues.push(score);
    }
    if (completion_percentage !== undefined) {
      updateFields.push(`completion_percentage = $${valueIndex++}`);
      updateValues.push(completion_percentage);
    }
    if (time_spent_minutes !== undefined) {
      updateFields.push(`time_spent_minutes = $${valueIndex++}`);
      updateValues.push(time_spent_minutes);
    }

    // Always update timestamp
    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) { // Only timestamp update
      return res.status(400).json({
        success: false,
        msg: 'No valid fields to update'
      });
    }

    // Add WHERE clause parameters
    updateValues.push(user_id, exercise_id);

    const { rows } = await db.query(
      `UPDATE user_progress SET ${updateFields.join(', ')} WHERE user_id = $${valueIndex} AND exercise_id = $${valueIndex + 1} RETURNING *`,
      updateValues
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'Progress record not found'
      });
    }

    res.json({
      success: true,
      data: rows[0],
      msg: 'Progress updated successfully'
    });
  } catch (err) {
    logger.error('Progress update error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error while updating progress'
    });
  }
});

// Get progress statistics
router.get('/stats/:user_id', auth, async (req, res) => {
  const { user_id } = req.params;

  try {
    // Verify user can access this progress (either their own or admin role)
    if (req.user.id !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        msg: 'Access denied: You can only view your own statistics'
      });
    }

    const { rows } = await db.query(
      'SELECT status, score, completion_percentage, time_spent_minutes FROM user_progress WHERE user_id = $1',
      [user_id]
    );

    const stats = {
      total_exercises: rows.length,
      completed_exercises: rows.filter(p => p.status === 'completed').length,
      average_score: rows.length > 0 ? rows.reduce((sum, p) => sum + (p.score || 0), 0) / rows.length : 0,
      total_time_spent: rows.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0),
      overall_completion: rows.length > 0 ? rows.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / rows.length : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    logger.error('Progress stats error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error while retrieving statistics'
    });
  }
});

module.exports = router;
