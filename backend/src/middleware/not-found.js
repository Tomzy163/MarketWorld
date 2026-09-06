import { AppError } from '../utils/app-error.js';

export function notFound(request, _response, next) {
  next(
    new AppError(`Route ${request.method} ${request.originalUrl} was not found.`, {
      code: 'ROUTE_NOT_FOUND',
      statusCode: 404,
    }),
  );
}
