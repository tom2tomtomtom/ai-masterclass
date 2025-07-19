const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Register a new user
router.post('/register', validateRegistration, async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  try {
    // Check if user already exists
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        msg: 'User already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Save user to database
    const newUser = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING * ',
      [email, password_hash, first_name, last_name]
    );

    // Generate JWT
    const payload = {
      user: {
        id: newUser.rows[0].id,
        role: newUser.rows[0].role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          success: true,
          data: { token },
          msg: 'Registration successful'
        });
      }
    );
  } catch (err) {
    logger.error('Registration error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error during registration'
    });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid credentials' 
      });
    }

    const user = rows[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid credentials' 
      });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          success: true,
          data: { token },
          msg: 'Login successful'
        });
      }
    );
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error during login'
    });
  }
});

// Validate token endpoint
router.get('/validate', auth, async (req, res) => {
  try {
    // If we reach here, the token is valid (auth middleware passed)
    // Get user details from database
    const { rows } = await db.query(
      'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'User not found'
      });
    }
    
    const user = rows[0];
    
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at
      },
      msg: 'Token is valid'
    });
  } catch (err) {
    logger.error('Token validation error:', err);
    res.status(500).json({
      success: false,
      msg: 'Server error during token validation'
    });
  }
});

module.exports = router;
