import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { asyncHandler } from '../utils/async-handler.js';
import { ok } from '../utils/http.js';

export const healthController = asyncHandler(async (_request, response) => {
  return ok(response, {
    status: 'ok',
    service: `${env.APP_NAME}-api`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  });
});

export const liveController = asyncHandler(async (_request, response) => {
  return ok(response, {
    status: 'live',
    uptimeSeconds: Math.round(process.uptime()),
    memory: {
      rss: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
    },
  });
});

export const readyController = asyncHandler(async (_request, response) => {
  await query('SELECT 1 AS ok');
  return ok(response, {
    status: 'ready',
    dependencies: {
      database: 'ok',
    },
  });
});
