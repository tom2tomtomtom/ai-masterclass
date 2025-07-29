const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Middleware to verify Supabase JWT tokens
 */
const verifySupabaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: error?.message
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      email_confirmed: user.email_confirmed_at ? true : false,
      first_name: user.user_metadata?.first_name || '',
      last_name: user.user_metadata?.last_name || '',
      full_name: user.user_metadata?.full_name || '',
      role: user.user_metadata?.role || 'user',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    };

    req.session = { access_token: token };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Optional auth middleware - continues even if no valid token
 */
const optionalSupabaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email,
          email_confirmed: user.email_confirmed_at ? true : false,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          full_name: user.user_metadata?.full_name || '',
          role: user.user_metadata?.role || 'user',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at
        };
        req.session = { access_token: token };
      }
    }
    
    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next(); // Continue anyway for optional auth
  }
};

/**
 * Admin role check middleware
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

module.exports = {
  verifySupabaseAuth,
  optionalSupabaseAuth,
  requireAdmin,
  supabase
};