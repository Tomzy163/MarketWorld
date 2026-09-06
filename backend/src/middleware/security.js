import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export function applySecurityMiddleware(app) {
  if (env.TRUST_PROXY) {
    app.set('trust proxy', 1);
  }

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        if (!origin || env.CORS_ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(
          new AppError('Origin is not allowed by CORS policy.', {
            code: 'CORS_ORIGIN_DENIED',
            statusCode: 403,
          }),
        );
      },
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser());
}
