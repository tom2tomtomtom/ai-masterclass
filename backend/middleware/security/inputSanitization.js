const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const logger = require('../../utils/logger');

/**
 * Input sanitization middleware to prevent XSS and NoSQL injection attacks
 * OWASP Reference: A03:2021 - Injection
 */

// XSS sanitization middleware
const xssSanitize = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('XSS sanitization error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Input processing error'
    });
  }
};

// Recursive object sanitization
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeValue(item));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key names to prevent prototype pollution
      const cleanKey = sanitizeKey(key);
      sanitized[cleanKey] = sanitizeValue(value);
    }
    return sanitized;
  }

  return sanitizeValue(obj);
};

// Sanitize individual values
const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    // Remove malicious scripts while preserving safe HTML
    return xss(value, {
      whiteList: {
        // Allow basic formatting for educational content
        'p': [],
        'br': [],
        'strong': [],
        'em': [],
        'u': [],
        'ol': [],
        'ul': [],
        'li': [],
        'code': ['class'],
        'pre': ['class']
      },
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    });
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item));
  }

  if (typeof value === 'object' && value \!== null) {
    return sanitizeObject(value);
  }

  return value;
};

// Sanitize object keys to prevent prototype pollution
const sanitizeKey = (key) => {
  if (typeof key \!== 'string') {
    return String(key);
  }

  // Block dangerous keys
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  if (dangerousKeys.includes(key.toLowerCase())) {
    return `_blocked_${key}`;
  }

  return key;
};

// NoSQL injection prevention
const noSqlSanitize = mongoSanitize({
  replaceWith: '_', // Replace prohibited characters with underscore
  onSanitize: ({ req, key }) => {
    logger.warn('NoSQL injection attempt detected', {
      ip: req.ip,
      key: key,
      userAgent: req.get('User-Agent')
    });
  }
});

// Content type validation middleware
const validateContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    
    if (\!contentType) {
      return res.status(400).json({
        success: false,
        msg: 'Content-Type header is required'
      });
    }

    // Allow only specific content types
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data'
    ];

    const isAllowed = allowedTypes.some(type => 
      contentType.toLowerCase().includes(type)
    );

    if (\!isAllowed) {
      logger.warn('Invalid content type attempted', {
        contentType,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(415).json({
        success: false,
        msg: 'Unsupported media type'
      });
    }
  }

  next();
};

// Request size limiting middleware
const requestSizeLimit = (req, res, next) => {
  // Additional check for request size beyond express.json limit
  const contentLength = req.get('Content-Length');
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes

  if (contentLength && parseInt(contentLength) > maxSize) {
    logger.warn('Request size limit exceeded', {
      size: contentLength,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.status(413).json({
      success: false,
      msg: 'Request entity too large'
    });
  }

  next();
};

module.exports = {
  xssSanitize,
  noSqlSanitize,
  validateContentType,
  requestSizeLimit,
  sanitizeObject,
  sanitizeValue
};
EOF < /dev/null