const { Pool } = require('pg');
const logger = require('../utils/logger');

class DatabaseHealthCheck {
  constructor(pool) {
    this.pool = pool;
    this.healthMetrics = {
      connectionCount: 0,
      totalConnections: 0,
      idleConnections: 0,
      waitingClients: 0,
      lastHealthCheck: null,
      uptime: process.uptime(),
      errors: []
    };
  }

  async checkHealth() {
    const startTime = Date.now();
    const healthStatus = {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      responseTime: 0,
      connections: {},
      performance: {},
      errors: []
    };

    try {
      // Test basic connectivity
      const client = await this.pool.connect();
      
      try {
        // Simple query to test database responsiveness
        const pingResult = await client.query('SELECT 1 as ping, NOW() as server_time');
        
        // Check database version and settings
        const versionResult = await client.query('SELECT version() as version');
        
        // Get connection pool stats
        healthStatus.connections = {
          total: this.pool.totalCount,
          idle: this.pool.idleCount,
          waiting: this.pool.waitingCount
        };

        // Performance metrics
        healthStatus.performance = {
          responseTime: Date.now() - startTime,
          serverTime: pingResult.rows[0].server_time,
          version: versionResult.rows[0].version
        };

        // Check for long-running queries
        const longRunningQueries = await this.checkLongRunningQueries(client);
        if (longRunningQueries.length > 0) {
          healthStatus.warnings = {
            longRunningQueries: longRunningQueries.length,
            queries: longRunningQueries
          };
        }

        // Check table sizes and index usage
        const tableStats = await this.getTableStatistics(client);
        healthStatus.performance.tableStats = tableStats;

        logger.info('Database health check completed successfully', {
          responseTime: healthStatus.performance.responseTime,
          connections: healthStatus.connections
        });

      } finally {
        client.release();
      }

    } catch (error) {
      healthStatus.status = 'unhealthy';
      healthStatus.database = 'disconnected';
      healthStatus.errors.push({
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      });

      logger.error('Database health check failed', {
        error: error.message,
        code: error.code,
        responseTime: Date.now() - startTime
      });
    }

    healthStatus.performance.responseTime = Date.now() - startTime;
    this.healthMetrics.lastHealthCheck = new Date();
    
    return healthStatus;
  }

  async checkLongRunningQueries(client, thresholdMinutes = 5) {
    try {
      const query = `
        SELECT 
          pid,
          usename,
          application_name,
          state,
          query_start,
          state_change,
          query,
          EXTRACT(EPOCH FROM (NOW() - query_start)) / 60 as duration_minutes
        FROM pg_stat_activity 
        WHERE state = 'active' 
          AND query_start < NOW() - INTERVAL '${thresholdMinutes} minutes'
          AND query NOT LIKE '%pg_stat_activity%'
        ORDER BY query_start;
      `;

      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Failed to check long-running queries', { error: error.message });
      return [];
    }
  }

  async getTableStatistics(client) {
    try {
      const query = `
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY n_live_tup DESC
        LIMIT 10;
      `;

      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get table statistics', { error: error.message });
      return [];
    }
  }

  async getIndexUsage(client) {
    try {
      const query = `
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan as index_scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC
        LIMIT 20;
      `;

      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get index usage statistics', { error: error.message });
      return [];
    }
  }

  async analyzeQueryPerformance(client) {
    try {
      // Get slow queries if pg_stat_statements is available
      const query = `
        SELECT query, calls, total_time, mean_time, rows
        FROM pg_stat_statements 
        ORDER BY mean_time DESC 
        LIMIT 10;
      `;

      const result = await client.query(query);
      return result.rows;
    } catch (error) {
      // pg_stat_statements might not be installed
      logger.warn('pg_stat_statements not available for query performance analysis');
      return [];
    }
  }

  // Automated maintenance recommendations
  async getMaintenanceRecommendations(client) {
    const recommendations = [];

    try {
      // Check for tables that need vacuuming
      const vacuumQuery = `
        SELECT tablename, n_dead_tup, n_live_tup,
               ROUND(n_dead_tup * 100.0 / GREATEST(n_live_tup + n_dead_tup, 1), 2) as dead_percentage
        FROM pg_stat_user_tables 
        WHERE n_dead_tup > 1000 
          AND n_dead_tup * 100.0 / GREATEST(n_live_tup + n_dead_tup, 1) > 10
        ORDER BY dead_percentage DESC;
      `;

      const vacuumResult = await client.query(vacuumQuery);
      if (vacuumResult.rows.length > 0) {
        recommendations.push({
          type: 'vacuum',
          priority: 'medium',
          tables: vacuumResult.rows,
          message: 'Tables with high dead tuple percentage should be vacuumed'
        });
      }

      // Check for unused indexes
      const unusedIndexQuery = `
        SELECT schemaname, tablename, indexname, idx_scan
        FROM pg_stat_user_indexes 
        WHERE idx_scan = 0 
          AND schemaname = 'public'
          AND indexname NOT LIKE '%_pkey';
      `;

      const unusedResult = await client.query(unusedIndexQuery);
      if (unusedResult.rows.length > 0) {
        recommendations.push({
          type: 'unused_indexes',
          priority: 'low',
          indexes: unusedResult.rows,
          message: 'Consider removing unused indexes to improve write performance'
        });
      }

      return recommendations;
    } catch (error) {
      logger.error('Failed to generate maintenance recommendations', { error: error.message });
      return [];
    }
  }

  // Express middleware for health check endpoint
  getHealthCheckMiddleware() {
    return async (req, res) => {
      try {
        const health = await this.checkHealth();
        const statusCode = health.status === 'healthy' ? 200 : 503;
        
        res.status(statusCode).json({
          ...health,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          pid: process.pid
        });
      } catch (error) {
        logger.error('Health check endpoint error', { error: error.message });
        res.status(503).json({
          status: 'error',
          message: 'Health check failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    };
  }

  // Start periodic health monitoring
  startPeriodicHealthCheck(intervalMinutes = 5) {
    const interval = intervalMinutes * 60 * 1000;
    
    logger.info(`Starting periodic database health checks every ${intervalMinutes} minutes`);
    
    setInterval(async () => {
      try {
        const health = await this.checkHealth();
        
        if (health.status !== 'healthy') {
          logger.error('Database health check failed during periodic monitoring', health);
        }
        
        // Log warnings for performance issues
        if (health.warnings) {
          logger.warn('Database performance warnings detected', health.warnings);
        }
        
        // Check for maintenance recommendations periodically
        if (Math.random() < 0.1) { // 10% chance to run maintenance check
          const client = await this.pool.connect();
          try {
            const recommendations = await this.getMaintenanceRecommendations(client);
            if (recommendations.length > 0) {
              logger.info('Database maintenance recommendations', { recommendations });
            }
          } finally {
            client.release();
          }
        }
        
      } catch (error) {
        logger.error('Periodic health check error', { error: error.message });
      }
    }, interval);
  }
}

module.exports = DatabaseHealthCheck;