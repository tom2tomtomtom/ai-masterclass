const { body, param, query, validationResult } = require('express-validator');
const logger = require('../../utils/logger');

/**
 * Enhanced validation with stronger security requirements
 * OWASP Reference: A03:2021 - Injection, A04:2021 - Insecure Design
 */

// Enhanced password validation with entropy checking
const validateStrongPassword = () => {
  return body('password')
    .isLength({ min: 12, max: 128 })
    .withMessage('Password must be between 12 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d\!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{12,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .custom((value) => {
      // Check for common weak patterns
      const weakPatterns = [
        /^(.)\1+$/, // All same character
        /123456|654321|abcdef|qwerty|password|admin/i, // Common patterns
        /^[a-zA-Z]+$/, // Only letters
        /^[0-9]+$/, // Only numbers
      ];
      
      for (const pattern of weakPatterns) {
        if (pattern.test(value)) {
          throw new Error('Password contains weak patterns');
        }
      }
      
      // Check character diversity (entropy)
      const uniqueChars = new Set(value.toLowerCase()).size;
      const minUniqueChars = Math.max(8, Math.floor(value.length * 0.6));
      
      if (uniqueChars < minUniqueChars) {
        throw new Error('Password lacks sufficient character diversity');
      }
      
      return true;
    });
};

// Enhanced email validation with domain checking
const validateSecureEmail = () => {
  return body('email')
    .isEmail({ 
      allow_utf8_local_part: false,
      require_tld: true,
      allow_ip_domain: false
    })
    .withMessage('Please provide a valid email address')
    .normalizeEmail({
      gmail_lowercase: true,
      gmail_remove_dots: false,
      outlookdotcom_lowercase: true,
      yahoo_lowercase: true,
      icloud_lowercase: true
    })
    .isLength({ max: 320 }) // RFC 5321 limit
    .withMessage('Email address too long')
    .custom(async (value) => {
      // Block disposable email domains
      const disposableDomains = [
        '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
        'temp-mail.org', 'throwaway.email', 'yopmail.com'
      ];
      
      const domain = value.split('@')[1]?.toLowerCase();
      if (disposableDomains.includes(domain)) {
        throw new Error('Disposable email addresses are not allowed');
      }
      
      // Block suspicious patterns
      if (/\+.*test|temp|fake|spam/i.test(value)) {
        throw new Error('Suspicious email pattern detected');
      }
      
      return true;
    });
};

// SQL injection prevention for text inputs
const sanitizeTextInput = (fieldName, options = {}) => {
  const { minLength = 1, maxLength = 255, allowSpecialChars = false } = options;
  
  return body(fieldName)
    .trim()
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${fieldName} must be between ${minLength} and ${maxLength} characters`)
    .matches(allowSpecialChars ? /^[a-zA-Z0-9\s\-_.@#$%^&*()\!+,]*$/ : /^[a-zA-Z0-9\s\-_.]*$/)
    .withMessage(`${fieldName} contains invalid characters`)
    .escape() // HTML escape to prevent XSS
    .custom((value) => {
      // Check for SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
        /(--|\/\*|\*\/|;|'|"|`)/,
        /(\bOR\b|\bAND\b).*?[=<>]/i,
        /\b(INFORMATION_SCHEMA|SYS|MASTER)\b/i
      ];
      
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          throw new Error('Input contains suspicious patterns');
        }
      }
      
      return true;
    });
};

// Enhanced UUID validation
const validateSecureUUID = (paramName) => {
  return param(paramName)
    .isUUID(4)
    .withMessage(`Invalid ${paramName} format`)
    .custom((value) => {
      // Additional UUID security checks
      if (value === '00000000-0000-0000-0000-000000000000') {
        throw new Error('Null UUID not allowed');
      }
      return true;
    });
};

// Request rate validation based on content
const validateRequestComplexity = (req, res, next) => {
  try {
    const bodySize = JSON.stringify(req.body || {}).length;
    const maxBodySize = 50000; // 50KB
    
    if (bodySize > maxBodySize) {
      logger.warn('Oversized request body detected', {
        size: bodySize,
        ip: req.ip,
        path: req.path
      });
      
      return res.status(413).json({
        success: false,
        msg: 'Request body too large'
      });
    }
    
    // Check for deeply nested objects (potential DoS)
    const maxDepth = 10;
    const depth = getObjectDepth(req.body);
    
    if (depth > maxDepth) {
      logger.warn('Deeply nested object detected', {
        depth: depth,
        ip: req.ip,
        path: req.path
      });
      
      return res.status(400).json({
        success: false,
        msg: 'Request structure too complex'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Request complexity validation error:', error);
    return res.status(500).json({
      success: false,
      msg: 'Request validation error'
    });
  }
};

// Helper function to calculate object depth
const getObjectDepth = (obj, depth = 0) => {
  if (depth > 20) return depth; // Prevent stack overflow
  
  if (obj === null || typeof obj \!== 'object') {
    return depth;
  }
  
  if (Array.isArray(obj)) {
    return Math.max(depth, ...obj.map(item => getObjectDepth(item, depth + 1)));
  }
  
  const values = Object.values(obj);
  if (values.length === 0) return depth;
  
  return Math.max(depth, ...values.map(value => getObjectDepth(value, depth + 1)));
};

// Enhanced validation error handler with security logging
const handleSecurityValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (\!errors.isEmpty()) {
    const errorMessages = errors.array();
    
    // Log validation failures for security monitoring
    logger.warn('Input validation failed', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      errors: errorMessages.map(err => ({
        field: err.param,
        message: err.msg,
        value: typeof err.value === 'string' ? err.value.substring(0, 100) : err.value
      })),
      userAgent: req.get('User-Agent')
    });
    
    // Check for potential security threats
    const suspiciousPatterns = errorMessages.some(err => 
      err.msg.includes('suspicious patterns') || 
      err.msg.includes('SQL injection') ||
      err.msg.includes('XSS')
    );
    
    if (suspiciousPatterns) {
      logger.error('Security threat detected in validation', {
        ip: req.ip,
        path: req.path,
        errors: errorMessages
      });
    }
    
    return res.status(400).json({
      success: false,
      msg: 'Validation failed',
      errors: errorMessages.map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Registration validation with enhanced security
const validateSecureRegistration = [
  validateSecureEmail(),
  validateStrongPassword(),
  sanitizeTextInput('first_name', { maxLength: 50 }),
  sanitizeTextInput('last_name', { maxLength: 50 }),
  body('terms_accepted')
    .equals('true')
    .withMessage('Terms and conditions must be accepted'),
  validateRequestComplexity,
  handleSecurityValidationErrors
];

// Login validation with security enhancements
const validateSecureLogin = [
  validateSecureEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password too long'),
  body('remember_me')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be boolean'),
  validateRequestComplexity,
  handleSecurityValidationErrors
];

// Search query validation to prevent injection
const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long')
    .matches(/^[a-zA-Z0-9\s\-_.]*$/)
    .withMessage('Search query contains invalid characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0, max: 10000 })
    .withMessage('Offset must be between 0 and 10000'),
  handleSecurityValidationErrors
];

module.exports = {
  validateStrongPassword,
  validateSecureEmail,
  sanitizeTextInput,
  validateSecureUUID,
  validateRequestComplexity,
  handleSecurityValidationErrors,
  validateSecureRegistration,
  validateSecureLogin,
  validateSearchQuery,
  getObjectDepth
};
ENDFILE < /dev/null