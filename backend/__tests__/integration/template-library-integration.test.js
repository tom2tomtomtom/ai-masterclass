/**
 * Template Library Integration Tests
 * 
 * Comprehensive integration testing for the Template Library System
 * Tests all template CRUD operations, search functionality, and analytics
 */

const request = require('supertest');
const { createClient } = require('@supabase/supabase-js');
const app = require('../../index.js');

const TEST_CONFIG = {
  timeout: 15000,
  testUser: {
    email: 'template-test@example.com',
    password: 'testPassword123',
    user_id: 'template-test-user-123'
  },
  testTemplates: [
    {
      title: 'Email Marketing Campaign Template',
      description: 'Create compelling email marketing campaigns for product launches',
      content: 'You are an email marketing expert. Create a promotional email for {product_name} targeting {target_audience}. Include: compelling subject line, engaging introduction, key benefits, clear call-to-action.',
      industry_category: 'marketing',
      use_case_category: 'email_response',
      recommended_ai_model: 'gpt-4',
      is_public: true
    },
    {
      title: 'Sales Discovery Call Template',
      description: 'Structure effective discovery calls with potential clients',
      content: 'You are a sales professional. Prepare a discovery call framework for {prospect_company} in the {industry} sector. Include: opening questions, pain point exploration, qualification criteria, next steps.',
      industry_category: 'sales',
      use_case_category: 'communication',
      recommended_ai_model: 'claude-3-sonnet',
      is_public: true
    },
    {
      title: 'Technical Documentation Template',
      description: 'Create comprehensive technical documentation',
      content: 'You are a technical writer. Create documentation for {feature_name} including: overview, implementation details, API endpoints, code examples, troubleshooting guide.',
      industry_category: 'development',
      use_case_category: 'documentation',
      recommended_ai_model: 'gpt-4',
      is_public: false
    }
  ]
};

describe('Template Library Integration Tests', () => {
  let authToken;
  let testTemplateIds = [];
  let testCollectionId;
  let supabaseClient;

  beforeAll(async () => {
    // Initialize Supabase client
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Create test user and get auth token
    const { data: authData } = await supabaseClient.auth.signInWithPassword({
      email: TEST_CONFIG.testUser.email,
      password: TEST_CONFIG.testUser.password
    });

    if (authData?.session?.access_token) {
      authToken = authData.session.access_token;
    } else {
      const { data: signUpData } = await supabaseClient.auth.signUp({
        email: TEST_CONFIG.testUser.email,
        password: TEST_CONFIG.testUser.password
      });
      authToken = signUpData?.session?.access_token;
    }

    // Create test templates
    for (const template of TEST_CONFIG.testTemplates) {
      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(template);
      
      if (response.status === 201) {
        testTemplateIds.push(response.body.template.id);
      }
    }
  }, TEST_CONFIG.timeout);

  afterAll(async () => {
    // Clean up test templates
    for (const templateId of testTemplateIds) {
      await request(app)
        .delete(`/api/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .catch(() => {}); // Ignore errors during cleanup
    }

    // Clean up test collection
    if (testCollectionId) {
      await request(app)
        .delete(`/api/templates/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .catch(() => {});
    }

    // Sign out test user
    if (authToken) {
      await supabaseClient.auth.signOut();
    }
  });

  describe('Template CRUD Operations', () => {
    test('should create a new template', async () => {
      const newTemplate = {
        title: 'Customer Service Response Template',
        description: 'Handle customer complaints professionally',
        content: 'You are a customer service representative. Respond to the following customer complaint: {complaint_text}. Be empathetic, acknowledge the issue, provide a solution, and ensure satisfaction.',
        industry_category: 'customer_service',
        use_case_category: 'email_response',
        recommended_ai_model: 'claude-3-sonnet',
        is_public: true
      };

      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTemplate)
        .expect(201);

      expect(response.body).toHaveProperty('template');
      expect(response.body.template.title).toBe(newTemplate.title);
      expect(response.body.template.industry_category).toBe(newTemplate.industry_category);
      
      // Add to cleanup list
      testTemplateIds.push(response.body.template.id);
    });

    test('should retrieve a template by ID', async () => {
      const templateId = testTemplateIds[0];
      
      const response = await request(app)
        .get(`/api/templates/${templateId}`)
        .expect(200);

      expect(response.body).toHaveProperty('template');
      expect(response.body.template.id).toBe(templateId);
      expect(response.body.template).toHaveProperty('title');
      expect(response.body.template).toHaveProperty('content');
    });

    test('should update an existing template', async () => {
      const templateId = testTemplateIds[0];
      const updateData = {
        title: 'Updated Email Marketing Template',
        description: 'Updated description for better clarity'
      };

      const response = await request(app)
        .put(`/api/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('template');
      expect(response.body.template.title).toBe(updateData.title);
      expect(response.body.template.description).toBe(updateData.description);
    });

    test('should list templates with pagination', async () => {
      const response = await request(app)
        .get('/api/templates?limit=5&page=1')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.templates)).toBe(true);
      expect(response.body.templates.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination).toHaveProperty('current_page', 1);
    });

    test('should filter templates by category', async () => {
      const response = await request(app)
        .get('/api/templates?industry_category=marketing&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      response.body.templates.forEach(template => {
        expect(template.industry_category).toBe('marketing');
      });
    });
  });

  describe('Template Search and Discovery', () => {
    test('should search templates by text query', async () => {
      const searchQuery = {
        query: 'email marketing',
        limit: 10
      };

      const response = await request(app)
        .post('/api/templates/search')
        .send(searchQuery)
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.templates)).toBe(true);
    });

    test('should search with multiple filters', async () => {
      const searchQuery = {
        query: 'sales',
        industry_categories: ['sales', 'marketing'],
        use_case_categories: ['communication', 'email_response'],
        limit: 20
      };

      const response = await request(app)
        .post('/api/templates/search')
        .send(searchQuery)
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body).toHaveProperty('filters_applied');
      
      // Verify filters were applied
      response.body.templates.forEach(template => {
        expect(['sales', 'marketing']).toContain(template.industry_category);
        expect(['communication', 'email_response']).toContain(template.use_case_category);
      });
    });

    test('should get template categories', async () => {
      const response = await request(app)
        .get('/api/templates/categories')
        .expect(200);

      expect(response.body).toHaveProperty('industries');
      expect(response.body).toHaveProperty('use_cases');
      expect(Array.isArray(response.body.industries)).toBe(true);
      expect(Array.isArray(response.body.use_cases)).toBe(true);
      
      // Should include our test categories
      expect(response.body.industries).toContain('marketing');
      expect(response.body.industries).toContain('sales');
      expect(response.body.use_cases).toContain('email_response');
    });

    test('should get popular templates', async () => {
      // First, increment usage count for one of our templates
      const templateId = testTemplateIds[0];
      await request(app)
        .post(`/api/templates/${templateId}/use`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ai_model_used: 'gpt-4',
          quality_score: 0.85,
          response_time: 2000,
          tokens: 150
        })
        .expect(200);

      // Now get popular templates
      const response = await request(app)
        .get('/api/templates/popular?limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
      expect(response.body.templates.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Template Usage Tracking', () => {
    test('should track template usage', async () => {
      const templateId = testTemplateIds[1];
      const usageData = {
        ai_model_used: 'claude-3-sonnet',
        quality_score: 0.88,
        response_time: 2500,
        tokens: 200
      };

      const response = await request(app)
        .post(`/api/templates/${templateId}/use`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(usageData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('usage_tracked', true);
    });

    test('should get template analytics', async () => {
      const templateId = testTemplateIds[0];

      const response = await request(app)
        .get(`/api/templates/${templateId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('template_id', templateId);
      expect(response.body).toHaveProperty('usage_count');
      expect(response.body).toHaveProperty('performance_metrics');
      expect(typeof response.body.usage_count).toBe('number');
    });

    test('should get template performance metrics', async () => {
      const templateId = testTemplateIds[0];

      const response = await request(app)
        .get(`/api/templates/${templateId}/performance`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('template_id', templateId);
      expect(response.body).toHaveProperty('metrics');
      expect(response.body.metrics).toHaveProperty('usage_stats');
    });
  });

  describe('Template Collections', () => {
    test('should create a template collection', async () => {
      const collectionData = {
        name: 'Marketing Templates Collection',
        description: 'A curated collection of marketing-focused templates',
        is_public: true
      };

      const response = await request(app)
        .post('/api/templates/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(collectionData)
        .expect(201);

      expect(response.body).toHaveProperty('collection');
      expect(response.body.collection.name).toBe(collectionData.name);
      
      testCollectionId = response.body.collection.id;
    });

    test('should add template to collection', async () => {
      if (!testCollectionId) {
        throw new Error('Collection not created');
      }

      const templateId = testTemplateIds[0];

      const response = await request(app)
        .post(`/api/templates/collections/${testCollectionId}/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ order_index: 1 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    test('should get user collections', async () => {
      const response = await request(app)
        .get('/api/templates/collections')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('collections');
      expect(Array.isArray(response.body.collections)).toBe(true);
    });

    test('should get collection with templates', async () => {
      if (!testCollectionId) {
        throw new Error('Collection not created');
      }

      const response = await request(app)
        .get(`/api/templates/collections/${testCollectionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('collection');
      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
    });
  });

  describe('Template Favorites', () => {
    test('should add template to favorites', async () => {
      const templateId = testTemplateIds[1];

      const response = await request(app)
        .post(`/api/templates/${templateId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('favorited', true);
    });

    test('should get user favorite templates', async () => {
      const response = await request(app)
        .get('/api/templates/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('favorites');
      expect(Array.isArray(response.body.favorites)).toBe(true);
    });

    test('should remove template from favorites', async () => {
      const templateId = testTemplateIds[1];

      const response = await request(app)
        .delete(`/api/templates/${templateId}/favorite`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('unfavorited', true);
    });
  });

  describe('Template Variations', () => {
    test('should create template variation', async () => {
      const templateId = testTemplateIds[0];
      const variationData = {
        title: 'Variation: Short Email Marketing Template',
        description: 'A shorter version of the email marketing template',
        content: 'Create a brief promotional email for {product_name}. Keep it under 100 words.',
        notes: 'Optimized for mobile reading'
      };

      const response = await request(app)
        .post(`/api/templates/${templateId}/variations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(variationData)
        .expect(201);

      expect(response.body).toHaveProperty('variation');
      expect(response.body.variation.title).toBe(variationData.title);
      expect(response.body.variation).toHaveProperty('parent_template_id', templateId);
      
      // Add to cleanup
      testTemplateIds.push(response.body.variation.id);
    });

    test('should get template variations', async () => {
      const templateId = testTemplateIds[0];

      const response = await request(app)
        .get(`/api/templates/${templateId}/variations`)
        .expect(200);

      expect(response.body).toHaveProperty('variations');
      expect(Array.isArray(response.body.variations)).toBe(true);
    });
  });

  describe('Validation and Error Handling', () => {
    test('should validate required fields when creating template', async () => {
      const incompleteTemplate = {
        title: 'Incomplete Template'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteTemplate)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('validation_errors');
    });

    test('should handle non-existent template ID', async () => {
      const response = await request(app)
        .get('/api/templates/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should prevent unauthorized template modification', async () => {
      const templateId = testTemplateIds[0];
      const updateData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/templates/${templateId}`)
        // No authorization header
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should validate search parameters', async () => {
      const invalidSearch = {
        limit: -1, // Invalid limit
        page: 0    // Invalid page
      };

      const response = await request(app)
        .post('/api/templates/search')
        .send(invalidSearch)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle concurrent template requests', async () => {
      const concurrentRequests = Array(5).fill().map(() =>
        request(app)
          .get('/api/templates?limit=10')
      );

      const responses = await Promise.all(concurrentRequests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('templates');
      });
    });

    test('should efficiently paginate large result sets', async () => {
      const response = await request(app)
        .get('/api/templates?limit=50&page=1')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.templates.length).toBeLessThanOrEqual(50);
    });

    test('should handle search queries efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/templates/search')
        .send({
          query: 'marketing email sales',
          industry_categories: ['marketing', 'sales'],
          limit: 20
        })
        .expect(200);

      const endTime = Date.now();
      
      expect(response.body).toHaveProperty('templates');
      expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });

  describe('Template Recommendations', () => {
    test('should get personalized template recommendations', async () => {
      const response = await request(app)
        .get('/api/templates/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 5 })
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
      expect(response.body.recommendations.length).toBeLessThanOrEqual(5);
    });

    test('should get similar templates', async () => {
      const templateId = testTemplateIds[0];

      const response = await request(app)
        .get(`/api/templates/${templateId}/similar`)
        .query({ limit: 3 })
        .expect(200);

      expect(response.body).toHaveProperty('similar_templates');
      expect(Array.isArray(response.body.similar_templates)).toBe(true);
      expect(response.body.similar_templates.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Template Export and Import', () => {
    test('should export template data', async () => {
      const templateId = testTemplateIds[0];

      const response = await request(app)
        .get(`/api/templates/${templateId}/export`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('template');
      expect(response.body).toHaveProperty('export_format', 'json');
      expect(response.body.template).toHaveProperty('id', templateId);
    });

    test('should validate template import format', async () => {
      const invalidImport = {
        invalid_format: true
      };

      const response = await request(app)
        .post('/api/templates/import')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidImport)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});