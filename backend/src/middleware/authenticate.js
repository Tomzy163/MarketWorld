import { authenticateAccessToken } from '../services/auth/auth.service.js';
import { AppError } from '../utils/app-error.js';

export async function authenticate(request, _response, next) {
  try {
    const token = getBearerToken(request);

    if (!token) {
      throw new AppError('Authentication is required.', {
        code: 'AUTHENTICATION_REQUIRED',
        statusCode: 401,
      });
    }

    const identity = await authenticateAccessToken(token);
    request.auth = identity;
    request.dbContext = {
      userId: identity.user.id,
      sellerId: identity.sellerId,
      role: identity.user.role,
    };
    next();
  } catch (error) {
    next(error);
  }
}

function getBearerToken(request) {
  const authorization = request.get('authorization');
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}
