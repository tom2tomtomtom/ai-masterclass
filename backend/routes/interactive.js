const express = require('express');
const { Pool } = require('pg');
const logger = require('../utils/logger');
const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Get all lessons for a module
router.get('/modules/:moduleId/lessons', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const query = `
      SELECT 
        id,
        title,
        description,
        content,
        order_index,
        estimated_minutes,
        lesson_type,
        difficulty,
        learning_objectives,
        platform_focus,
        created_at
      FROM lessons 
      WHERE module_id = $1 
      ORDER BY order_index ASC
    `;
    
    const { rows } = await pool.query(query, [moduleId]);
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get specific lesson with all related content
router.get('/lessons/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    // Get lesson details
    const lessonQuery = `
      SELECT 
        l.*,
        m.title as module_title,
        c.title as course_title
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE l.id = $1
    `;
    
    // Get lesson prompts
    const promptsQuery = `
      SELECT * FROM prompts 
      WHERE lesson_id = $1 
      ORDER BY order_index ASC
    `;
    
    // Get lesson quizzes
    const quizzesQuery = `
      SELECT * FROM quizzes 
      WHERE lesson_id = $1 
      ORDER BY order_index ASC
    `;
    
    // Get lesson tasks
    const tasksQuery = `
      SELECT * FROM tasks 
      WHERE lesson_id = $1 
      ORDER BY order_index ASC
    `;
    
    const [lessonResult, promptsResult, quizzesResult, tasksResult] = await Promise.all([
      pool.query(lessonQuery, [lessonId]),
      pool.query(promptsQuery, [lessonId]),
      pool.query(quizzesQuery, [lessonId]),
      pool.query(tasksQuery, [lessonId])
    ]);
    
    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    const lesson = lessonResult.rows[0];
    lesson.prompts = promptsResult.rows;
    lesson.quizzes = quizzesResult.rows;
    lesson.tasks = tasksResult.rows;
    
    res.json(lesson);
  } catch (error) {
    logger.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Get all prompts for a lesson
router.get('/lessons/:lessonId/prompts', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const query = `
      SELECT * FROM prompts 
      WHERE lesson_id = $1 
      ORDER BY order_index ASC
    `;
    
    const { rows } = await pool.query(query, [lessonId]);
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching prompts:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// Get prompts by platform
router.get('/prompts/platform/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const query = `
      SELECT 
        p.*,
        l.title as lesson_title,
        m.title as module_title
      FROM prompts p
      JOIN lessons l ON p.lesson_id = l.id
      JOIN modules m ON l.module_id = m.id
      WHERE p.platform = $1 
      ORDER BY p.difficulty ASC, p.order_index ASC
    `;
    
    const { rows } = await pool.query(query, [platform]);
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching prompts by platform:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// Get all quizzes for a lesson
router.get('/lessons/:lessonId/quizzes', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const query = `
      SELECT * FROM quizzes 
      WHERE lesson_id = $1 
      ORDER BY order_index ASC
    `;
    
    const { rows } = await pool.query(query, [lessonId]);
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Submit quiz attempt
router.post('/quizzes/:quizId/attempt', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId, answer, timeTaken } = req.body;
    
    // Get quiz details to check correct answer
    const quizQuery = 'SELECT correct_answer FROM quizzes WHERE id = $1';
    const quizResult = await pool.query(quizQuery, [quizId]);
    
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    const correctAnswer = quizResult.rows[0].correct_answer;
    const isCorrect = answer.toLowerCase() === correctAnswer.toLowerCase();
    
    // Get attempt number
    const attemptQuery = `
      SELECT COUNT(*) + 1 as attempt_number 
      FROM user_quiz_attempts 
      WHERE user_id = $1 AND quiz_id = $2
    `;
    const attemptResult = await pool.query(attemptQuery, [userId, quizId]);
    const attemptNumber = attemptResult.rows[0].attempt_number;
    
    // Record attempt
    const insertQuery = `
      INSERT INTO user_quiz_attempts 
      (user_id, quiz_id, answer, is_correct, attempt_number, time_taken_seconds)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const { rows } = await pool.query(insertQuery, [
      userId, quizId, answer, isCorrect, attemptNumber, timeTaken || 0
    ]);
    
    res.json({
      ...rows[0],
      correct_answer: correctAnswer,
      explanation: isCorrect ? null : 'See lesson content for explanation'
    });
  } catch (error) {
    logger.error('Error submitting quiz attempt:', error);
    res.status(500).json({ error: 'Failed to submit quiz attempt' });
  }
});

// Get all tasks for a lesson
router.get('/lessons/:lessonId/tasks', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const query = `
      SELECT * FROM tasks 
      WHERE lesson_id = $1 
      ORDER BY order_index ASC
    `;
    
    const { rows } = await pool.query(query, [lessonId]);
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Submit task submission
router.post('/tasks/:taskId/submit', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId, submissionContent, submissionType, timeSpent } = req.body;
    
    // Get attempt number
    const attemptQuery = `
      SELECT COUNT(*) + 1 as attempt_number 
      FROM user_task_submissions 
      WHERE user_id = $1 AND task_id = $2
    `;
    const attemptResult = await pool.query(attemptQuery, [userId, taskId]);
    const attemptNumber = attemptResult.rows[0].attempt_number;
    
    // Record submission
    const insertQuery = `
      INSERT INTO user_task_submissions 
      (user_id, task_id, submission_content, submission_type, attempt_number, time_spent_minutes, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'submitted')
      RETURNING *
    `;
    
    const { rows } = await pool.query(insertQuery, [
      userId, taskId, submissionContent, submissionType, attemptNumber, timeSpent || 0
    ]);
    
    res.json(rows[0]);
  } catch (error) {
    logger.error('Error submitting task:', error);
    res.status(500).json({ error: 'Failed to submit task' });
  }
});

// Get user progress for a lesson
router.get('/users/:userId/lessons/:lessonId/progress', async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    
    const query = `
      SELECT 
        ulp.*,
        (
          SELECT COUNT(*) 
          FROM quizzes q 
          JOIN user_quiz_attempts uqa ON q.id = uqa.quiz_id 
          WHERE q.lesson_id = $2 AND uqa.user_id = $1 AND uqa.is_correct = true
        ) as quizzes_passed,
        (
          SELECT COUNT(*) 
          FROM quizzes 
          WHERE lesson_id = $2
        ) as total_quizzes,
        (
          SELECT COUNT(*) 
          FROM tasks t 
          JOIN user_task_submissions uts ON t.id = uts.task_id 
          WHERE t.lesson_id = $2 AND uts.user_id = $1 AND uts.status = 'approved'
        ) as tasks_completed,
        (
          SELECT COUNT(*) 
          FROM tasks 
          WHERE lesson_id = $2 AND is_required = true
        ) as required_tasks
      FROM user_lesson_progress ulp
      WHERE ulp.user_id = $1 AND ulp.lesson_id = $2
    `;
    
    const { rows } = await pool.query(query, [userId, lessonId]);
    
    if (rows.length === 0) {
      // Create initial progress record
      const insertQuery = `
        INSERT INTO user_lesson_progress (user_id, lesson_id, status, completion_percentage)
        VALUES ($1, $2, 'not_started', 0)
        RETURNING *, 0 as quizzes_passed, 0 as total_quizzes, 0 as tasks_completed, 0 as required_tasks
      `;
      const insertResult = await pool.query(insertQuery, [userId, lessonId]);
      return res.json(insertResult.rows[0]);
    }
    
    res.json(rows[0]);
  } catch (error) {
    logger.error('Error fetching lesson progress:', error);
    res.status(500).json({ error: 'Failed to fetch lesson progress' });
  }
});

// Update lesson progress
router.put('/users/:userId/lessons/:lessonId/progress', async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    const { status, completionPercentage, timeSpent } = req.body;
    
    const query = `
      INSERT INTO user_lesson_progress 
      (user_id, lesson_id, status, completion_percentage, time_spent_minutes, last_accessed)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        completion_percentage = EXCLUDED.completion_percentage,
        time_spent_minutes = user_lesson_progress.time_spent_minutes + EXCLUDED.time_spent_minutes,
        last_accessed = EXCLUDED.last_accessed,
        updated_at = NOW()
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [
      userId, lessonId, status, completionPercentage, timeSpent || 0
    ]);
    
    res.json(rows[0]);
  } catch (error) {
    logger.error('Error updating lesson progress:', error);
    res.status(500).json({ error: 'Failed to update lesson progress' });
  }
});

// Get all scenario templates
router.get('/scenario-templates', async (req, res) => {
  try {
    const { industry, department } = req.query;
    
    let query = `
      SELECT * FROM scenario_templates 
      WHERE is_active = true
    `;
    const params = [];
    
    if (industry) {
      query += ` AND (industry = $${params.length + 1} OR industry IS NULL)`;
      params.push(industry);
    }
    
    if (department) {
      query += ` AND (department = $${params.length + 1} OR department IS NULL)`;
      params.push(department);
    }
    
    query += ` ORDER BY usage_count DESC, title ASC`;
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching scenario templates:', error);
    res.status(500).json({ error: 'Failed to fetch scenario templates' });
  }
});

// Create user scenario
router.post('/users/:userId/scenarios', async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      title,
      description,
      industry,
      department,
      role,
      teamSize,
      mainChallenge,
      currentProcess,
      desiredOutcome,
      toolsAvailable,
      timeConstraints,
      complexityLevel,
      priority
    } = req.body;
    
    const query = `
      INSERT INTO user_scenarios 
      (user_id, title, description, industry, department, role, team_size, 
       main_challenge, current_process, desired_outcome, tools_available, 
       time_constraints, complexity_level, priority)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [
      userId, title, description, industry, department, role, teamSize,
      mainChallenge, currentProcess, desiredOutcome, 
      JSON.stringify(toolsAvailable || []),
      timeConstraints, complexityLevel, priority
    ]);
    
    res.json(rows[0]);
  } catch (error) {
    logger.error('Error creating user scenario:', error);
    res.status(500).json({ error: 'Failed to create user scenario' });
  }
});

// Get user scenarios
router.get('/users/:userId/scenarios', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT * FROM user_scenarios 
      WHERE user_id = $1 AND is_active = true
      ORDER BY created_at DESC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    logger.error('Error fetching user scenarios:', error);
    res.status(500).json({ error: 'Failed to fetch user scenarios' });
  }
});

// Record prompt usage
router.post('/prompts/:promptId/usage', async (req, res) => {
  try {
    const { promptId } = req.params;
    const { userId, platformUsed, effectivenessRating, notes } = req.body;
    
    const query = `
      INSERT INTO user_prompt_usage 
      (user_id, prompt_id, platform_used, effectiveness_rating, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const { rows } = await pool.query(query, [
      userId, promptId, platformUsed, effectivenessRating, notes
    ]);
    
    res.json(rows[0]);
  } catch (error) {
    logger.error('Error recording prompt usage:', error);
    res.status(500).json({ error: 'Failed to record prompt usage' });
  }
});

module.exports = router;