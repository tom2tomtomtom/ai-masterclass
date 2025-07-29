const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Enhanced authentication middleware with security improvements
 * OWASP Reference: A07:2021 - Identification and Authentication Failures
 */

// Token blacklist for revoked tokens (In production, use Redis)
const tokenBlacklist = new Set();

// Session tracking for security monitoring
const activeSessions = new Map();

// Enhanced authentication middleware
const enhancedAuth = (req, res, next) => {
  try {
    // Get token from multiple possible sources
    let token = null;
    
    // Check Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Fallback to x-auth-token header for compatibility
    if (\!token) {
      token = req.header('x-auth-token');
    }

    // Check if no token provided
    if (\!token) {
      logger.warn('Authentication failed - no token provided', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({ 
        success: false,
        msg: 'Access denied. Authentication required.' 
      });
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      logger.warn('Blacklisted token attempted', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({ 
        success: false,
        msg: 'Token has been revoked' 
      });
    }

    // Verify token structure
    const tokenParts = token.split('.');
    if (tokenParts.length \!== 3) {
      logger.warn('Malformed token detected', {
        ip: req.ip,
        tokenParts: tokenParts.length
      });
      
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid token format' 
      });
    }

    // Verify JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Additional token validation
    const now = Math.floor(Date.now() / 1000);
    
    // Check token expiration
    if (decoded.exp && decoded.exp < now) {
      logger.info('Expired token rejected', {
        userId: decoded.user?.id,
        exp: decoded.exp,
        now: now
      });
      
      return res.status(401).json({ 
        success: false,
        msg: 'Token has expired' 
      });
    }
    
    // Check token age (additional security layer)
    if (decoded.iat) {
      const tokenAge = now - decoded.iat;
      const maxAge = 24 * 60 * 60; // 24 hours
      
      if (tokenAge > maxAge) {
        logger.warn('Very old token rejected', {
          userId: decoded.user?.id,
          tokenAge: Math.floor(tokenAge / 60 / 60),
          maxAge: Math.floor(maxAge / 60 / 60)
        });
        
        return res.status(401).json({ 
          success: false,
          msg: 'Token too old, please login again' 
        });
      }
    }

    // Extract user info (support both formats)
    const user = decoded.user || decoded;
    
    if (\!user || \!user.id) {
      logger.warn('Token missing user information', {
        ip: req.ip,
        hasUser: \!\!decoded.user,
        hasId: \!\!decoded.id
      });
      
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid token payload' 
      });
    }

    // Session security tracking
    const sessionKey = `${user.id}:${req.ip}`;
    const existingSession = activeSessions.get(user.id);
    
    if (existingSession && existingSession.ip \!== req.ip) {
      logger.warn('Session from different IP detected', {
        userId: user.id,
        currentIP: req.ip,
        sessionIP: existingSession.ip,
        userAgent: req.get('User-Agent')
      });
      
      // In production, you might want to:
      // 1. Require re-authentication
      // 2. Send security alert
      // 3. Invalidate other sessions
    }
    
    // Update session tracking
    activeSessions.set(user.id, {
      ip: req.ip,
      lastSeen: now,
      userAgent: req.get('User-Agent'),
      token: token
    });

    // Add user and token to request
    req.user = user;
    req.currentToken = token;
    
    // Success logging (minimal for performance)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Authentication successful', {
        userId: user.id,
        path: req.path
      });
    }
    
    next();

  } catch (err) {
    // Handle specific JWT errors
    if (err.name === 'JsonWebTokenError') {
      logger.warn('Invalid JWT token', {
        error: err.message,
        ip: req.ip,
        path: req.path
      });
      
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid token' 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      logger.info('Expired token', {
        error: err.message,
        ip: req.ip
      });
      
      return res.status(401).json({ 
        success: false,
        msg: 'Token has expired' 
      });
    }
    
    if (err.name === 'NotBeforeError') {
      logger.warn('Token used before valid time', {
        error: err.message,
        ip: req.ip
      });
      
      return res.status(401).json({ 
        success: false,
        msg: 'Token not yet valid' 
      });
    }

    // Generic error handling
    logger.error('Authentication error', {
      error: err.message,
      name: err.name,
      ip: req.ip,
      path: req.path
    });
    
    res.status(401).json({ 
      success: false,
      msg: 'Authentication failed' 
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = req.header('x-auth-token') || 
                (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

  if (\!token) {
    return next(); // Continue without authentication
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user || decoded;
    req.currentToken = token;
  } catch (err) {
    // Log but don't fail the request
    logger.debug('Optional auth failed', { error: err.message });
  }

  next();
};

// Role-based authorization middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (\!req.user) {
      return res.status(401).json({
        success: false,
        msg: 'Authentication required'
      });
    }

    const userRole = req.user.role || 'user';
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (\!allowedRoles.includes(userRole)) {
      logger.warn('Insufficient permissions', {
        userId: req.user.id,
        userRole: userRole,
        requiredRoles: allowedRoles,
        path: req.path
      });

      return res.status(403).json({
        success: false,
        msg: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Token revocation utility
const revokeToken = (token, userId) => {
  if (token) {
    tokenBlacklist.add(token);
    
    // Remove from active sessions
    if (userId) {
      activeSessions.delete(userId);
    }
    
    logger.info('Token revoked', { userId });
  }
};

// Cleanup expired tokens from blacklist
const cleanupBlacklist = () => {
  const now = Math.floor(Date.now() / 1000);
  const tokensToRemove = [];
  
  for (const token of tokenBlacklist) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      if (payload.exp && payload.exp < now) {
        tokensToRemove.push(token);
      }
    } catch (error) {
      // Invalid token format, remove it
      tokensToRemove.push(token);
    }
  }
  
  tokensToRemove.forEach(token => tokenBlacklist.delete(token));
  
  if (tokensToRemove.length > 0) {
    logger.info('Cleaned up expired tokens', { count: tokensToRemove.length });
  }
};

// Cleanup expired sessions
const cleanupSessions = () => {
  const now = Math.floor(Date.now() / 1000);
  const maxAge = 24 * 60 * 60; // 24 hours
  const sessionsToRemove = [];
  
  for (const [userId, session] of activeSessions.entries()) {
    if (now - session.lastSeen > maxAge) {
      sessionsToRemove.push(userId);
    }
  }
  
  sessionsToRemove.forEach(userId => activeSessions.delete(userId));
  
  if (sessionsToRemove.length > 0) {
    logger.info('Cleaned up expired sessions', { count: sessionsToRemove.length });
  }
};

// Run cleanup every hour
setInterval(() => {
  cleanupBlacklist();
  cleanupSessions();
}, 60 * 60 * 1000);

// Export utilities for testing and management
const getActiveSessionCount = () => activeSessions.size;
const getBlacklistedTokenCount = () => tokenBlacklist.size;

module.exports = {
  auth: enhancedAuth,
  optionalAuth,
  requireRole,
  revokeToken,
  cleanupBlacklist,
  cleanupSessions,
  getActiveSessionCount,
  getBlacklistedTokenCount,
  // Legacy export for compatibility
  default: enhancedAuth
};
EOF < /dev/null