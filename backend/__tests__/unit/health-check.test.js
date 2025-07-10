const DatabaseHealthCheck = require('../../db/health-check');

describe('Database Health Check', () => {
  let mockPool;
  let mockClient;
  let healthChecker;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    mockPool = {
      connect: jest.fn().mockResolvedValue(mockClient),
      totalCount: 10,
      idleCount: 5,
      waitingCount: 0
    };

    healthChecker = new DatabaseHealthCheck(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkHealth', () => {
    test('should return healthy status when database is accessible', async () => {
      // Mock successful database queries
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ ping: 1, server_time: new Date() }] })
        .mockResolvedValueOnce({ rows: [{ version: 'PostgreSQL 13.0' }] })
        .mockResolvedValueOnce({ rows: [] }) // No long running queries
        .mockResolvedValueOnce({ rows: [] }); // Table stats

      const result = await healthChecker.checkHealth();

      expect(result.status).toBe('healthy');
      expect(result.database).toBe('connected');
      expect(result.connections).toEqual({
        total: 10,
        idle: 5,
        waiting: 0
      });
      expect(result.performance.responseTime).toBeGreaterThanOrEqual(0);
      expect(mockClient.release).toHaveBeenCalled();
    });

    test('should return unhealthy status when database is not accessible', async () => {
      // Mock database connection failure
      mockPool.connect.mockRejectedValue(new Error('Connection failed'));

      const result = await healthChecker.checkHealth();

      expect(result.status).toBe('unhealthy');
      expect(result.database).toBe('disconnected');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Connection failed');
    });

    test('should detect long running queries', async () => {
      const longRunningQuery = {
        pid: 12345,
        usename: 'testuser',
        query: 'SELECT * FROM large_table',
        duration_minutes: 10
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [{ ping: 1, server_time: new Date() }] })
        .mockResolvedValueOnce({ rows: [{ version: 'PostgreSQL 13.0' }] })
        .mockResolvedValueOnce({ rows: [longRunningQuery] }) // Long running query
        .mockResolvedValueOnce({ rows: [] }); // Table stats

      const result = await healthChecker.checkHealth();

      expect(result.status).toBe('healthy');
      expect(result.warnings).toBeDefined();
      expect(result.warnings.longRunningQueries).toBe(1);
      expect(result.warnings.queries).toContain(longRunningQuery);
    });
  });

  describe('checkLongRunningQueries', () => {
    test('should return empty array when no long running queries', async () => {
      mockClient.query.mockResolvedValue({ rows: [] });

      const result = await healthChecker.checkLongRunningQueries(mockClient, 5);

      expect(result).toEqual([]);
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('pg_stat_activity'));
    });

    test('should return long running queries', async () => {
      const longQuery = {
        pid: 12345,
        query: 'SELECT * FROM slow_table',
        duration_minutes: 10
      };

      mockClient.query.mockResolvedValue({ rows: [longQuery] });

      const result = await healthChecker.checkLongRunningQueries(mockClient, 5);

      expect(result).toContain(longQuery);
    });

    test('should handle query errors gracefully', async () => {
      mockClient.query.mockRejectedValue(new Error('Query failed'));

      const result = await healthChecker.checkLongRunningQueries(mockClient);

      expect(result).toEqual([]);
    });
  });

  describe('getMaintenanceRecommendations', () => {
    test('should recommend vacuum for tables with high dead tuple percentage', async () => {
      const tableNeedingVacuum = {
        tablename: 'users',
        n_dead_tup: 5000,
        n_live_tup: 10000,
        dead_percentage: 33.33
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [tableNeedingVacuum] }) // Vacuum check
        .mockResolvedValueOnce({ rows: [] }); // Unused indexes check

      const recommendations = await healthChecker.getMaintenanceRecommendations(mockClient);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe('vacuum');
      expect(recommendations[0].priority).toBe('medium');
      expect(recommendations[0].tables).toContain(tableNeedingVacuum);
    });

    test('should recommend removing unused indexes', async () => {
      const unusedIndex = {
        schemaname: 'public',
        tablename: 'courses',
        indexname: 'unused_idx',
        idx_scan: 0
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [] }) // Vacuum check
        .mockResolvedValueOnce({ rows: [unusedIndex] }); // Unused indexes

      const recommendations = await healthChecker.getMaintenanceRecommendations(mockClient);

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].type).toBe('unused_indexes');
      expect(recommendations[0].priority).toBe('low');
      expect(recommendations[0].indexes).toContain(unusedIndex);
    });

    test('should handle errors gracefully', async () => {
      mockClient.query.mockRejectedValue(new Error('Query failed'));

      const recommendations = await healthChecker.getMaintenanceRecommendations(mockClient);

      expect(recommendations).toEqual([]);
    });
  });

  describe('getHealthCheckMiddleware', () => {
    test('should return healthy response with status 200', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock successful health check
      jest.spyOn(healthChecker, 'checkHealth').mockResolvedValue({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        performance: { responseTime: 50 }
      });

      const middleware = healthChecker.getHealthCheckMiddleware();
      await middleware(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'healthy',
        uptime: expect.any(Number),
        memory: expect.any(Object),
        pid: expect.any(Number)
      }));
    });

    test('should return unhealthy response with status 503', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock unhealthy check
      jest.spyOn(healthChecker, 'checkHealth').mockResolvedValue({
        status: 'unhealthy',
        database: 'disconnected',
        errors: [{ message: 'Connection failed' }]
      });

      const middleware = healthChecker.getHealthCheckMiddleware();
      await middleware(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
    });

    test('should handle middleware errors', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock error in health check
      jest.spyOn(healthChecker, 'checkHealth').mockRejectedValue(new Error('Health check failed'));

      const middleware = healthChecker.getHealthCheckMiddleware();
      await middleware(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: 'Health check failed',
        error: 'Health check failed'
      }));
    });
  });
});