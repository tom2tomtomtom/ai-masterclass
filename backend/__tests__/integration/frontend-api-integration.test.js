/**
 * Frontend-API Integration Tests
 * 
 * Tests integration between React frontend components and backend API endpoints
 * Validates complete user workflows from frontend perspective
 */

const request = require('supertest');
const { createClient } = require('@supabase/supabase-js');
const app = require('../../index.js');

const TEST_CONFIG = {
  timeout: 20000,
  testUser: {
    email: 'frontend-test@example.com',
    password: 'testPassword123'
  },
  frontendTestData: {
    playgroundSession: {
      prompt: 'Create a marketing strategy for a sustainable fashion brand',
      providers: ['openai', 'anthropic'],
      parameters: {
        temperature: 0.7,
        maxTokens: 300
      }
    },
    templateVariables: {
      product_name: 'EcoFriendly T-Shirt',
      target_audience: 'environmentally conscious millennials',
      key_benefits: 'sustainable materials, ethical production, comfort'
    }
  }
};

describe('Frontend-API Integration Tests', () => {
  let authToken;
  let supabaseClient;
  let testSessionId;
  let testTemplateId;

  beforeAll(async () => {
    // Initialize Supabase client
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Authenticate test user
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

    // Create a test template for frontend testing
    const templateResponse = await request(app)
      .post('/api/templates')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Frontend Test Template',
        description: 'Template for testing frontend integration',
        content: 'Create a {content_type} about {topic} for {audience}',
        industry_category: 'marketing',
        use_case_category: 'content_creation',
        is_public: true
      });

    if (templateResponse.status === 201) {
      testTemplateId = templateResponse.body.template.id;
    }
  }, TEST_CONFIG.timeout);

  afterAll(async () => {
    // Cleanup test template
    if (testTemplateId) {
      await request(app)
        .delete(`/api/templates/${testTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .catch(() => {});
    }

    // Sign out test user
    if (authToken) {
      await supabaseClient.auth.signOut();
    }
  });

  describe('AI Playground Component Integration', () => {
    test('should initialize playground with available providers', async () => {
      // Simulate AIPlayground.js component initialization
      const response = await request(app)
        .get('/api/ai-playground/providers')
        .expect(200);

      expect(response.body).toHaveProperty('providers');
      expect(Array.isArray(response.body.providers)).toBe(true);

      // Verify required provider data for frontend
      response.body.providers.forEach(provider => {
        expect(provider).toHaveProperty('name');
        expect(provider).toHaveProperty('models');
        expect(provider).toHaveProperty('available');
        expect(Array.isArray(provider.models)).toBe(true);
      });
    });

    test('should handle single AI generation workflow', async () => {
      // Simulate user selecting single provider in AIPlayground component
      const generateRequest = {
        prompt: TEST_CONFIG.frontendTestData.playgroundSession.prompt,
        provider: 'openai',
        parameters: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 250,
          systemMessage: 'You are a marketing strategist.'
        }
      };

      const response = await request(app)
        .post('/api/ai-playground/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(generateRequest)
        .expect(200);

      // Verify response format expected by frontend
      expect(response.body).toHaveProperty('provider', 'openai');
      expect(response.body).toHaveProperty('model');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('usage');
      expect(response.body).toHaveProperty('response_time');
      expect(typeof response.body.content).toBe('string');
      expect(response.body.content.length).toBeGreaterThan(0);
    }, TEST_CONFIG.timeout);

    test('should handle multi-provider comparison workflow', async () => {
      // Simulate ResponseComparison.js component workflow
      const compareRequest = TEST_CONFIG.frontendTestData.playgroundSession;

      const response = await request(app)
        .post('/api/ai-playground/compare')
        .set('Authorization', `Bearer ${authToken}`)
        .send(compareRequest)
        .expect(200);

      // Verify response structure for ResponseComparison component
      expect(response.body).toHaveProperty('responses');
      expect(response.body).toHaveProperty('analysis');
      expect(response.body).toHaveProperty('comparison');
      expect(Array.isArray(response.body.responses)).toBe(true);
      expect(response.body.responses.length).toBe(2);

      // Verify each response has required fields for frontend display
      response.body.responses.forEach(resp => {
        expect(resp).toHaveProperty('provider');
        expect(resp).toHaveProperty('content');
        expect(resp).toHaveProperty('response_time');
        expect(resp).toHaveProperty('usage');
      });

      // Verify analysis data for comparison display
      expect(response.body.analysis).toHaveProperty('rankings');
      expect(response.body.comparison).toHaveProperty('fastest_response');
    }, TEST_CONFIG.timeout);

    test('should provide quality scoring data for frontend', async () => {
      // Simulate quality scoring feature in AIPlayground
      const scoreRequest = {
        prompt: 'Explain renewable energy benefits',
        response: 'Renewable energy offers environmental benefits by reducing carbon emissions, economic advantages through job creation, and energy independence by reducing reliance on fossil fuels.',
        provider: 'openai',
        model: 'gpt-4'
      };

      const response = await request(app)
        .post('/api/ai-playground/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send(scoreRequest)
        .expect(200);

      // Verify scoring data structure for frontend charts/displays
      expect(response.body).toHaveProperty('scores');
      expect(response.body.scores).toHaveProperty('individual');
      expect(response.body.scores).toHaveProperty('overall');
      expect(response.body).toHaveProperty('feedback');

      // Verify individual scores are numeric for chart rendering
      const individualScores = response.body.scores.individual;
      Object.values(individualScores).forEach(score => {
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Template Library Component Integration', () => {
    test('should support template library initialization', async () => {
      // Simulate TemplateLibrary.js component loading
      const categoriesResponse = await request(app)
        .get('/api/templates/categories')
        .expect(200);

      expect(categoriesResponse.body).toHaveProperty('industries');
      expect(categoriesResponse.body).toHaveProperty('use_cases');

      // Get initial templates for library display
      const templatesResponse = await request(app)
        .get('/api/templates?limit=12&is_public=true')
        .expect(200);

      expect(templatesResponse.body).toHaveProperty('templates');
      expect(templatesResponse.body).toHaveProperty('pagination');
      expect(Array.isArray(templatesResponse.body.templates)).toBe(true);

      // Verify template data structure for frontend cards
      templatesResponse.body.templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('title');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('industry_category');
        expect(template).toHaveProperty('use_case_category');
        expect(template).toHaveProperty('usage_count');
      });
    });

    test('should handle template search with filters', async () => {
      // Simulate search functionality in TemplateLibrary component
      const searchRequest = {
        query: 'marketing',
        industry_categories: ['marketing'],
        use_case_categories: ['content_creation', 'email_response'],
        limit: 8
      };

      const response = await request(app)
        .post('/api/templates/search')
        .send(searchRequest)
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('filters_applied');
      expect(Array.isArray(response.body.templates)).toBe(true);
      expect(response.body.templates.length).toBeLessThanOrEqual(8);
    });

    test('should support template customization workflow', async () => {
      // Simulate TemplateCustomizer.js component workflow
      
      // Step 1: Get template for customization
      const templateResponse = await request(app)
        .get(`/api/templates/${testTemplateId}`)
        .expect(200);

      expect(templateResponse.body).toHaveProperty('template');
      
      // Step 2: Process template with variables
      const customizationRequest = {
        template_id: testTemplateId,
        variables: TEST_CONFIG.frontendTestData.templateVariables,
        provider: 'openai',
        parameters: {
          model: 'gpt-4',
          temperature: 0.8,
          maxTokens: 400
        }
      };

      const processResponse = await request(app)
        .post('/api/ai-playground/template-generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customizationRequest)
        .expect(200);

      // Verify response structure for template customizer
      expect(processResponse.body).toHaveProperty('response');
      expect(processResponse.body).toHaveProperty('template_used');
      expect(processResponse.body).toHaveProperty('variables_applied');
      expect(processResponse.body.template_used.id).toBe(testTemplateId);
    }, TEST_CONFIG.timeout);

    test('should track template usage from frontend', async () => {
      // Simulate usage tracking when template is used
      const usageData = {
        ai_model_used: 'gpt-4',
        quality_score: 0.82,
        response_time: 2200,
        tokens: 180
      };

      const response = await request(app)
        .post(`/api/templates/${testTemplateId}/use`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(usageData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('usage_tracked', true);
    });
  });

  describe('Progress Tracking Integration', () => {
    test('should initialize progress tracker data', async () => {
      // Simulate ProgressTracker.js component initialization
      const response = await request(app)
        .get('/api/user/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify progress data structure for frontend displays
      expect(response.body).toHaveProperty('user_progress');
      expect(response.body.user_progress).toHaveProperty('templates_used');
      expect(response.body.user_progress).toHaveProperty('ai_interactions');
      expect(response.body.user_progress).toHaveProperty('quality_scores');
    });

    test('should update progress after AI interaction', async () => {
      // Simulate progress update after successful AI generation
      const progressUpdate = {
        activity_type: 'ai_generation',
        template_id: testTemplateId,
        provider_used: 'openai',
        quality_score: 0.87,
        completion_time: 1800
      };

      const response = await request(app)
        .post('/api/user/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('progress_updated', true);
    });

    test('should get user achievements and milestones', async () => {
      const response = await request(app)
        .get('/api/user/achievements')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('achievements');
      expect(response.body).toHaveProperty('next_milestones');
      expect(Array.isArray(response.body.achievements)).toBe(true);
    });
  });

  describe('Community Sharing Integration', () => {
    test('should support community template sharing', async () => {
      // Simulate CommunitySharing.js component functionality
      const shareRequest = {
        template_id: testTemplateId,
        share_type: 'public',
        message: 'Great template for marketing content!'
      };

      const response = await request(app)
        .post('/api/templates/share')
        .set('Authorization', `Bearer ${authToken}`)
        .send(shareRequest)
        .expect(200);

      expect(response.body).toHaveProperty('shared', true);
      expect(response.body).toHaveProperty('share_id');
    });

    test('should get community shared templates', async () => {
      const response = await request(app)
        .get('/api/templates/community?limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('shared_templates');
      expect(Array.isArray(response.body.shared_templates)).toBe(true);

      // Verify shared template data for community display
      response.body.shared_templates.forEach(item => {
        expect(item).toHaveProperty('template');
        expect(item).toHaveProperty('shared_by');
        expect(item).toHaveProperty('share_date');
        expect(item).toHaveProperty('usage_stats');
      });
    });
  });

  describe('Real-time Features Integration', () => {
    test('should handle concurrent user sessions', async () => {
      // Simulate multiple users using the playground simultaneously
      const concurrentRequests = Array(3).fill().map((_, index) =>
        request(app)
          .post('/api/ai-playground/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            prompt: `Test prompt ${index + 1}`,
            provider: 'openai',
            parameters: {
              model: 'gpt-4',
              temperature: 0.7,
              maxTokens: 100
            }
          })
      );

      const responses = await Promise.all(concurrentRequests);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('content');
      });
    }, TEST_CONFIG.timeout);

    test('should handle streaming responses for long generations', async () => {
      // Test endpoint that supports streaming for frontend real-time updates
      const streamRequest = {
        prompt: 'Write a comprehensive business plan for a sustainable technology startup',
        provider: 'openai',
        parameters: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 800,
          stream: true
        }
      };

      const response = await request(app)
        .post('/api/ai-playground/generate-stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send(streamRequest)
        .expect(200);

      // For streaming responses, we expect either full response or streaming metadata
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('streaming_complete');
    }, TEST_CONFIG.timeout);
  });

  describe('Error Handling in Frontend Context', () => {
    test('should provide user-friendly error messages', async () => {
      // Test various error scenarios that frontend needs to handle gracefully
      
      // Invalid template ID
      const response1 = await request(app)
        .get('/api/templates/invalid-id')
        .expect(404);

      expect(response1.body).toHaveProperty('error');
      expect(response1.body).toHaveProperty('user_message');
      expect(response1.body.user_message).toBeTruthy();

      // Rate limiting error
      const rapidRequests = Array(30).fill().map(() =>
        request(app)
          .get('/api/ai-playground/status')
      );

      const responses = await Promise.all(rapidRequests);
      const rateLimitedResponse = responses.find(r => r.status === 429);
      
      if (rateLimitedResponse) {
        expect(rateLimitedResponse.body).toHaveProperty('error');
        expect(rateLimitedResponse.body).toHaveProperty('retry_after');
      }
    });

    test('should handle authentication errors gracefully', async () => {
      const response = await request(app)
        .post('/api/ai-playground/generate')
        .send({
          prompt: 'Test prompt',
          provider: 'openai'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('auth_required', true);
    });

    test('should validate frontend form data', async () => {
      const invalidData = {
        prompt: '', // Empty prompt
        provider: 'invalid-provider',
        parameters: {
          temperature: 2.5, // Invalid range
          maxTokens: -100   // Invalid value
        }
      };

      const response = await request(app)
        .post('/api/ai-playground/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('validation_errors');
      expect(Array.isArray(response.body.validation_errors)).toBe(true);
    });
  });

  describe('Performance Optimization for Frontend', () => {
    test('should return optimized data for frontend rendering', async () => {
      // Test that API responses are optimized for frontend performance
      const response = await request(app)
        .get('/api/templates?limit=20&fields=id,title,description,industry_category,usage_count')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      
      // Verify only requested fields are returned to minimize payload
      response.body.templates.forEach(template => {
        const keys = Object.keys(template);
        expect(keys).toContain('id');
        expect(keys).toContain('title');
        expect(keys).toContain('description');
        // Should not contain heavy fields like full content
        expect(keys).not.toContain('content');
      });
    });

    test('should support pagination for frontend infinite scrolling', async () => {
      const response = await request(app)
        .get('/api/templates?limit=10&page=1&pagination_type=cursor')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('has_more');
      expect(response.body.pagination).toHaveProperty('next_cursor');
    });

    test('should handle caching headers for static data', async () => {
      const response = await request(app)
        .get('/api/templates/categories')
        .expect(200);

      // Verify caching headers are set for static category data
      expect(response.headers).toHaveProperty('cache-control');
      expect(response.body).toHaveProperty('industries');
      expect(response.body).toHaveProperty('use_cases');
    });
  });

  describe('Mobile Responsiveness Support', () => {
    test('should return mobile-optimized data structures', async () => {
      const response = await request(app)
        .get('/api/templates/mobile-optimized?limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      
      // Verify mobile-friendly data structure
      response.body.templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('title');
        expect(template).toHaveProperty('short_description'); // Truncated for mobile
        expect(template).toHaveProperty('category_display'); // Formatted for mobile
      });
    });

    test('should handle touch-friendly interaction data', async () => {
      const response = await request(app)
        .get('/api/templates/popular?mobile=true&limit=8')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body).toHaveProperty('display_config');
      expect(response.body.display_config).toHaveProperty('touch_optimized', true);
    });
  });
});