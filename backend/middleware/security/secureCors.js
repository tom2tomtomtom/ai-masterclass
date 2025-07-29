const cors = require('cors');
const logger = require('../../utils/logger');

/**
 * Production-ready CORS configuration with environment-specific settings
 * OWASP Reference: A05:2021 - Security Misconfiguration
 */

// Allowed origins based on environment
const getAllowedOrigins = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isDevelopment) {
    // Development origins
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      process.env.FRONTEND_URL
    ].filter(Boolean);
  }
  
  if (isProduction) {
    // Production origins - only specified domains
    const allowedDomains = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
    
    if (allowedDomains.length === 0) {
      logger.error('CRITICAL: No allowed origins configured for production');
      // Default to localhost in emergency, but log critical error
      return ['http://localhost:3000'];
    }
    
    return allowedDomains;
  }
  
  // Default for other environments
  return [process.env.FRONTEND_URL || 'http://localhost:3000'];
};

// Dynamic origin checker with logging
const corsOriginChecker = (origin, callback) => {
  const allowedOrigins = getAllowedOrigins();
  
  // Allow requests with no origin (mobile apps, postman, etc.) in development
  if (\!origin && process.env.NODE_ENV === 'development') {
    return callback(null, true);
  }
  
  // Check if origin is in allowed list
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  
  // Log blocked origin attempt
  logger.warn('CORS origin blocked', {
    origin: origin,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
  
  // Block the request
  const error = new Error(`Origin ${origin} not allowed by CORS policy`);
  error.status = 403;
  callback(error, false);
};

// Main CORS configuration
const secureCorsOptions = {
  origin: corsOriginChecker,
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Allowed methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Auth-Token',
    'X-Request-ID'
  ],
  
  // Exposed headers (headers that client can access)
  exposedHeaders: [
    'X-Request-ID',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  
  // Preflight cache time (in seconds)
  maxAge: 86400, // 24 hours
  
  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Enhanced CORS middleware with additional security
const enhancedCors = cors(secureCorsOptions);

// Additional CORS security middleware
const corsSecurityEnforcer = (req, res, next) => {
  try {
    // Additional security checks after CORS
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    
    // Check for CSRF attempts
    if (req.method \!== 'GET' && req.method \!== 'HEAD' && req.method \!== 'OPTIONS') {
      // For state-changing requests, ensure origin/referer matches allowed domains
      if (origin || referer) {
        const allowedOrigins = getAllowedOrigins();
        const checkUrl = origin || referer;
        
        const isAllowed = allowedOrigins.some(allowed => {
          try {
            const allowedUrl = new URL(allowed);
            const checkUrlObj = new URL(checkUrl);
            return allowedUrl.origin === checkUrlObj.origin;
          } catch {
            return false;
          }
        });
        
        if (\!isAllowed) {
          logger.warn('Potential CSRF attempt detected', {
            origin: origin,
            referer: referer,
            method: req.method,
            path: req.path,
            ip: req.ip
          });
          
          return res.status(403).json({
            success: false,
            msg: 'Request origin not allowed'
          });
        }
      }
    }
    
    // Add additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    next();
  } catch (error) {
    logger.error('CORS security enforcer error:', error);
    next();
  }
};

// Middleware to handle CORS errors gracefully
const corsErrorHandler = (err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS policy')) {
    logger.warn('CORS policy violation', {
      origin: req.get('Origin'),
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      path: req.path
    });
    
    return res.status(403).json({
      success: false,
      msg: 'Cross-origin request not allowed'
    });
  }
  
  next(err);
};

// Environment-specific CORS setup
const getEnvironmentCors = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // More permissive CORS for development
    return cors({
      ...secureCorsOptions,
      origin: true, // Allow all origins in development
      credentials: true
    });
  }
  
  return enhancedCors;
};

// CORS preflight optimization
const optimizedPreflightHandler = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Cache preflight responses
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Quick preflight response
    res.status(204).end();
    return;
  }
  
  next();
};

// Log CORS requests for monitoring
const corsLogger = (req, res, next) => {
  const origin = req.get('Origin');
  
  if (origin && process.env.NODE_ENV === 'production') {
    logger.info('CORS request processed', {
      origin: origin,
      method: req.method,
      path: req.path,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  }
  
  next();
};

module.exports = {
  enhancedCors,
  corsSecurityEnforcer,
  corsErrorHandler,
  getEnvironmentCors,
  optimizedPreflightHandler,
  corsLogger,
  getAllowedOrigins,
  // Export for testing
  corsOriginChecker
};
ENDFILE < /dev/null