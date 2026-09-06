import { AppError } from '../utils/app-error.js';

export function requireRole(...roles) {
  const allowed = new Set(roles);

  return (request, _response, next) => {
    if (!request.auth) {
      next(
        new AppError('Authentication is required.', {
          code: 'AUTHENTICATION_REQUIRED',
          statusCode: 401,
        }),
      );
      return;
    }

    if (!allowed.has(request.auth.user.role)) {
      next(
        new AppError('This role cannot perform the requested action.', {
          code: 'ROLE_FORBIDDEN',
          statusCode: 403,
        }),
      );
      return;
    }

    next();
  };
}

export function requireSellerScope(request, _response, next) {
  if (!request.auth?.sellerId) {
    next(
      new AppError('Seller scope is required for this operation.', {
        code: 'SELLER_SCOPE_REQUIRED',
        statusCode: 403,
      }),
    );
    return;
  }

  next();
}
