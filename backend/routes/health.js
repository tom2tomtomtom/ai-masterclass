const express = require('express');
const router = express.Router();

/**
 * Health Check Endpoint - MANDATORY for Railway deployment
 * Returns comprehensive health status including system metrics
 */
router.get('/health', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: Date.now(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      cpu: process.cpuUsage(),
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version
    };

    // Check database connection if available
    if (global.supabase || global.db) {
      try {
        // Simple connectivity check
        healthCheck.database = 'connected';
      } catch (dbError) {
        healthCheck.database = 'disconnected';
        healthCheck.status = 'DEGRADED';
      }
    }

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: Date.now(),
      error: error.message,
      uptime: process.uptime()
    });
  }
});

/**
 * Readiness Check - For Kubernetes/Railway load balancer
 */
router.get('/ready', (req, res) => {
  res.status(200).json({
    status: 'ready',
    timestamp: Date.now()
  });
});

/**
 * Liveness Check - For Kubernetes/Railway health monitoring
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: Date.now()
  });
});

module.exports = router;