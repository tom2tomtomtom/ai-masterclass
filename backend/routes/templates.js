const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, query, param, validationResult } = require('express-validator');

const templateService = require('../services/templateService');
const logger = require('../utils/logger');

// Rate limiter for template operations
const templateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many template requests, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for template creation (more restrictive)
const createTemplateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 template creations per hour
  message: {
    error: 'Too many template creations, please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const templateValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 50, max: 10000 })
    .withMessage('Content must be between 50 and 10000 characters'),
  body('industry_category')
    .notEmpty()
    .withMessage('Industry category is required')
    .isIn(['marketing', 'sales', 'consulting', 'development', 'operations', 'customer_service', 'healthcare', 'education', 'finance', 'legal', 'technology', 'analytics'])
    .withMessage('Invalid industry category'),
  body('use_case_category')
    .notEmpty()
    .withMessage('Use case category is required')
    .isIn(['content_creation', 'analysis', 'strategy', 'problem_solving', 'communication', 'email_response', 'content_strategy', 'documentation', 'data_analysis', 'patient_communication', 'coding_assistance', 'research', 'planning', 'optimization'])
    .withMessage('Invalid use case category'),
  body('recommended_ai_model_id')
    .optional()
    .isUUID()
    .withMessage('Invalid AI model ID'),
  body('is_public')
    .optional()
    .isBoolean()
    .withMessage('is_public must be a boolean'),
];

const searchValidation = [
  query('query')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Search query must be less than 200 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('industry_categories')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        value = [value];
      }
      if (!Array.isArray(value)) {
        throw new Error('Industry categories must be an array');
      }
      const validCategories = ['marketing', 'sales', 'consulting', 'development', 'operations', 'customer_service', 'healthcare', 'education', 'finance', 'legal', 'technology', 'analytics'];
      const invalid = value.filter(cat => !validCategories.includes(cat));
      if (invalid.length > 0) {
        throw new Error(`Invalid industry categories: ${invalid.join(', ')}`);
      }
      return true;
    }),
  query('use_case_categories')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        value = [value];
      }
      if (!Array.isArray(value)) {
        throw new Error('Use case categories must be an array');
      }
      const validCategories = ['content_creation', 'analysis', 'strategy', 'problem_solving', 'communication', 'email_response', 'content_strategy', 'documentation', 'data_analysis', 'patient_communication', 'coding_assistance', 'research', 'planning', 'optimization'];
      const invalid = value.filter(cat => !validCategories.includes(cat));
      if (invalid.length > 0) {
        throw new Error(`Invalid use case categories: ${invalid.join(', ')}`);
      }
      return true;
    }),
];

/**
 * GET /api/templates
 * Get all templates with filtering and pagination
 */
router.get('/', templateLimiter, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('industry_category').optional().isString(),
  query('use_case_category').optional().isString(),
  query('search_term').optional().isLength({ max: 200 }),
  query('sort_by').optional().isIn(['created_at', 'updated_at', 'usage_count', 'title']),
  query('sort_order').optional().isIn(['asc', 'desc']),
  query('is_public').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    const result = await templateService.getTemplates(req.query);

    res.json({
      success: true,
      data: result.templates,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch templates',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/templates/categories
 * Get available template categories
 */
router.get('/categories', templateLimiter, async (req, res) => {
  try {
    const categories = await templateService.getCategories();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Error fetching template categories:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/templates/popular
 * Get popular templates
 */
router.get('/popular', templateLimiter, [
  query('limit').optional().isInt({ min: 1, max: 50 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    const { limit = 10 } = req.query;
    const templates = await templateService.getPopularTemplates(parseInt(limit));

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    logger.error('Error fetching popular templates:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch popular templates',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/templates/search
 * Advanced template search
 */
router.post('/search', templateLimiter, searchValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    const result = await templateService.searchTemplates(req.body);

    res.json({
      success: true,
      data: result.templates,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error searching templates:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to search templates',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/templates/:id
 * Get template by ID
 */
router.get('/:id', templateLimiter, [
  param('id').isUUID().withMessage('Invalid template ID'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    const template = await templateService.getTemplateById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        msg: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error('Error fetching template by ID:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch template',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/templates
 * Create new template
 */
router.post('/', createTemplateLimiter, templateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    // Check if user is authenticated (you'll need to add auth middleware)
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        msg: 'Authentication required'
      });
    }

    const template = await templateService.createTemplate(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: template,
      msg: 'Template created successfully'
    });
  } catch (error) {
    logger.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to create template',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * PUT /api/templates/:id
 * Update template
 */
router.put('/:id', templateLimiter, [
  param('id').isUUID().withMessage('Invalid template ID'),
  ...templateValidation
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        msg: 'Authentication required'
      });
    }

    const template = await templateService.updateTemplate(req.params.id, req.body, req.user.id);

    res.json({
      success: true,
      data: template,
      msg: 'Template updated successfully'
    });
  } catch (error) {
    logger.error('Error updating template:', error);
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        msg: error.message
      });
    }
    res.status(500).json({
      success: false,
      msg: 'Unable to update template',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * DELETE /api/templates/:id
 * Delete template
 */
router.delete('/:id', templateLimiter, [
  param('id').isUUID().withMessage('Invalid template ID'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        msg: 'Authentication required'
      });
    }

    await templateService.deleteTemplate(req.params.id, req.user.id);

    res.json({
      success: true,
      msg: 'Template deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting template:', error);
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        msg: error.message
      });
    }
    res.status(500).json({
      success: false,
      msg: 'Unable to delete template',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/templates/:id/use
 * Increment usage count when template is used
 */
router.post('/:id/use', templateLimiter, [
  param('id').isUUID().withMessage('Invalid template ID'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    await templateService.incrementUsageCount(req.params.id);

    res.json({
      success: true,
      msg: 'Usage count updated'
    });
  } catch (error) {
    logger.error('Error incrementing usage count:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to update usage count',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/templates/:id/analytics
 * Get template performance analytics
 */
router.get('/:id/analytics', templateLimiter, [
  param('id').isUUID().withMessage('Invalid template ID'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    const analytics = await templateService.getTemplateAnalytics(req.params.id);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching template analytics:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch template analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/templates/:id/variations
 * Create template variation
 */
router.post('/:id/variations', createTemplateLimiter, [
  param('id').isUUID().withMessage('Invalid template ID'),
  body('title').optional().isLength({ min: 5, max: 200 }),
  body('description').optional().isLength({ min: 10, max: 1000 }),
  body('content').optional().isLength({ min: 50, max: 10000 }),
  body('is_public').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        msg: 'Authentication required'
      });
    }

    const variation = await templateService.createTemplateVariation(req.params.id, req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: variation,
      msg: 'Template variation created successfully'
    });
  } catch (error) {
    logger.error('Error creating template variation:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to create template variation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/templates/collections
 * Get user's template collections
 */
router.get('/collections', templateLimiter, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        msg: 'Authentication required'
      });
    }

    const collections = await templateService.getUserCollections(req.user.id);

    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    logger.error('Error fetching user collections:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to fetch collections',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/templates/collections
 * Create new template collection
 */
router.post('/collections', createTemplateLimiter, [
  body('name').notEmpty().isLength({ min: 2, max: 100 }).withMessage('Collection name must be between 2 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('is_public').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        msg: 'Authentication required'
      });
    }

    const collection = await templateService.createCollection(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: collection,
      msg: 'Collection created successfully'
    });
  } catch (error) {
    logger.error('Error creating collection:', error);
    res.status(500).json({
      success: false,
      msg: 'Unable to create collection',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/templates/collections/:collectionId/templates/:templateId
 * Add template to collection
 */
router.post('/collections/:collectionId/templates/:templateId', templateLimiter, [
  param('collectionId').isUUID().withMessage('Invalid collection ID'),
  param('templateId').isUUID().withMessage('Invalid template ID'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors: errors.array()
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        msg: 'Authentication required'
      });
    }

    await templateService.addTemplateToCollection(
      req.params.collectionId,
      req.params.templateId,
      req.user.id
    );

    res.json({
      success: true,
      msg: 'Template added to collection successfully'
    });
  } catch (error) {
    logger.error('Error adding template to collection:', error);
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        msg: error.message
      });
    }
    res.status(500).json({
      success: false,
      msg: 'Unable to add template to collection',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;