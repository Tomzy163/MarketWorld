import express from 'express';
import { apiRouter } from './routes/index.js';
import { applySecurityMiddleware } from './middleware/security.js';
import { requestId } from './middleware/request-id.js';
import { apiRateLimit } from './middleware/rate-limits.js';
import { httpLogger } from './config/logger.js';
import { notFound } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();

  app.use(requestId);
  applySecurityMiddleware(app);
  app.use(httpLogger);
  app.use('/api/v1', apiRateLimit, apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
