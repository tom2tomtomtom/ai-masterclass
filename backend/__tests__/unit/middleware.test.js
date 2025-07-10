const auth = require('../../middleware/auth');
const { validateEmail, validatePassword } = require('../../middleware/validation');
const jwt = require('jsonwebtoken');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('auth middleware', () => {
    test('should reject request with no token', async () => {
      req.header.mockReturnValue(null);

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'No token, authorization denied'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', async () => {
      req.header.mockReturnValue('invalid-token');

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Token is not valid'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should accept request with valid token', async () => {
      const userId = 'test-user-id';
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
      req.header.mockReturnValue(token);

      await auth(req, res, next);

      expect(req.user).toMatchObject({ id: userId });
      expect(req.user.iat).toBeDefined(); // JWT includes issued at timestamp
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should handle Bearer token format', async () => {
      const userId = 'test-user-id';
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
      req.header.mockImplementation((header) => {
        if (header === 'Authorization') return `Bearer ${token}`;
        return null;
      });

      await auth(req, res, next);

      expect(req.user).toMatchObject({ id: userId });
      expect(next).toHaveBeenCalled();
    });
  });
});

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateEmail', () => {
    test('should accept valid email', async () => {
      req.body.email = 'test@example.com';
      
      const validator = validateEmail();
      await validator.run(req);
      const errors = require('express-validator').validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    test('should reject invalid email format', async () => {
      req.body.email = 'invalid-email';
      
      const validator = validateEmail();
      await validator.run(req);
      const errors = require('express-validator').validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });

    test('should reject empty email', async () => {
      req.body.email = '';
      
      const validator = validateEmail();
      await validator.run(req);
      const errors = require('express-validator').validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should accept strong password', async () => {
      req.body.password = 'StrongPass123!';
      
      const validator = validatePassword();
      await validator.run(req);
      const errors = require('express-validator').validationResult(req);
      
      expect(errors.isEmpty()).toBe(true);
    });

    test('should reject weak password', async () => {
      req.body.password = 'weak';
      
      const validator = validatePassword();
      await validator.run(req);
      const errors = require('express-validator').validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });

    test('should reject password without uppercase', async () => {
      req.body.password = 'nouppercase123!';
      
      const validator = validatePassword();
      await validator.run(req);
      const errors = require('express-validator').validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });

    test('should reject password without numbers', async () => {
      req.body.password = 'NoNumbers!';
      
      const validator = validatePassword();
      await validator.run(req);
      const errors = require('express-validator').validationResult(req);
      
      expect(errors.isEmpty()).toBe(false);
    });
  });
});