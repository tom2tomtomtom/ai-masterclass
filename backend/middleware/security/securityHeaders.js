const helmet = require('helmet');
const logger = require('../../utils/logger');

/**
 * Enhanced security headers configuration
 * OWASP Reference: A05:2021 - Security Misconfiguration
 */

// Production-grade security headers
const securityHeaders = helmet({
  // Content Security Policy - prevents XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", // Allow inline styles for React
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-eval'", // Required for React development
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:",
        "blob:" // Allow blob URLs for images
      ],
      connectSrc: [
        "'self'",
        "https://*.supabase.co", // Supabase API endpoints
        "wss://*.supabase.co"    // Supabase WebSocket connections
      ],
      frameSrc: ["'none'"], // Prevent clickjacking
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
    reportOnly: process.env.NODE_ENV === 'development', // Report only in dev
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // Prevent MIME type sniffing
  noSniff: true,

  // X-Frame-Options to prevent clickjacking
  frameguard: { action: 'deny' },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false, // Disable for compatibility

  // Cross-Origin Opener Policy  
  crossOriginOpenerPolicy: { policy: 'cross-origin' },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // Permissions Policy (formerly Feature Policy)
  permissionsPolicy: {
    features: {
      camera: ['none'],
      microphone: ['none'],
      geolocation: ['none'],
      payment: ['none'],
      usb: ['none'],
      magnetometer: ['none'],
      gyroscope: ['none'],
      speaker: ['none'],
      vibrate: ['none'],
      fullscreen: ['self'],
      encrypted_media: ['none']
    }
  }
});

// Additional security headers for API responses
const apiSecurityHeaders = (req, res, next) => {
  try {
    // Prevent caching of sensitive data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Server information disclosure prevention
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // Additional API-specific headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    // Add request ID for tracking
    res.setHeader('X-Request-ID', req.id || 'unknown');

    next();
  } catch (error) {
    logger.error('Security headers error:', error);
    next();
  }
};

// CSP violation reporting endpoint
const cspReportHandler = (req, res) => {
  try {
    const report = req.body;
    
    logger.warn('CSP Violation Report', {
      report: report,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    res.status(204).end();
  } catch (error) {
    logger.error('CSP report handling error:', error);
    res.status(400).json({
      success: false,
      msg: 'Invalid CSP report'
    });
  }
};

// Environment-specific header configuration
const getEnvironmentHeaders = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return {
      // Stricter CSP for production
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "https://fonts.googleapis.com"],
          scriptSrc: ["'self'"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://*.supabase.co"],
          frameSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"]
        }
      }
    };
  }

  return {}; // Use default headers for development
};

module.exports = {
  securityHeaders,
  apiSecurityHeaders,
  cspReportHandler,
  getEnvironmentHeaders
};
EOF < /dev/null