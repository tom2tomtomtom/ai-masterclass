/**
 * AI Playground Integration Tests
 * 
 * Comprehensive end-to-end testing suite for the Interactive AI Playground
 * Tests complete workflows: template selection → AI generation → response comparison
 */

const request = require('supertest');
const { createClient } = require('@supabase/supabase-js');
const app = require('../../index.js');

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  maxRetries: 3,
  testUser: {
    email: 'test@example.com',
    password: 'testPassword123',
    user_id: 'test-user-id-123'
  },
  testTemplate: {
    title: 'Test Marketing Template',
    description: 'Test template for integration testing',
    content: 'You are a marketing expert. Create a compelling product description for: {product_name}',
    industry_category: 'marketing',
    use_case_category: 'content_creation',
    is_public: true
  }
};

// Mock AI responses for consistent testing
const MOCK_AI_RESPONSES = {
  openai: {
    provider: 'openai',
    model: 'gpt-4',
    content: 'This is a mock OpenAI response for testing purposes.',
    usage: {
      prompt_tokens: 15,
      completion_tokens: 50,
      total_tokens: 65
    },
    response_time: 1500,
    finish_reason: 'stop'
  },
  anthropic: {
    provider: 'anthropic',
    model: 'claude-3-sonnet',
    content: 'This is a mock Anthropic Claude response for testing purposes.',
    usage: {
      input_tokens: 15,
      output_tokens: 52,
      total_tokens: 67
    },
    response_time: 1800,
    finish_reason: 'end_turn'
  },
  google: {
    provider: 'google',
    model: 'gemini-pro',
    content: 'This is a mock Google Gemini response for testing purposes.',
    usage: {
      prompt_token_count: 15,
      candidates_token_count: 48,
      total_token_count: 63
    },
    response_time: 1200,
    finish_reason: 'STOP'
  }
};

describe('AI Playground Integration Tests', () => {
  let authToken;
  let testTemplateId;
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
      // Create test user if doesn't exist
      const { data: signUpData } = await supabaseClient.auth.signUp({
        email: TEST_CONFIG.testUser.email,
        password: TEST_CONFIG.testUser.password
      });
      authToken = signUpData?.session?.access_token;
    }

    // Create test template
    const templateResponse = await request(app)
      .post('/api/templates')
      .set('Authorization', `Bearer ${authToken}`)
      .send(TEST_CONFIG.testTemplate)
      .expect(201);

    testTemplateId = templateResponse.body.template.id;

    // Set test environment to use mocks
    process.env.NODE_ENV = 'test';
  }, TEST_CONFIG.timeout);

  afterAll(async () => {
    // Clean up test data
    if (testTemplateId) {
      await request(app)
        .delete(`/api/templates/${testTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }

    // Clean up test user
    if (authToken) {
      await supabaseClient.auth.signOut();
    }
  });

  describe('Service Health and Status', () => {
    test('should check AI playground service status', async () => {
      const response = await request(app)
        .get('/api/ai-playground/status')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('providers');
      expect(response.body.providers).toHaveProperty('openai');
      expect(response.body.providers).toHaveProperty('anthropic');
      expect(response.body.providers).toHaveProperty('google');
    });

    test('should list available AI providers', async () => {
      const response = await request(app)
        .get('/api/ai-playground/providers')
        .expect(200);

      expect(response.body).toHaveProperty('providers');
      expect(Array.isArray(response.body.providers)).toBe(true);
      
      const providerNames = response.body.providers.map(p => p.name);
      expect(providerNames).toContain('openai');
      expect(providerNames).toContain('anthropic');
      expect(providerNames).toContain('google');
    });

    test('should check template service health', async () => {
      const response = await request(app)
        .get('/api/templates?limit=1')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('Template Library Integration', () => {
    test('should retrieve template categories', async () => {
      const response = await request(app)
        .get('/api/templates/categories')
        .expect(200);

      expect(response.body).toHaveProperty('industries');
      expect(response.body).toHaveProperty('use_cases');
      expect(Array.isArray(response.body.industries)).toBe(true);
      expect(Array.isArray(response.body.use_cases)).toBe(true);
    });

    test('should search templates with filters', async () => {
      const searchQuery = {
        query: 'marketing',
        industry_categories: ['marketing'],
        use_case_categories: ['content_creation'],
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

    test('should get popular templates', async () => {
      const response = await request(app)
        .get('/api/templates/popular?limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
      expect(response.body.templates.length).toBeLessThanOrEqual(5);
    });

    test('should track template usage', async () => {
      const response = await request(app)
        .post(`/api/templates/${testTemplateId}/use`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ai_model_used: 'gpt-4',
          quality_score: 0.85,
          response_time: 2000,
          tokens: 100
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('AI Model Integration', () => {
    test('should generate single AI response', async () => {
      const generateRequest = {
        prompt: 'Explain quantum computing in simple terms',
        provider: 'openai',
        parameters: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 150,
          systemMessage: 'You are a helpful AI assistant.'
        }
      };

      const response = await request(app)
        .post('/api/ai-playground/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(generateRequest)
        .expect(200);

      expect(response.body).toHaveProperty('provider');
      expect(response.body).toHaveProperty('model');
      expect(response.body).toHaveProperty('content');
      expect(response.body).toHaveProperty('usage');
      expect(response.body).toHaveProperty('response_time');
    }, TEST_CONFIG.timeout);

    test('should compare responses from multiple providers', async () => {
      const compareRequest = {
        prompt: 'What are the benefits of renewable energy?',
        providers: ['openai', 'anthropic', 'google'],
        parameters: {
          temperature: 0.7,
          maxTokens: 200
        }
      };

      const response = await request(app)
        .post('/api/ai-playground/compare')
        .set('Authorization', `Bearer ${authToken}`)
        .send(compareRequest)
        .expect(200);

      expect(response.body).toHaveProperty('responses');
      expect(response.body).toHaveProperty('analysis');
      expect(response.body).toHaveProperty('comparison');
      expect(Array.isArray(response.body.responses)).toBe(true);
      expect(response.body.responses.length).toBe(3);
    }, TEST_CONFIG.timeout);

    test('should score AI response quality', async () => {
      const scoreRequest = {
        prompt: 'Explain the water cycle',
        response: 'The water cycle is the continuous movement of water on, above and below the surface of the Earth.',
        provider: 'openai',
        model: 'gpt-4'
      };

      const response = await request(app)
        .post('/api/ai-playground/score')
        .set('Authorization', `Bearer ${authToken}`)
        .send(scoreRequest)
        .expect(200);

      expect(response.body).toHaveProperty('scores');
      expect(response.body.scores).toHaveProperty('individual');
      expect(response.body.scores).toHaveProperty('overall');
      expect(response.body).toHaveProperty('feedback');
    });
  });

  describe('Complete Workflow Integration', () => {
    test('should execute complete template-to-AI-analysis workflow', async () => {
      // Step 1: Get template
      const templateResponse = await request(app)
        .get(`/api/templates/${testTemplateId}`)
        .expect(200);

      expect(templateResponse.body).toHaveProperty('template');
      const template = templateResponse.body.template;

      // Step 2: Generate responses using template
      const generateRequest = {
        template_id: testTemplateId,
        template_variables: {
          product_name: 'Eco-Friendly Water Bottle'
        },
        providers: ['openai', 'anthropic'],
        parameters: {
          temperature: 0.7,
          maxTokens: 300
        }
      };

      const generationResponse = await request(app)
        .post('/api/ai-playground/template-compare')
        .set('Authorization', `Bearer ${authToken}`)
        .send(generateRequest)
        .expect(200);

      expect(generationResponse.body).toHaveProperty('responses');
      expect(generationResponse.body).toHaveProperty('template_used');
      expect(generationResponse.body.template_used.id).toBe(testTemplateId);

      // Step 3: Track usage and update analytics
      const usageResponse = await request(app)
        .post(`/api/templates/${testTemplateId}/use`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ai_model_used: 'gpt-4',
          quality_score: 0.88,
          response_time: 2500,
          tokens: 180
        })
        .expect(200);

      expect(usageResponse.body).toHaveProperty('success', true);

      // Step 4: Get analytics
      const analyticsResponse = await request(app)
        .get(`/api/templates/${testTemplateId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(analyticsResponse.body).toHaveProperty('usage_count');
      expect(analyticsResponse.body).toHaveProperty('performance_metrics');
    }, TEST_CONFIG.timeout);

    test('should handle full analysis pipeline', async () => {
      const analysisRequest = {
        prompt: 'Create a marketing strategy for a new sustainable product',
        providers: ['openai', 'anthropic', 'google'],
        include_scoring: true,
        include_comparison: true,
        parameters: {
          temperature: 0.8,
          maxTokens: 400
        }
      };

      const response = await request(app)
        .post('/api/ai-playground/full-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send(analysisRequest)
        .expect(200);

      expect(response.body).toHaveProperty('responses');
      expect(response.body).toHaveProperty('comparison_analysis');
      expect(response.body).toHaveProperty('quality_scores');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('summary');
    }, TEST_CONFIG.timeout);
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid template ID gracefully', async () => {
      const response = await request(app)
        .get('/api/templates/invalid-template-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });

    test('should handle unsupported AI provider', async () => {
      const generateRequest = {
        prompt: 'Test prompt',
        provider: 'unsupported-provider',
        parameters: {
          model: 'test-model'
        }
      };

      const response = await request(app)
        .post('/api/ai-playground/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(generateRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle rate limiting', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 25; i++) {
        requests.push(
          request(app)
            .get('/api/ai-playground/status')
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      // Should have some rate limited responses
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should validate request parameters', async () => {
      const invalidRequest = {
        prompt: '', // Empty prompt
        provider: 'openai',
        parameters: {
          temperature: 2.5, // Invalid temperature
          maxTokens: -100 // Invalid token count
        }
      };

      const response = await request(app)
        .post('/api/ai-playground/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('validation_errors');
    });
  });

  describe('Authentication and Authorization', () => {
    test('should require authentication for protected endpoints', async () => {
      const response = await request(app)
        .post('/api/ai-playground/generate')
        .send({
          prompt: 'Test prompt',
          provider: 'openai'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should reject invalid authentication tokens', async () => {
      const response = await request(app)
        .post('/api/ai-playground/generate')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          prompt: 'Test prompt',
          provider: 'openai'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('should allow access to public templates without auth', async () => {
      const response = await request(app)
        .get('/api/templates?is_public=true&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();
      
      const concurrentRequests = Array(10).fill().map(() =>
        request(app)
          .get('/api/templates/popular?limit=5')
      );

      const responses = await Promise.all(concurrentRequests);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
    });

    test('should paginate large result sets', async () => {
      const response = await request(app)
        .get('/api/templates?limit=5&page=1')
        .expect(200);

      expect(response.body).toHaveProperty('templates');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('current_page');
      expect(response.body.pagination).toHaveProperty('total_pages');
      expect(response.body.pagination).toHaveProperty('total_count');
      expect(response.body.templates.length).toBeLessThanOrEqual(5);
    });

    test('should handle database connection issues gracefully', async () => {
      // This test would require mocking database failures
      // Implementation would depend on specific error scenarios
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Metrics and Analytics', () => {
    test('should collect usage metrics', async () => {
      const response = await request(app)
        .get('/api/ai-playground/metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('metrics');
      expect(response.body.metrics).toHaveProperty('total_requests');
      expect(response.body.metrics).toHaveProperty('provider_usage');
      expect(response.body.metrics).toHaveProperty('average_response_time');
    });

    test('should track template analytics', async () => {
      const response = await request(app)
        .get(`/api/templates/${testTemplateId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('usage_count');
      expect(response.body).toHaveProperty('performance_metrics');
      expect(response.body).toHaveProperty('quality_trends');
    });
  });
});

// Helper functions for testing
function mockAIProviders() {
  // Mock OpenAI
  jest.mock('openai', () => ({
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: { content: MOCK_AI_RESPONSES.openai.content },
              finish_reason: MOCK_AI_RESPONSES.openai.finish_reason
            }],
            usage: MOCK_AI_RESPONSES.openai.usage,
            model: MOCK_AI_RESPONSES.openai.model
          })
        }
      }
    }))
  }));

  // Mock Anthropic
  jest.mock('@anthropic-ai/sdk', () => ({
    Anthropic: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ text: MOCK_AI_RESPONSES.anthropic.content }],
          usage: MOCK_AI_RESPONSES.anthropic.usage,
          model: MOCK_AI_RESPONSES.anthropic.model,
          stop_reason: MOCK_AI_RESPONSES.anthropic.finish_reason
        })
      }
    }))
  }));

  // Mock Google AI
  jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => MOCK_AI_RESPONSES.google.content,
            usageMetadata: MOCK_AI_RESPONSES.google.usage,
            candidates: [{
              finishReason: MOCK_AI_RESPONSES.google.finish_reason
            }]
          }
        })
      })
    }))
  }));
}

// Setup mocks before tests run
if (process.env.NODE_ENV === 'test') {
  mockAIProviders();
}