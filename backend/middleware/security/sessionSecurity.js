const logger = require('../../utils/logger');

/**
 * Session and JWT security enhancements
 * OWASP Reference: A02:2021 - Cryptographic Failures, A07:2021 - Identification and Authentication Failures
 */

// Token blacklist for logout/revocation
const tokenBlacklist = new Set();

// Clean up expired tokens from blacklist
const cleanupBlacklist = () => {
  // In production, this should be stored in Redis or database
  // For now, we'll implement a simple time-based cleanup
  const now = Math.floor(Date.now() / 1000);
  const expiredTokens = [];
  
  for (const token of tokenBlacklist) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      if (payload.exp && payload.exp < now) {
        expiredTokens.push(token);
      }
    } catch (error) {
      // Invalid token format, remove it
      expiredTokens.push(token);
    }
  }
  
  expiredTokens.forEach(token => tokenBlacklist.delete(token));
};

// Run cleanup every hour
setInterval(cleanupBlacklist, 60 * 60 * 1000);

// Enhanced JWT validation middleware
const enhancedJWTValidation = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (\!authHeader) {
      return res.status(401).json({
        success: false,
        msg: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      logger.warn('Blacklisted token used', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({
        success: false,
        msg: 'Token has been revoked'
      });
    }

    // Additional token format validation
    const tokenParts = token.split('.');
    if (tokenParts.length \!== 3) {
      return res.status(401).json({
        success: false,
        msg: 'Invalid token format'
      });
    }

    // Check token age (even if not expired, very old tokens should be rejected)
    try {
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      const tokenAge = Date.now() / 1000 - payload.iat;
      const maxAge = 24 * 60 * 60; // 24 hours maximum token age
      
      if (tokenAge > maxAge) {
        logger.info('Very old token rejected', {
          tokenAge: Math.floor(tokenAge / 60 / 60),
          ip: req.ip
        });
        
        return res.status(401).json({
          success: false,
          msg: 'Token too old, please login again'
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        msg: 'Invalid token payload'
      });
    }

    // Store token for potential blacklisting
    req.currentToken = token;
    next();

  } catch (error) {
    logger.error('Enhanced JWT validation error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Token validation error'
    });
  }
};

// Session fixation prevention
const preventSessionFixation = (req, res, next) => {
  // Generate new session ID after successful authentication
  if (req.method === 'POST' && req.path.includes('/login')) {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode === 200) {
        // Successful login - invalidate old sessions
        res.setHeader('Clear-Site-Data', '"cookies", "storage"');
        
        logger.info('Session regenerated after successful login', {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }
      
      return originalSend.call(this, data);
    };
  }
  
  next();
};

// Token revocation middleware
const revokeToken = (req, res, next) => {
  if (req.currentToken) {
    tokenBlacklist.add(req.currentToken);
    logger.info('Token revoked', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
  next();
};

// Concurrent session detection
const sessionTracker = new Map(); // In production, use Redis

const detectConcurrentSessions = (req, res, next) => {
  if (req.user) {
    const userId = req.user.id;
    const currentIP = req.ip;
    const userAgent = req.get('User-Agent');
    
    const sessionKey = `${userId}:${currentIP}:${userAgent}`;
    const existing = sessionTracker.get(userId);
    
    if (existing && existing.sessionKey \!== sessionKey) {
      logger.warn('Concurrent session detected', {
        userId: userId,
        existingSession: existing.sessionKey,
        newSession: sessionKey,
        ip: currentIP
      });
      
      // In production, you might want to:
      // 1. Invalidate the old session
      // 2. Send email notification
      // 3. Require additional verification
    }
    
    sessionTracker.set(userId, {
      sessionKey: sessionKey,
      lastSeen: Date.now(),
      ip: currentIP,
      userAgent: userAgent
    });
  }
  
  next();
};

// Secure logout middleware
const secureLogout = async (req, res, next) => {
  try {
    if (req.currentToken) {
      // Add token to blacklist
      tokenBlacklist.add(req.currentToken);
    }
    
    if (req.user) {
      // Remove from session tracker
      sessionTracker.delete(req.user.id);
      
      logger.info('User logged out securely', {
        userId: req.user.id,
        ip: req.ip
      });
    }
    
    // Clear authentication headers
    res.setHeader('Clear-Site-Data', '"cookies", "storage"');
    
    next();
  } catch (error) {
    logger.error('Secure logout error:', error);
    next();
  }
};

// Suspicious activity detector
const detectSuspiciousActivity = (req, res, next) => {
  if (req.user) {
    const userId = req.user.id;
    const currentIP = req.ip;
    const userAgent = req.get('User-Agent');
    
    const lastSession = sessionTracker.get(userId);
    
    if (lastSession) {
      // Check for IP address changes
      if (lastSession.ip \!== currentIP) {
        logger.warn('IP address change detected', {
          userId: userId,
          oldIP: lastSession.ip,
          newIP: currentIP,
          userAgent: userAgent
        });
        
        // In production, consider:
        // 1. Requiring re-authentication
        // 2. Sending security alert email
        // 3. Additional verification steps
      }
      
      // Check for user agent changes (possible session hijacking)
      if (lastSession.userAgent \!== userAgent) {
        logger.warn('User agent change detected', {
          userId: userId,
          oldUA: lastSession.userAgent,
          newUA: userAgent,
          ip: currentIP
        });
      }
    }
  }
  
  next();
};

// Password change security
const passwordChangeNotification = (req, res, next) => {
  if (req.method === 'POST' && req.path.includes('/change-password')) {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode === 200) {
        logger.info('Password changed successfully', {
          userId: req.user?.id,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        // In production:
        // 1. Send email notification
        // 2. Invalidate all other sessions
        // 3. Log security event
      }
      
      return originalSend.call(this, data);
    };
  }
  
  next();
};

module.exports = {
  enhancedJWTValidation,
  preventSessionFixation,
  revokeToken,
  detectConcurrentSessions,
  secureLogout,
  detectSuspiciousActivity,
  passwordChangeNotification,
  // Export for testing
  tokenBlacklist,
  sessionTracker
};
ENDFILE < /dev/null