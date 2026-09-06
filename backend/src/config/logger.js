import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.tokenHash',
      '*.authorization',
      '*.cookie',
    ],
    censor: '[redacted]',
  },
  base: {
    service: 'marketworld-backend',
    env: env.NODE_ENV,
  },
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (request) => request.id,
  customProps: (request) => ({
    requestId: request.id,
    userId: request.auth?.user?.id,
    sellerId: request.auth?.sellerId,
  }),
});
