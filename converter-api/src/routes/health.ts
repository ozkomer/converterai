import { Router } from 'express';
import { Request, Response } from 'express';
import { Logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Basic health check
 *     description: Returns basic server health information
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Detailed health check
 *     description: Returns detailed server health information including system details
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Detailed health information
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HealthResponse'
 *                 - type: object
 *                   properties:
 *                     environment:
 *                       type: string
 *                       example: development
 *                     nodeVersion:
 *                       type: string
 *                       example: v18.17.0
 *                     platform:
 *                       type: string
 *                       example: darwin
 *                     arch:
 *                       type: string
 *                       example: x64
 */
router.get('/detailed', (_req: Request, res: Response) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };

  Logger.info('Health check requested');
  res.json(health);
});

/**
 * @swagger
 * /api/health/ping:
 *   get:
 *     summary: Ping endpoint
 *     description: Simple ping endpoint that returns ponkponk
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Ping successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ponkponk
 */
router.get('/ping2', (_req: Request, res: Response) => {
  res.json({ message: 'ponkponk123' });
});

export { router as healthRoutes };
