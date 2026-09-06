import { AppError } from '../utils/app-error.js';

export function validate(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      next(
        new AppError('Request validation failed.', {
          code: 'VALIDATION_ERROR',
          statusCode: 400,
          details,
        }),
      );
      return;
    }

    request.validated = result.data;
    next();
  };
}
