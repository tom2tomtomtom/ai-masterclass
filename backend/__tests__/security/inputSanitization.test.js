const request = require('supertest');
const express = require('express');
const { xssSanitize, noSqlSanitize, validateContentType, requestSizeLimit } = require('../../middleware/security/inputSanitization');

describe('Input Sanitization Security Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(noSqlSanitize);
    app.use(xssSanitize);
    app.use(validateContentType);
    app.use(requestSizeLimit);
    
    app.post('/test', (req, res) => {
      res.json({ success: true, data: req.body });
    });
  });

  describe('XSS Protection', () => {
    test('should sanitize script tags', async () => {
      const maliciousPayload = {
        name: '<script>alert("xss")</script>John',
        comment: 'Hello <script src="evil.js"></script>world'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .expect(200);

      expect(response.body.data.name).not.toContain('<script>');
      expect(response.body.data.comment).not.toContain('<script>');
    });

    test('should sanitize event handlers', async () => {
      const maliciousPayload = {
        title: '<img src="x" onerror="alert(1)">',
        description: '<div onclick="evil()">Click me</div>'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .expect(200);

      expect(response.body.data.title).not.toContain('onerror=');
      expect(response.body.data.description).not.toContain('onclick=');
    });

    test('should allow safe HTML', async () => {
      const safePayload = {
        content: '<p>This is <strong>safe</strong> HTML</p>',
        code: '<code class="javascript">console.log("hello");</code>'
      };

      const response = await request(app)
        .post('/test')
        .send(safePayload)
        .expect(200);

      expect(response.body.data.content).toContain('<p>');
      expect(response.body.data.content).toContain('<strong>');
      expect(response.body.data.code).toContain('<code');
    });
  });

  describe('NoSQL Injection Protection', () => {
    test('should sanitize MongoDB operators', async () => {
      const maliciousPayload = {
        email: { $ne: null },
        password: { $regex: '.*' },
        $where: 'this.password.length > 0'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .expect(200);

      expect(response.body.data.email).toBe('_ne_');
      expect(response.body.data.password).toBe('_regex_');
      expect(response.body.data._where).toBe('this.password.length > 0');
    });

    test('should sanitize nested objects', async () => {
      const maliciousPayload = {
        user: {
          profile: {
            $gt: '',
            settings: { $in: ['admin'] }
          }
        }
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .expect(200);

      expect(response.body.data.user.profile._gt_).toBeDefined();
      expect(response.body.data.user.profile.settings._in_).toBeDefined();
    });
  });

  describe('Content Type Validation', () => {
    test('should reject requests without content-type', async () => {
      await request(app)
        .post('/test')
        .set('Content-Type', '')
        .send({ test: 'data' })
        .expect(400);
    });

    test('should reject unsupported content types', async () => {
      await request(app)
        .post('/test')
        .set('Content-Type', 'text/xml')
        .send('<xml>test</xml>')
        .expect(415);
    });

    test('should accept JSON content type', async () => {
      await request(app)
        .post('/test')
        .set('Content-Type', 'application/json')
        .send({ test: 'data' })
        .expect(200);
    });
  });

  describe('Request Size Limiting', () => {
    test('should reject oversized requests', async () => {
      // Create a large payload (>10MB)
      const largePayload = {
        data: 'x'.repeat(11 * 1024 * 1024) // 11MB
      };

      await request(app)
        .post('/test')
        .set('Content-Length', Buffer.byteLength(JSON.stringify(largePayload)))
        .send(largePayload)
        .expect(413);
    });

    test('should accept normal sized requests', async () => {
      const normalPayload = { message: 'Hello world' };

      await request(app)
        .post('/test')
        .send(normalPayload)
        .expect(200);
    });
  });

  describe('Prototype Pollution Protection', () => {
    test('should sanitize dangerous keys', async () => {
      const maliciousPayload = {
        '__proto__': { isAdmin: true },
        'constructor': { prototype: { isAdmin: true } },
        'prototype': { isAdmin: true }
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .expect(200);

      expect(response.body.data._blocked___proto__).toBeDefined();
      expect(response.body.data._blocked_constructor).toBeDefined();
      expect(response.body.data._blocked_prototype).toBeDefined();
    });
  });
});
EOF < /dev/null