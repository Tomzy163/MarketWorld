export class AppError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'AppError';
    this.code = options.code || 'APPLICATION_ERROR';
    this.statusCode = options.statusCode || 500;
    this.details = options.details;
    this.isOperational = true;
  }
}
