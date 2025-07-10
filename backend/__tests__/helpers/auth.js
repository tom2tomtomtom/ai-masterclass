const jwt = require('jsonwebtoken');

// Test authentication helpers
class TestAuth {
  static generateTestToken(userId, role = 'learner') {
    return jwt.sign(
      { 
        id: userId, 
        role: role,
        email: 'test@example.com'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  static generateExpiredToken(userId) {
    return jwt.sign(
      { 
        id: userId, 
        role: 'learner',
        email: 'test@example.com'
      },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' } // Already expired
    );
  }

  static generateInvalidToken() {
    return 'invalid.jwt.token';
  }

  static getAuthHeaders(token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  static async createTestUser(testDb) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    
    const result = await testDb.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role) 
      VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role`,
      ['testuser@example.com', hashedPassword, 'Test', 'User', 'learner']
    );
    
    return result.rows[0];
  }

  static async createAdminUser(testDb) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('adminpass123', 10);
    
    const result = await testDb.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role) 
      VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role`,
      ['admin@example.com', hashedPassword, 'Admin', 'User', 'admin']
    );
    
    return result.rows[0];
  }
}

module.exports = TestAuth;