import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export function errorHandler(error, request, response, _next) {
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message =
    statusCode >= 500 && env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : error.message || 'An unexpected error occurred.';

  if (statusCode >= 500) {
    logger.error({ err: error, requestId: request.id }, 'Unhandled request error');
  } else {
    logger.warn({ err: error, requestId: request.id }, 'Request failed');
  }

  response.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: error.details,
    },
    requestId: request.id,
  });
}
