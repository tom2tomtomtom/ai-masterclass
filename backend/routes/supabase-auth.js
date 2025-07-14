const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with anon key for client-side auth
const supabaseUrl = process.env.SUPABASE_URL || 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjY3ODAsImV4cCI6MjA2NzgwMjc4MH0.p8V9W-7hqm0DlLe9F9s-_HK4I3mKrT5eL0YFbJfVTw4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Register a new user using Supabase Auth
router.post('/register', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  try {
    console.log('Registration attempt for:', email);

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required',
        msg: 'Please provide both email and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Password too short',
        msg: 'Password must be at least 6 characters long'
      });
    }

    // Create user with Supabase Auth (will send verification email automatically)
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: first_name || '',
          last_name: last_name || '',
          full_name: `${first_name || ''} ${last_name || ''}`.trim()
        }
      }
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(400).json({ 
        success: false,
        error: error.message,
        msg: error.message.includes('already registered') ? 'User already exists' : 'Registration failed'
      });
    }

    console.log('User registration initiated:', data.user?.id || 'pending verification');

    // Return success response with email verification instruction
    res.json({ 
      success: true,
      data: { 
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
          email_confirmed_at: data.user.email_confirmed_at
        } : null,
        session: data.session
      },
      msg: 'Registration successful! Please check your email and click the verification link to activate your account.'
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      msg: 'Registration failed due to server error'
    });
  }
});

// Login user using Supabase Auth
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt for:', email);

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required',
        msg: 'Please provide both email and password'
      });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error('Supabase login error:', error);
      
      // Handle specific error types
      if (error.message.includes('Invalid login credentials')) {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid credentials',
          msg: 'Invalid email or password'
        });
      }
      
      if (error.message.includes('Email not confirmed')) {
        return res.status(401).json({ 
          success: false,
          error: 'Email not verified',
          msg: 'Please check your email and click the verification link before signing in.'
        });
      }
      
      return res.status(400).json({ 
        success: false,
        error: error.message,
        msg: 'Login failed'
      });
    }

    if (!data.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication failed',
        msg: 'Login failed - no user data returned'
      });
    }

    console.log('User logged in successfully:', data.user.id);

    // Return success response with token
    res.json({ 
      success: true,
      data: { 
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        }
      },
      msg: 'Login successful'
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      msg: 'Login failed due to server error'
    });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    // For Supabase, logout is typically handled client-side
    // But we can provide a server-side endpoint for consistency
    res.json({ 
      success: true,
      msg: 'Logout successful'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      msg: 'Logout failed'
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided',
        msg: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token',
        msg: 'Token verification failed'
      });
    }

    res.json({ 
      success: true,
      data: { 
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata
        }
      },
      msg: 'Token valid'
    });

  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      msg: 'Token verification failed'
    });
  }
});

module.exports = router;