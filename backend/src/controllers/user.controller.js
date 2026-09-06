import { withTransaction } from '../db/transaction.js';
import { updateUserProfile } from '../repositories/user.repository.js';
import {
  changePassword,
  listUserSessions,
  revokeUserSession,
  sanitizeUser,
} from '../services/auth/auth.service.js';
import { asyncHandler } from '../utils/async-handler.js';
import { noContent, ok } from '../utils/http.js';

export const meController = asyncHandler(async (request, response) => {
  return ok(response, {
    user: request.auth.user,
    sellerId: request.auth.sellerId,
    customerId: request.auth.customerId,
  });
});

export const updateMeController = asyncHandler(async (request, response) => {
  const user = await withTransaction(
    (client) => updateUserProfile(client, request.auth.user.id, request.validated.body),
    request.dbContext,
  );

  return ok(response, { user: sanitizeUser(user) }, 'Profile updated.');
});

export const changePasswordController = asyncHandler(async (request, response) => {
  await changePassword(request.auth.user.id, request.validated.body, {
    email: request.auth.user.email,
    ipAddress: request.ip,
    userAgent: request.get('user-agent'),
  });
  return noContent(response);
});

export const sessionsController = asyncHandler(async (request, response) => {
  const sessions = await listUserSessions(request.auth.user.id);
  return ok(response, { sessions });
});

export const revokeSessionController = asyncHandler(async (request, response) => {
  await revokeUserSession(request.auth.user.id, request.validated.params.id);
  return noContent(response);
});
