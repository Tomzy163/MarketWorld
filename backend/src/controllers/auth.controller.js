import { env } from '../config/env.js';
import { asyncHandler } from '../utils/async-handler.js';
import { created, noContent, ok } from '../utils/http.js';
import {
  login,
  logout,
  refreshSession,
  register,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from '../services/auth/auth.service.js';

export const registerController = asyncHandler(async (request, response) => {
  const result = await register(request.validated.body, requestContext(request));
  return created(response, result, 'Registration created. Verify your email to activate the account.');
});

export const loginController = asyncHandler(async (request, response) => {
  const result = await login(request.validated.body, requestContext(request));
  setRefreshCookie(response, result.refreshToken, result.refreshExpiresAt);
  return ok(
    response,
    {
      user: result.identity.user,
      sellerId: result.identity.sellerId,
      customerId: result.identity.customerId,
      accessToken: result.accessToken,
    },
    'Login successful.',
  );
});

export const refreshController = asyncHandler(async (request, response) => {
  const result = await refreshSession(request.cookies[env.REFRESH_COOKIE_NAME], requestContext(request));
  setRefreshCookie(response, result.refreshToken, result.refreshExpiresAt);
  return ok(
    response,
    {
      user: result.identity.user,
      sellerId: result.identity.sellerId,
      customerId: result.identity.customerId,
      accessToken: result.accessToken,
    },
    'Session refreshed.',
  );
});

export const logoutController = asyncHandler(async (request, response) => {
  await logout(request.cookies[env.REFRESH_COOKIE_NAME]);
  clearRefreshCookie(response);
  return noContent(response);
});

export const verifyEmailController = asyncHandler(async (request, response) => {
  const user = await verifyEmail(request.validated.query.token);
  return ok(response, { user }, 'Email verified.');
});

export const forgotPasswordController = asyncHandler(async (request, response) => {
  await requestPasswordReset(request.validated.body.email, requestContext(request));
  return ok(response, {}, 'If an account exists for this email, a reset link will be sent.');
});

export const resetPasswordController = asyncHandler(async (request, response) => {
  await resetPassword(request.validated.body, requestContext(request));
  return ok(response, {}, 'Password has been reset.');
});

export const googleOAuthController = asyncHandler(async (_request, response) => {
  return response.status(501).json({
    success: false,
    error: {
      code: 'GOOGLE_OAUTH_NOT_CONFIGURED',
      message: 'Google OAuth routes are reserved and require provider credentials before activation.',
    },
    requestId: response.req.id,
  });
});

function setRefreshCookie(response, token, expiresAt) {
  response.cookie(env.REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.REFRESH_COOKIE_SECURE,
    sameSite: env.REFRESH_COOKIE_SAMESITE,
    expires: expiresAt,
    path: '/api/v1/auth',
  });
}

function clearRefreshCookie(response) {
  response.clearCookie(env.REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.REFRESH_COOKIE_SECURE,
    sameSite: env.REFRESH_COOKIE_SAMESITE,
    path: '/api/v1/auth',
  });
}

function requestContext(request) {
  return {
    ipAddress: request.ip,
    userAgent: request.get('user-agent'),
  };
}
