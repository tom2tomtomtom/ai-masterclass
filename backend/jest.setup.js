// Jest setup file for global test configuration
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.DB_DATABASE = 'ai_masterclass_test';
process.env.DB_USER = process.env.DB_USER || 'thomasdowuona-hyde';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock logger to reduce noise in tests
jest.mock('./utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

// Global test teardown
afterAll(async () => {
  // Close any open database connections
  const db = require('./db');
  if (db.pool && db.pool.end) {
    await db.pool.end();
  }
});