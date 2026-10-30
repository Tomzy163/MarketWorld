import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.LOG_LEVEL,
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
    service: `${env.APP_NAME}-backend`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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
