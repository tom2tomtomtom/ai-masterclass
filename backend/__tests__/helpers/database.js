const { Pool } = require('pg');

// Test database helper
class TestDatabase {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });
  }

  async createTestDatabase() {
    const adminPool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: 'postgres', // Connect to default database
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    try {
      // Check if test database exists
      const result = await adminPool.query(
        "SELECT 1 FROM pg_database WHERE datname = $1",
        [process.env.DB_DATABASE]
      );

      if (result.rows.length === 0) {
        // Create test database
        await adminPool.query(`CREATE DATABASE "${process.env.DB_DATABASE}"`);
        console.log('[TEST]', `Created test database: ${process.env.DB_DATABASE}`);
      }
    } catch (error) {
      console.error('[TEST ERROR]', 'Error creating test database:', error);
    } finally {
      await adminPool.end();
    }
  }

  async setupSchema() {
    const fs = require('fs');
    const path = require('path');
    
    try {
      // First, drop all existing tables to ensure clean state
      await this.dropAllTables();
      
      // Read and execute schema
      const schemaPath = path.join(__dirname, '../../db/database.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await this.pool.query(schema);
      }
      
      // Apply performance indexes (test version without CONCURRENTLY)
      const indexPath = path.join(__dirname, '../../db/performance_indexes_test.sql');
      if (fs.existsSync(indexPath)) {
        const indexes = fs.readFileSync(indexPath, 'utf8');
        await this.pool.query(indexes);
      }
      
      console.log('[TEST]', 'Test database schema set up successfully');
    } catch (error) {
      console.error('[TEST ERROR]', 'Error setting up schema:', error);
      throw error;
    }
  }

  async dropAllTables() {
    try {
      // Drop tables in reverse dependency order to handle foreign keys
      const dropTables = [
        'user_progress',
        'code_submissions', 
        'automation_workflows',
        'exercises',
        'modules',
        'courses',
        'users',
        'companies',
        'ai_integrations',
        'tool_integrations'
      ];

      for (const table of dropTables) {
        await this.pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      }
      
      console.log('[TEST]', 'Dropped all existing tables');
    } catch (error) {
      console.error('[TEST ERROR]', 'Error dropping tables:', error);
      // Don't throw error here, continue with schema setup
    }
  }

  async seedTestData() {
    try {
      // Insert test company
      const companyResult = await this.pool.query(
        "INSERT INTO companies (name) VALUES ('Test Company') RETURNING id"
      );
      const companyId = companyResult.rows[0].id;

      // Insert test user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('testpass123', 10);
      
      const userResult = await this.pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, company_id) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ['test@example.com', hashedPassword, 'Test', 'User', 'learner', companyId]
      );
      const userId = userResult.rows[0].id;

      // Insert test course
      const courseResult = await this.pool.query(`
        INSERT INTO courses (title, description, level, order_index, status) 
        VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['Test Course', 'A test course', 1, 1, 'published']
      );
      const courseId = courseResult.rows[0].id;

      // Insert test module
      const moduleResult = await this.pool.query(`
        INSERT INTO modules (course_id, title, description, order_index, content, module_type) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [courseId, 'Test Module', 'A test module', 1, '{}', 'theory']
      );
      const moduleId = moduleResult.rows[0].id;

      // Insert test exercise
      await this.pool.query(`
        INSERT INTO exercises (module_id, title, description, instructions, exercise_type) 
        VALUES ($1, $2, $3, $4, $5)`,
        [moduleId, 'Test Exercise', 'A test exercise', '{}', 'coding']
      );

      return { companyId, userId, courseId, moduleId };
    } catch (error) {
      console.error('[TEST ERROR]', 'Error seeding test data:', error);
      throw error;
    }
  }

  async clearDatabase() {
    try {
      // Delete all data in reverse dependency order
      await this.pool.query('DELETE FROM user_progress');
      await this.pool.query('DELETE FROM code_submissions');
      await this.pool.query('DELETE FROM automation_workflows');
      await this.pool.query('DELETE FROM exercises');
      await this.pool.query('DELETE FROM modules');
      await this.pool.query('DELETE FROM courses');
      await this.pool.query('DELETE FROM users');
      await this.pool.query('DELETE FROM companies');
      await this.pool.query('DELETE FROM ai_integrations');
      await this.pool.query('DELETE FROM tool_integrations');
    } catch (error) {
      console.error('[TEST ERROR]', 'Error clearing database:', error);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }

  query(text, params) {
    return this.pool.query(text, params);
  }
}

module.exports = TestDatabase;