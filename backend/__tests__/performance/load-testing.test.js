/**
 * Load Testing and Performance Tests
 * 
 * Tests system performance under various load conditions
 * Validates response times, throughput, and resource utilization
 */

const request = require('supertest');
const { performance } = require('perf_hooks');
const app = require('../../index.js');

const PERFORMANCE_CONFIG = {
  timeout: 60000,
  thresholds: {
    responseTime: {
      fast: 200,      // < 200ms is fast
      acceptable: 1000, // < 1s is acceptable
      slow: 3000      // > 3s is too slow
    },
    throughput: {
      minRequestsPerSecond: 10,
      targetRequestsPerSecond: 50
    },
    concurrency: {
      light: 5,
      moderate: 15,
      heavy: 30
    }
  },
  testDuration: {
    short: 10000,    // 10 seconds
    medium: 30000,   // 30 seconds
    long: 60000      // 60 seconds
  }
};

describe('Performance and Load Testing', () => {
  let authToken;
  let testTemplateId;

  beforeAll(async () => {
    // Set up test authentication
    const { createClient } = require('@supabase/supabase-js');
    const supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: authData } = await supabaseClient.auth.signInWithPassword({
      email: 'perf-test@example.com',
      password: 'testPassword123'
    });

    authToken = authData?.session?.access_token;

    // Create test template for performance testing
    const templateResponse = await request(app)
      .post('/api/templates')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Performance Test Template',
        description: 'Template for load testing',
        content: 'You are a {role}. Create a {output_type} about {topic}.',
        industry_category: 'marketing',
        use_case_category: 'content_creation',
        is_public: true
      });

    if (templateResponse.status === 201) {
      testTemplateId = templateResponse.body.template.id;
    }
  }, 30000);

  describe('Response Time Performance', () => {
    test('should handle template listing within acceptable time', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/templates?limit=20')
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveProperty('templates');
      expect(responseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.acceptable);
      
      console.log(`Template listing response time: ${responseTime.toFixed(2)}ms`);
    });

    test('should handle template search within acceptable time', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .post('/api/templates/search')
        .send({
          query: 'marketing email sales',
          industry_categories: ['marketing', 'sales'],
          limit: 15
        })
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveProperty('templates');
      expect(responseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.acceptable);
      
      console.log(`Template search response time: ${responseTime.toFixed(2)}ms`);
    });

    test('should handle AI provider status check quickly', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .get('/api/ai-playground/status')
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveProperty('status');
      expect(responseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.fast);
      
      console.log(`AI status check response time: ${responseTime.toFixed(2)}ms`);
    });
  });

  describe('Concurrent Request Handling', () => {
    test('should handle light concurrent load', async () => {
      const concurrentRequests = PERFORMANCE_CONFIG.concurrency.light;
      const startTime = performance.now();
      
      const requests = Array(concurrentRequests).fill().map(() =>
        request(app)
          .get('/api/templates?limit=10')
      );

      const responses = await Promise.all(requests);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / concurrentRequests;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('templates');
      });

      expect(avgResponseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.acceptable);
      
      console.log(`Light load (${concurrentRequests} requests): ${totalTime.toFixed(2)}ms total, ${avgResponseTime.toFixed(2)}ms average`);
    });

    test('should handle moderate concurrent load', async () => {
      const concurrentRequests = PERFORMANCE_CONFIG.concurrency.moderate;
      const startTime = performance.now();
      
      const requests = Array(concurrentRequests).fill().map((_, index) => {
        // Mix different types of requests
        if (index % 3 === 0) {
          return request(app).get('/api/templates?limit=5');
        } else if (index % 3 === 1) {
          return request(app).get('/api/ai-playground/providers');
        } else {
          return request(app).post('/api/templates/search').send({ query: 'test', limit: 5 });
        }
      });

      const responses = await Promise.all(requests);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgResponseTime = totalTime / concurrentRequests;

      // Most requests should succeed (allow some failures under heavy load)
      const successfulResponses = responses.filter(r => r.status < 400);
      const successRate = successfulResponses.length / responses.length;
      
      expect(successRate).toBeGreaterThan(0.9); // 90% success rate minimum
      expect(avgResponseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.slow);
      
      console.log(`Moderate load (${concurrentRequests} requests): ${totalTime.toFixed(2)}ms total, ${avgResponseTime.toFixed(2)}ms average, ${(successRate * 100).toFixed(1)}% success rate`);
    });

    test('should handle heavy concurrent load gracefully', async () => {
      const concurrentRequests = PERFORMANCE_CONFIG.concurrency.heavy;
      const startTime = performance.now();
      
      const requests = Array(concurrentRequests).fill().map(() =>
        request(app)
          .get('/api/templates/popular?limit=3')
          .timeout(10000) // 10 second timeout
      );

      const responses = await Promise.allSettled(requests);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      const fulfilledResponses = responses.filter(r => r.status === 'fulfilled');
      const successfulResponses = fulfilledResponses.filter(r => r.value.status < 400);
      const successRate = successfulResponses.length / responses.length;

      // Under heavy load, we expect some failures but system should remain stable
      expect(successRate).toBeGreaterThan(0.6); // 60% success rate minimum under heavy load
      
      console.log(`Heavy load (${concurrentRequests} requests): ${totalTime.toFixed(2)}ms total, ${(successRate * 100).toFixed(1)}% success rate`);
    });
  });

  describe('Database Performance', () => {
    test('should handle complex queries efficiently', async () => {
      const startTime = performance.now();
      
      const response = await request(app)
        .post('/api/templates/search')
        .send({
          query: 'marketing strategy customer engagement',
          industry_categories: ['marketing', 'sales', 'consulting'],
          use_case_categories: ['strategy', 'content_creation', 'analysis'],
          sort_by: 'usage_count',
          sort_order: 'desc',
          limit: 25
        })
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveProperty('templates');
      expect(response.body).toHaveProperty('total');
      expect(responseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.acceptable);
      
      console.log(`Complex search query response time: ${responseTime.toFixed(2)}ms`);
    });

    test('should handle analytics queries efficiently', async () => {
      if (!testTemplateId) return;

      const startTime = performance.now();
      
      const response = await request(app)
        .get(`/api/templates/${testTemplateId}/analytics`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveProperty('usage_count');
      expect(response.body).toHaveProperty('performance_metrics');
      expect(responseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.acceptable);
      
      console.log(`Analytics query response time: ${responseTime.toFixed(2)}ms`);
    });

    test('should handle pagination efficiently', async () => {
      const pageSize = 50;
      const pages = 5;
      const responseTimes = [];

      for (let page = 1; page <= pages; page++) {
        const startTime = performance.now();
        
        const response = await request(app)
          .get(`/api/templates?limit=${pageSize}&page=${page}`)
          .expect(200);

        const endTime = performance.now();
        const responseTime = endTime - startTime;
        responseTimes.push(responseTime);

        expect(response.body).toHaveProperty('templates');
        expect(response.body).toHaveProperty('pagination');
        expect(response.body.templates.length).toBeLessThanOrEqual(pageSize);
      }

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);

      expect(avgResponseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.acceptable);
      expect(maxResponseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.slow);
      
      console.log(`Pagination performance - Average: ${avgResponseTime.toFixed(2)}ms, Max: ${maxResponseTime.toFixed(2)}ms`);
    });
  });

  describe('Memory and Resource Usage', () => {
    test('should handle memory-intensive operations', async () => {
      const initialMemory = process.memoryUsage();
      
      // Perform memory-intensive operations
      const largeRequests = Array(20).fill().map(() =>
        request(app)
          .post('/api/templates/search')
          .send({
            query: 'comprehensive detailed analysis strategy marketing sales customer',
            industry_categories: ['marketing', 'sales', 'consulting', 'analytics'],
            use_case_categories: ['strategy', 'analysis', 'content_creation', 'communication'],
            limit: 100
          })
      );

      const responses = await Promise.all(largeRequests);
      const finalMemory = process.memoryUsage();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Memory usage should not grow excessively
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);
      
      console.log(`Memory growth: ${memoryGrowthMB.toFixed(2)}MB`);
      expect(memoryGrowthMB).toBeLessThan(100); // Should not grow more than 100MB
    });

    test('should handle rapid sequential requests', async () => {
      const requestCount = 50;
      const requests = [];
      const responseTimes = [];

      for (let i = 0; i < requestCount; i++) {
        const startTime = performance.now();
        
        const response = await request(app)
          .get('/api/templates/categories')
          .expect(200);

        const endTime = performance.now();
        responseTimes.push(endTime - startTime);

        expect(response.body).toHaveProperty('industries');
      }

      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(requestCount * 0.95)];

      expect(avgResponseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.fast);
      expect(p95ResponseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.acceptable);
      
      console.log(`Sequential requests - Average: ${avgResponseTime.toFixed(2)}ms, P95: ${p95ResponseTime.toFixed(2)}ms`);
    });
  });

  describe('Rate Limiting Performance', () => {
    test('should handle rate limiting gracefully', async () => {
      const rapidRequests = Array(25).fill().map(() =>
        request(app)
          .get('/api/ai-playground/status')
      );

      const responses = await Promise.all(rapidRequests);
      const successful = responses.filter(r => r.status === 200);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(successful.length + rateLimited.length).toBe(25);
      
      if (rateLimited.length > 0) {
        // Verify rate limit response includes proper headers
        rateLimited.forEach(response => {
          expect(response.headers).toHaveProperty('x-ratelimit-limit');
          expect(response.headers).toHaveProperty('x-ratelimit-remaining');
        });
      }

      console.log(`Rate limiting test - Successful: ${successful.length}, Rate limited: ${rateLimited.length}`);
    });

    test('should recover from rate limiting', async () => {
      // Trigger rate limiting
      const rapidRequests = Array(30).fill().map(() =>
        request(app).get('/api/ai-playground/providers')
      );

      await Promise.all(rapidRequests);

      // Wait for rate limit reset
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Should be able to make requests again
      const response = await request(app)
        .get('/api/ai-playground/providers')
        .expect(200);

      expect(response.body).toHaveProperty('providers');
    });
  });

  describe('Stress Testing', () => {
    test('should maintain stability under sustained load', async () => {
      const testDuration = PERFORMANCE_CONFIG.testDuration.short;
      const requestInterval = 100; // 100ms between requests
      const expectedRequests = Math.floor(testDuration / requestInterval);
      
      const results = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        responseTimes: []
      };

      const endTime = Date.now() + testDuration;
      
      while (Date.now() < endTime) {
        const startTime = performance.now();
        
        try {
          const response = await request(app)
            .get('/api/templates/popular?limit=5')
            .timeout(5000);

          const responseTime = performance.now() - startTime;
          results.responseTimes.push(responseTime);
          results.totalRequests++;
          
          if (response.status === 200) {
            results.successfulRequests++;
          } else {
            results.failedRequests++;
          }
        } catch (error) {
          results.totalRequests++;
          results.failedRequests++;
        }

        await new Promise(resolve => setTimeout(resolve, requestInterval));
      }

      const successRate = results.successfulRequests / results.totalRequests;
      const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;

      expect(successRate).toBeGreaterThan(0.85); // 85% success rate under sustained load
      expect(avgResponseTime).toBeLessThan(PERFORMANCE_CONFIG.thresholds.responseTime.slow);

      console.log(`Stress test results:
        - Total requests: ${results.totalRequests}
        - Success rate: ${(successRate * 100).toFixed(1)}%
        - Average response time: ${avgResponseTime.toFixed(2)}ms
        - Failed requests: ${results.failedRequests}`);
    }, PERFORMANCE_CONFIG.testDuration.short + 10000);
  });

  describe('Performance Regression Detection', () => {
    test('should maintain baseline performance for critical endpoints', async () => {
      const criticalEndpoints = [
        { method: 'GET', path: '/api/templates?limit=10', expectedMaxTime: 500 },
        { method: 'GET', path: '/api/ai-playground/status', expectedMaxTime: 200 },
        { method: 'GET', path: '/api/templates/categories', expectedMaxTime: 300 },
        { method: 'POST', path: '/api/templates/search', body: { query: 'test', limit: 5 }, expectedMaxTime: 800 }
      ];

      for (const endpoint of criticalEndpoints) {
        const measurements = [];
        const iterations = 5;

        for (let i = 0; i < iterations; i++) {
          const startTime = performance.now();
          
          let response;
          if (endpoint.method === 'GET') {
            response = await request(app).get(endpoint.path);
          } else {
            response = await request(app).post(endpoint.path).send(endpoint.body || {});
          }

          const endTime = performance.now();
          const responseTime = endTime - startTime;
          measurements.push(responseTime);

          expect(response.status).toBeLessThan(400);
        }

        const avgResponseTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
        const maxResponseTime = Math.max(...measurements);

        expect(avgResponseTime).toBeLessThan(endpoint.expectedMaxTime);
        
        console.log(`${endpoint.method} ${endpoint.path} - Average: ${avgResponseTime.toFixed(2)}ms, Max: ${maxResponseTime.toFixed(2)}ms, Baseline: ${endpoint.expectedMaxTime}ms`);
      }
    });
  });

  afterAll(async () => {
    // Cleanup test template
    if (testTemplateId && authToken) {
      await request(app)
        .delete(`/api/templates/${testTemplateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .catch(() => {});
    }
  });
});