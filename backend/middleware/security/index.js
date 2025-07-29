/**
 * Comprehensive Security Middleware Suite
 * Implements OWASP Top 10 security measures
 */

// Import all security middleware
const { 
  xssSanitize, 
  noSqlSanitize, 
  validateContentType, 
  requestSizeLimit 
} = require('./inputSanitization');

const { 
  securityHeaders, 
  apiSecurityHeaders, 
  cspReportHandler 
} = require('./securityHeaders');

const { 
  authLimiter, 
  authSlowDown, 
  apiLimiter, 
  sensitiveOperationsLimiter, 
  courseLimiter, 
  trackFailedAuth, 
  adminIPWhitelist, 
  honeypotLimiter 
} = require('./advancedRateLimit');

const { 
  enhancedCors, 
  corsSecurityEnforcer, 
  corsErrorHandler, 
  getEnvironmentCors 
} = require('./secureCors');

const { 
  enhancedJWTValidation, 
  preventSessionFixation, 
  revokeToken, 
  detectConcurrentSessions, 
  secureLogout, 
  detectSuspiciousActivity, 
  passwordChangeNotification 
} = require('./sessionSecurity');

const { 
  validateStrongPassword,
  validateSecureEmail,
  sanitizeTextInput,
  validateSecureUUID,
  validateRequestComplexity,
  handleSecurityValidationErrors,
  validateSecureRegistration,
  validateSecureLogin,
  validateSearchQuery
} = require('./enhancedValidation');

// Security middleware configuration for different environments
const getSecurityConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    // Core security middleware (always enabled)
    core: [
      validateContentType,
      requestSizeLimit,
      noSqlSanitize,
      xssSanitize,
      securityHeaders,
      apiSecurityHeaders
    ],
    
    // CORS configuration
    cors: getEnvironmentCors(),
    
    // Rate limiting (stricter in production)
    rateLimiting: {
      api: apiLimiter,
      auth: [authSlowDown, authLimiter],
      courses: courseLimiter,
      sensitive: sensitiveOperationsLimiter
    },
    
    // Session security
    session: [
      enhancedJWTValidation,
      preventSessionFixation,
      detectConcurrentSessions,
      detectSuspiciousActivity
    ],
    
    // Validation middleware
    validation: {
      registration: validateSecureRegistration,
      login: validateSecureLogin,
      search: validateSearchQuery
    },
    
    // Admin security (production only)
    admin: isProduction ? [adminIPWhitelist] : [],
    
    // Error handlers
    errorHandlers: [
      corsErrorHandler
    ]
  };
};

// Honeypot routes to catch malicious bots
const setupHoneypots = (app) => {
  const honeypotRoutes = [
    '/wp-admin',
    '/wp-login.php',
    '/admin',
    '/administrator',
    '/phpmyadmin',
    '/.env',
    '/config.php',
    '/xmlrpc.php'
  ];
  
  honeypotRoutes.forEach(route => {
    app.all(route, honeypotLimiter, (req, res) => {
      res.status(404).json({
        success: false,
        msg: 'Not found'
      });
    });
  });
};

// Security audit logging
const auditSecurityEvent = (eventType, details) => {
  const logger = require('../../utils/logger');
  
  logger.warn('Security Event', {
    type: eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = {
  // Individual middleware exports
  xssSanitize,
  noSqlSanitize,
  validateContentType,
  requestSizeLimit,
  securityHeaders,
  apiSecurityHeaders,
  cspReportHandler,
  authLimiter,
  authSlowDown,
  apiLimiter,
  sensitiveOperationsLimiter,
  courseLimiter,
  trackFailedAuth,
  adminIPWhitelist,
  honeypotLimiter,
  enhancedCors,
  corsSecurityEnforcer,
  corsErrorHandler,
  enhancedJWTValidation,
  preventSessionFixation,
  revokeToken,
  detectConcurrentSessions,
  secureLogout,
  detectSuspiciousActivity,
  passwordChangeNotification,
  validateStrongPassword,
  validateSecureEmail,
  sanitizeTextInput,
  validateSecureUUID,
  validateRequestComplexity,
  handleSecurityValidationErrors,
  validateSecureRegistration,
  validateSecureLogin,
  validateSearchQuery,
  
  // Configuration and setup functions
  getSecurityConfig,
  setupHoneypots,
  auditSecurityEvent
};
EOF < /dev/null