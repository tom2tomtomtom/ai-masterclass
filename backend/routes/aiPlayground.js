const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const aiService = require('../services/aiService');
const responseComparisonService = require('../services/responseComparisonService');
const qualityScoringService = require('../services/qualityScoringService');
const logger = require('../utils/logger');
const metricsCollector = require('../utils/metrics');

// Rate limiter for AI endpoints (more restrictive due to API costs)
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 AI requests per 5 minutes
  message: {
    error: 'Too many AI requests, please try again later.',
    retryAfter: 5 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware for AI requests
const validateAIRequest = [
  body('prompt')
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Prompt must be between 10 and 5000 characters'),
  body('providers')
    .optional()
    .isArray()
    .withMessage('Providers must be an array')
    .custom((providers) => {
      const validProviders = ['openai', 'anthropic', 'google'];
      const invalid = providers.filter(p => !validProviders.includes(p));
      if (invalid.length > 0) {
        throw new Error(`Invalid providers: ${invalid.join(', ')}`);
      }
      return true;
    }),
  body('parameters')
    .optional()
    .isObject()
    .withMessage('Parameters must be an object'),
  body('parameters.temperature')
    .optional()
    .isFloat({ min: 0, max: 2 })
    .withMessage('Temperature must be between 0 and 2'),
  body('parameters.maxTokens')
    .optional()
    .isInt({ min: 1, max: 4000 })
    .withMessage('Max tokens must be between 1 and 4000'),
  body('parameters.model')
    .optional()
    .isString()
    .withMessage('Model must be a string'),
  body('parameters.systemMessage')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('System message must be less than 1000 characters')
];

/**
 * GET /api/ai-playground/status
 * Get AI service status and available providers
 */
router.get('/status', async (req, res) => {
  try {
    const aiStatus = aiService.getHealthStatus();
    const comparisonStatus = responseComparisonService.getHealthStatus();
    const qualityStatus = qualityScoringService.getHealthStatus();

    res.json({
      success: true,
      data: {
        ai_service: aiStatus,
        comparison_service: comparisonStatus,
        quality_service: qualityStatus,
        overall_status: aiStatus.initialized ? 'operational' : 'limited'
      }
    });
  } catch (error) {
    logger.error('Error getting AI playground status:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to get service status'
    });
  }
});

/**
 * GET /api/ai-playground/providers
 * Get available AI providers and their models
 */
router.get('/providers', async (req, res) => {
  try {
    const availableProviders = aiService.getAvailableProviders();
    
    const providersInfo = {
      openai: {
        available: availableProviders.includes('openai'),
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        description: 'OpenAI GPT models'
      },
      anthropic: {
        available: availableProviders.includes('anthropic'),
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        description: 'Anthropic Claude models'
      },
      google: {
        available: availableProviders.includes('google'),
        models: ['gemini-pro', 'gemini-pro-vision'],
        description: 'Google Gemini models'
      }
    };

    res.json({
      success: true,
      data: {
        total_providers: availableProviders.length,
        available_providers: availableProviders,
        providers: providersInfo
      }
    });
  } catch (error) {
    logger.error('Error getting AI providers:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to get provider information'
    });
  }
});

/**
 * POST /api/ai-playground/generate
 * Generate response from a single AI provider
 */
router.post('/generate', aiLimiter, validateAIRequest, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    const { prompt, provider, parameters = {} } = req.body;
    const startTime = Date.now();

    logger.info(`Generating single response from ${provider || 'default'} provider`);

    // Generate response
    const response = await aiService.generateResponse(parameters.prompt ? parameters : { prompt, ...parameters }, provider);

    // Record token usage metrics
    if (response.usage) {
      metricsCollector.recordAITokenUsage(
        response.provider,
        response.model,
        response.usage.prompt_tokens || response.usage.input_tokens || 0,
        response.usage.completion_tokens || response.usage.output_tokens || 0
      );
    }

    const result = {
      success: true,
      data: {
        response,
        metadata: {
          request_time: new Date().toISOString(),
          processing_time: Date.now() - startTime
        }
      }
    };

    logger.info(`Single response generated successfully in ${result.data.metadata.processing_time}ms`);
    res.json(result);

  } catch (error) {
    logger.error('Error generating AI response:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to generate response',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/ai-playground/compare
 * Generate and compare responses from multiple AI providers
 */
router.post('/compare', aiLimiter, validateAIRequest, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    const { prompt, providers, parameters = {} } = req.body;
    const startTime = Date.now();

    logger.info(`Starting response comparison with ${providers ? providers.length : 'all'} providers`);

    // Generate comparison
    const comparison = await responseComparisonService.generateComparison({
      prompt,
      providers,
      parameters
    });

    // Record token usage for all successful responses
    comparison.responses.forEach(response => {
      if (response.usage) {
        metricsCollector.recordAITokenUsage(
          response.provider,
          response.model,
          response.usage.prompt_tokens || response.usage.input_tokens || 0,
          response.usage.completion_tokens || response.usage.output_tokens || 0
        );
      }
    });

    const result = {
      success: true,
      data: {
        comparison,
        metadata: {
          request_time: new Date().toISOString(),
          total_processing_time: Date.now() - startTime
        }
      }
    };

    logger.info(`Response comparison completed: ${comparison.summary.successful_responses}/${comparison.summary.total_providers} responses in ${result.data.metadata.total_processing_time}ms`);
    res.json(result);

  } catch (error) {
    logger.error('Error in response comparison:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to generate comparison',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/ai-playground/score
 * Score the quality of AI responses
 */
router.post('/score', validateAIRequest, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    const { prompt, providers, parameters = {}, scoreOnly = false } = req.body;
    const startTime = Date.now();

    logger.info(`Starting quality scoring${scoreOnly ? ' only' : ' with generation'}`);

    let responses = [];

    if (scoreOnly && req.body.responses) {
      // Score provided responses
      responses = req.body.responses;
    } else {
      // Generate responses first
      const multipleResponses = await aiService.generateMultipleResponses(
        { prompt, ...parameters },
        providers
      );
      responses = multipleResponses.responses;

      // Record token usage
      responses.forEach(response => {
        if (response.usage) {
          metricsCollector.recordAITokenUsage(
            response.provider,
            response.model,
            response.usage.prompt_tokens || response.usage.input_tokens || 0,
            response.usage.completion_tokens || response.usage.output_tokens || 0
          );
        }
      });
    }

    // Score the responses
    const scoring = await qualityScoringService.scoreMultipleResponses(
      responses,
      prompt,
      parameters.context || {}
    );

    // Record quality scores in metrics
    scoring.individual_scores.forEach(score => {
      metricsCollector.recordAIQualityScore(
        score.response_info.provider,
        score.response_info.model,
        score.scores.overall
      );
    });

    const result = {
      success: true,
      data: {
        scoring,
        metadata: {
          request_time: new Date().toISOString(),
          total_processing_time: Date.now() - startTime,
          score_only: scoreOnly
        }
      }
    };

    logger.info(`Quality scoring completed for ${scoring.summary.successfully_scored} responses in ${result.data.metadata.total_processing_time}ms`);
    res.json(result);

  } catch (error) {
    logger.error('Error in quality scoring:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to score responses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/ai-playground/full-analysis
 * Complete analysis: generate, compare, and score responses
 */
router.post('/full-analysis', aiLimiter, validateAIRequest, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    const { prompt, providers, parameters = {} } = req.body;
    const startTime = Date.now();

    logger.info(`Starting full analysis with ${providers ? providers.length : 'all'} providers`);

    // Step 1: Generate comparison
    const comparison = await responseComparisonService.generateComparison({
      prompt,
      providers,
      parameters
    });

    // Step 2: Score the responses
    const scoring = await qualityScoringService.scoreMultipleResponses(
      comparison.responses,
      prompt,
      parameters.context || {}
    );

    // Record metrics for all responses
    comparison.responses.forEach(response => {
      if (response.usage) {
        metricsCollector.recordAITokenUsage(
          response.provider,
          response.model,
          response.usage.prompt_tokens || response.usage.input_tokens || 0,
          response.usage.completion_tokens || response.usage.output_tokens || 0
        );
      }
    });

    scoring.individual_scores.forEach(score => {
      metricsCollector.recordAIQualityScore(
        score.response_info.provider,
        score.response_info.model,
        score.scores.overall
      );
    });

    const result = {
      success: true,
      data: {
        prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
        comparison,
        scoring,
        combined_insights: {
          best_overall: scoring.best_response,
          performance_summary: {
            fastest_response: comparison.comparison.fastest_response,
            highest_quality: scoring.best_response?.provider,
            most_efficient: this.findMostEfficient(comparison.responses, scoring.individual_scores)
          },
          recommendations: this.generateRecommendations(comparison, scoring)
        },
        metadata: {
          request_time: new Date().toISOString(),
          total_processing_time: Date.now() - startTime,
          analysis_steps: ['generation', 'comparison', 'scoring']
        }
      }
    };

    logger.info(`Full analysis completed: ${comparison.summary.successful_responses} responses analyzed in ${result.data.metadata.total_processing_time}ms`);
    res.json(result);

  } catch (error) {
    logger.error('Error in full analysis:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to complete full analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/ai-playground/metrics
 * Get AI playground usage metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const summary = await metricsCollector.getSummaryReport();
    
    res.json({
      success: true,
      data: {
        usage_summary: {
          total_ai_requests: summary.ai_requests_total || 0,
          total_tokens_used: summary.ai_tokens_used || 0,
          uptime_hours: Math.round(summary.uptime_seconds / 3600 * 100) / 100
        },
        service_health: {
          ai_service: aiService.getHealthStatus(),
          comparison_service: responseComparisonService.getHealthStatus(),
          quality_service: qualityScoringService.getHealthStatus()
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting AI playground metrics:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to get metrics'
    });
  }
});

// Helper functions
function findMostEfficient(responses, scores) {
  let bestEfficiency = 0;
  let mostEfficient = null;

  responses.forEach(response => {
    const score = scores.find(s => s.response_info.provider === response.provider);
    if (score && response.usage && response.usage.total_tokens) {
      const efficiency = score.scores.overall / response.usage.total_tokens;
      if (efficiency > bestEfficiency) {
        bestEfficiency = efficiency;
        mostEfficient = response.provider;
      }
    }
  });

  return mostEfficient;
}

function generateRecommendations(comparison, scoring) {
  const recommendations = [];

  if (scoring.best_response) {
    recommendations.push(`For highest quality responses, use ${scoring.best_response.provider}`);
  }

  if (comparison.comparison.fastest_response) {
    recommendations.push(`For fastest responses, use ${comparison.comparison.fastest_response}`);
  }

  const avgScore = scoring.summary.average_score;
  if (avgScore < 0.7) {
    recommendations.push('Consider refining your prompt for better response quality');
  }

  if (comparison.summary.failed_responses > 0) {
    recommendations.push('Some providers failed - check API keys and rate limits');
  }

  return recommendations.length > 0 ? recommendations : ['All providers performed well'];
}

module.exports = router;