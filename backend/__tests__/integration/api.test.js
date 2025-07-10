const request = require('supertest');
const express = require('express');
const TestDatabase = require('../helpers/database');
const TestAuth = require('../helpers/auth');

// Create test app
const createTestApp = () => {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  
  // Import and use auth routes
  const authRoutes = require('../../routes/auth');
  app.use('/api/auth', authRoutes);
  
  // Mock courses endpoint for testing
  const db = require('../../db');
  app.get('/api/courses', async (req, res) => {
    try {
      const { status = 'published', level } = req.query;
      let query = 'SELECT * FROM courses WHERE status = $1';
      let params = [status];
      
      if (level) {
        query += ' AND level = $2';
        params.push(level);
      }
      
      const { rows } = await db.query(query, params);
      res.json({
        success: true,
        data: {
          data: rows,
          pagination: {
            total: rows.length,
            page: 1,
            limit: 10
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: 'Server error'
      });
    }
  });
  
  return app;
};

describe('API Integration Tests', () => {
  let testDb;
  let app;
  let testUser;

  beforeAll(async () => {
    testDb = new TestDatabase();
    await testDb.createTestDatabase();
    await testDb.setupSchema();
    app = createTestApp();
  });

  beforeEach(async () => {
    await testDb.clearDatabase();
    await testDb.seedTestData();
    testUser = await TestAuth.createTestUser(testDb);
  });

  afterAll(async () => {
    await testDb.close();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      test('should register a new user successfully', async () => {
        const userData = {
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          first_name: 'New',
          last_name: 'User'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.msg).toBe('User registered successfully');
        expect(response.body.token).toBeDefined();
        expect(response.body.user).toMatchObject({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name
        });
      });

      test('should reject registration with existing email', async () => {
        const userData = {
          email: 'testuser@example.com', // Already exists
          password: 'SecurePass123!',
          first_name: 'Test',
          last_name: 'User'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.msg).toContain('User already exists');
      });

      test('should reject registration with weak password', async () => {
        const userData = {
          email: 'weakpass@example.com',
          password: 'weak',
          first_name: 'Weak',
          last_name: 'Password'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });

      test('should reject registration with invalid email', async () => {
        const userData = {
          email: 'invalid-email',
          password: 'SecurePass123!',
          first_name: 'Invalid',
          last_name: 'Email'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });
    });

    describe('POST /api/auth/login', () => {
      test('should login with valid credentials', async () => {
        const credentials = {
          email: 'testuser@example.com',
          password: 'testpass123'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.msg).toBe('Login successful');
        expect(response.body.token).toBeDefined();
        expect(response.body.user).toMatchObject({
          email: credentials.email,
          role: 'learner'
        });
      });

      test('should reject login with invalid email', async () => {
        const credentials = {
          email: 'nonexistent@example.com',
          password: 'testpass123'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe('Invalid credentials');
      });

      test('should reject login with incorrect password', async () => {
        const credentials = {
          email: 'testuser@example.com',
          password: 'wrongpassword'
        };

        const response = await request(app)
          .post('/api/auth/login')
          .send(credentials)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.msg).toBe('Invalid credentials');
      });

      test('should reject login with missing fields', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@example.com' }) // Missing password
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });
    });
  });

  describe('Courses Endpoints', () => {
    test('should fetch courses successfully', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should filter courses by level', async () => {
      const response = await request(app)
        .get('/api/courses?level=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeInstanceOf(Array);
      
      // All courses should be level 1
      response.body.data.data.forEach(course => {
        expect(course.level).toBe(1);
      });
    });

    test('should filter courses by status', async () => {
      const response = await request(app)
        .get('/api/courses?status=published')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toBeInstanceOf(Array);
      
      // All courses should be published
      response.body.data.data.forEach(course => {
        expect(course.status).toBe('published');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toBeDefined();
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    test('should allow normal request rates', async () => {
      const promises = [];
      
      // Send 5 requests (within normal limits)
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get('/api/courses')
            .expect(200)
        );
      }

      await Promise.all(promises);
    });
  });
});