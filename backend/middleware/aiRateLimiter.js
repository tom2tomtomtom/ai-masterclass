const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// AI-specific rate limiter with higher restrictions due to API costs
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 AI requests per 15 minutes
  message: {
    error: 'Too many AI requests from this IP, please try again later.',
    retryAfter: 15 * 60,
    tip: 'AI requests are rate-limited to prevent excessive API costs. Please use the playground responsibly.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
  onLimitReached: (req, res) => {
    logger.warn(`AI rate limit exceeded for IP: ${req.ip}`);
  }
});

// Stricter rate limiter for comparison and full analysis endpoints
const aiComparisonLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // limit each IP to 10 comparison requests per 30 minutes
  message: {
    error: 'Too many AI comparison requests, please try again later.',
    retryAfter: 30 * 60,
    tip: 'Comparison requests use multiple AI providers and are more expensive. Please use sparingly.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  onLimitReached: (req, res) => {
    logger.warn(`AI comparison rate limit exceeded for IP: ${req.ip}`);
  }
});

// Very strict rate limiter for full analysis endpoints
const aiFullAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes (1 hour)
  max: 5, // limit each IP to 5 full analysis requests per hour
  message: {
    error: 'Too many full analysis requests, please try again later.',
    retryAfter: 60 * 60,
    tip: 'Full analysis requests are resource-intensive and use multiple AI providers. Please use very sparingly.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  onLimitReached: (req, res) => {
    logger.warn(`AI full analysis rate limit exceeded for IP: ${req.ip}`);
  }
});

// Development mode - more lenient limits for testing
if (process.env.NODE_ENV === 'development') {
  // Increase limits for development
  aiRateLimiter.options.max = 100; // 100 requests per 15 minutes
  aiComparisonLimiter.options.max = 50; // 50 comparison requests per 30 minutes
  aiFullAnalysisLimiter.options.max = 25; // 25 full analysis requests per hour
  
  logger.info('AI rate limiters configured for development mode with increased limits');
}

module.exports = {
  aiRateLimiter,
  aiComparisonLimiter,
  aiFullAnalysisLimiter
};