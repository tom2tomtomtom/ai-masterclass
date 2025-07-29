const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function initDatabase() {
  try {
    logger.info('Connecting to database...');
    
    // Test connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    logger.info('Database connected successfully:', result.rows[0]);
    
    // Create basic tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        completed_at TIMESTAMP,
        progress_percentage INTEGER DEFAULT 0
      );
    `);
    
    logger.info('Database tables created successfully');
    
    client.release();
    
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = { initDatabase };

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database initialization failed:', error);
      process.exit(1);
    });
}