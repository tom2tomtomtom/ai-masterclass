const express = require('express');
const router = express.Router();
const db = require('../db');
const { validateProgressCompletion } = require('../middleware/validation');
const logger = require('../utils/logger');

// Mark exercise as complete
router.post('/complete-exercise', validateProgressCompletion, async (req, res) => {
  const { user_id, exercise_id } = req.body;

  try {
    // Check if progress already exists
    const { rows } = await db.query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND exercise_id = $2',
      [user_id, exercise_id]
    );

    if (rows.length > 0) {
      // Update existing progress
      await db.query(
        'UPDATE user_progress SET status = $1, updated_at = NOW() WHERE user_id = $2 AND exercise_id = $3',
        ['completed', user_id, exercise_id]
      );
      return res.json({ msg: 'Exercise marked as complete' });
    } else {
      // Insert new progress
      await db.query(
        'INSERT INTO user_progress (user_id, exercise_id, status) VALUES ($1, $2, $3)',
        [user_id, exercise_id, 'completed']
      );
      return res.json({ msg: 'Exercise marked as complete' });
    }
  } catch (err) {
    logger.error('Progress completion error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error while updating progress'
    });
  }
});

module.exports = router;
