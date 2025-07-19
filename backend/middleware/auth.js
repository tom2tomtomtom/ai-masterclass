const jwt = require('jsonwebtoken');

// Try to import logger, fallback to console if not available
let logger;
try {
  logger = require('../utils/logger');
} catch (error) {
  logger = {
    info: () => {},
    error: () => {},
    warn: () => {}
  };
}

// Authentication middleware to verify JWT tokens
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user || decoded; // Support both formats for compatibility
    next();
  } catch (err) {
    logger.error('Token verification failed:', { error: err.message, ip: req.ip });
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;