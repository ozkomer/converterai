import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs-extra';
import swaggerUi from 'swagger-ui-express';

import { conversionRoutes } from './routes/conversion';
import { healthRoutes } from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { Logger } from './utils/logger';
import { specs } from './config/swagger';

const app = express();

// Export app for testing
export { app };
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Increase timeout for large requests
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/outputs', express.static(path.join(__dirname, '../outputs')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AI to Template Converter API'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/convert', conversionRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'AI to Template Converter API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      ping: '/api/health/ping3',
      convert: '/api/convert',
      uploads: '/uploads',
      outputs: '/outputs',
      docs: '/api-docs'
    }
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Ensure directories exist
async function ensureDirectories() {
  const dirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../outputs'),
    path.join(__dirname, '../uploads/ai-outputs'),
    path.join(__dirname, '../uploads/templates'),
    path.join(__dirname, '../outputs/converted')
  ];

  for (const dir of dirs) {
    await fs.ensureDir(dir);
  }
}

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  async function startServer() {
    try {
      await ensureDirectories();
      
      app.listen(PORT, () => {
        Logger.info(`🚀 Server running on port ${PORT}`);
        Logger.info(`📁 Upload directory: ${path.join(__dirname, '../uploads')}`);
        Logger.info(`📁 Output directory: ${path.join(__dirname, '../outputs')}`);
        Logger.info(`🌐 API URL: http://localhost:${PORT}`);
      });
    } catch (error) {
      Logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  startServer();
}
