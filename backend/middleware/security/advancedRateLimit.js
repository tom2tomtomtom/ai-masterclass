const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const logger = require('../../utils/logger');

/**
 * Advanced rate limiting with progressive delays and intelligent blocking
 * OWASP Reference: Automated Threats Prevention
 */

// Store for tracking failed attempts by IP
const failedAttempts = new Map();
const suspiciousIPs = new Set();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  
  for (const [ip, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > fifteenMinutes) {
      failedAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Enhanced authentication rate limiter with progressive penalties
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    const ip = req.ip;
    const attempts = failedAttempts.get(ip);
    
    // Progressive reduction based on failed attempts
    if (attempts && attempts.count > 10) return 1; // Severe restriction
    if (attempts && attempts.count > 5) return 2;  // Strong restriction
    if (attempts && attempts.count > 3) return 3;  // Moderate restriction
    
    return 5; // Default limit
  },
  message: (req) => {
    const attempts = failedAttempts.get(req.ip);
    const lastAttempt = attempts ? attempts.lastAttempt : 0;
    const timeRemaining = Math.ceil((15 * 60 * 1000 - (Date.now() - lastAttempt)) / 1000 / 60);
    const finalTime = Math.max(timeRemaining, 15);
    
    return {
      error: 'Too many authentication attempts',
      retryAfter: finalTime,
      msg: 'Account temporarily locked due to multiple failed attempts. Try again in ' + finalTime + ' minutes.'
    };
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  onLimitReached: (req) => {
    const ip = req.ip;
    suspiciousIPs.add(ip);
    
    logger.warn('Authentication rate limit exceeded', {
      ip: ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }
});

// Slow down middleware for authentication endpoints
const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // Allow 2 requests per windowMs without delay
  delayMs: (hits) => {
    // Progressive delay: 500ms, 1s, 2s, 4s, 8s, etc.
    return Math.min(500 * Math.pow(2, hits - 2), 30000); // Max 30 seconds
  },
  maxDelayMs: 30000, // Maximum delay of 30 seconds
  skipSuccessfulRequests: true,
  onLimitReached: (req) => {
    logger.info('Authentication requests being delayed', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
});

// General API rate limiter with burst protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => {
    // Stricter limits for suspicious IPs
    if (suspiciousIPs.has(req.ip)) return 50;
    
    // Different limits based on endpoint complexity
    if (req.path.includes('/search') || req.path.includes('/filter')) return 100;
    if (req.path.includes('/courses')) return 200;
    
    return 500; // Default limit
  },
  message: {
    error: 'Too many requests',
    retryAfter: 15,
    msg: 'Rate limit exceeded. Please slow down your requests.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: (req) => {
    logger.warn('API rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent')
    });
  }
});

// Strict rate limiter for password reset and sensitive operations
const sensitiveOperationsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 attempts per hour
  message: {
    error: 'Too many sensitive operation attempts',
    retryAfter: 60,
    msg: 'Too many password reset attempts. Please wait 1 hour before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: (req) => {
    logger.warn('Sensitive operation rate limit exceeded', {
      ip: req.ip,
      operation: req.path,
      userAgent: req.get('User-Agent')
    });
  }
});

// Course access limiter with intelligent caching consideration
const courseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: (req) => {
    // Higher limits for authenticated users
    if (req.user) return 300;
    return 100;
  },
  message: {
    error: 'Too many course requests',
    retryAfter: 1,
    msg: 'Please slow down your course browsing.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware to track failed authentication attempts
const trackFailedAuth = (req, res, next) => {
  const originalSend = res.send;
  const ip = req.ip;
  
  res.send = function(data) {
    // Check if this was a failed authentication attempt
    if (res.statusCode === 400 || res.statusCode === 401) {
      const current = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
      current.count += 1;
      current.lastAttempt = Date.now();
      failedAttempts.set(ip, current);
      
      logger.warn('Failed authentication attempt tracked', {
        ip: ip,
        attemptCount: current.count,
        userAgent: req.get('User-Agent')
      });
    } else if (res.statusCode === 200) {
      // Successful auth - reset counter
      failedAttempts.delete(ip);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// IP whitelist middleware for admin operations
const adminIPWhitelist = (req, res, next) => {
  const adminIPs = (process.env.ADMIN_WHITELIST_IPS || '').split(',').filter(Boolean);
  
  if (adminIPs.length === 0) {
    return next(); // No whitelist configured
  }
  
  const clientIP = req.ip;
  
  if (\!adminIPs.includes(clientIP)) {
    logger.warn('Admin access attempted from non-whitelisted IP', {
      ip: clientIP,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(403).json({
      success: false,
      msg: 'Access denied from this location'
    });
  }
  
  next();
};

// Honeypot endpoint to catch bots
const honeypotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1, // Only 1 attempt per minute
  message: {
    error: 'Suspicious activity detected',
    msg: 'Your IP has been flagged for suspicious activity.'
  },
  onLimitReached: (req) => {
    suspiciousIPs.add(req.ip);
    logger.warn('Honeypot triggered - suspicious IP flagged', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
});

module.exports = {
  authLimiter,
  authSlowDown,
  apiLimiter,
  sensitiveOperationsLimiter,
  courseLimiter,
  trackFailedAuth,
  adminIPWhitelist,
  honeypotLimiter,
  // Export for testing
  failedAttempts,
  suspiciousIPs
};
ENDFILE < /dev/null