import { sha256 } from '../../utils/crypto.js';
import { AppError } from '../../utils/app-error.js';
import { env } from '../../config/env.js';
import { withTransaction } from '../../db/transaction.js';
import {
  activateVerifiedUser,
  createCustomerProfile,
  createUser,
  findUserByEmail,
  findUserById,
  getIdentityContext,
  updateUserLastLogin,
  updateUserPassword,
} from '../../repositories/user.repository.js';
import {
  createEmailVerificationToken,
  createPasswordResetToken as createPasswordResetTokenRow,
  createRefreshToken as createRefreshTokenRow,
  consumeEmailVerificationToken,
  consumePasswordResetToken,
  findUsableRefreshToken,
  listSessionsForUser,
  markRefreshTokenUsed,
  revokeAllRefreshTokensForUser,
  revokeRefreshToken,
  revokeRefreshTokenByHash,
  revokeSessionForUser,
} from '../../repositories/token.repository.js';
import { createSellerWithStore, createTrialSubscription } from '../../repositories/seller.repository.js';
import { enqueueJob } from '../../repositories/job.repository.js';
import { writeAuditLog } from '../../repositories/audit.repository.js';
import { hashPassword, verifyPassword } from './password.service.js';
import {
  createAccessToken,
  createEmailToken,
  createPasswordResetToken,
  createRefreshToken,
  hashRefreshToken,
  verifyAccessToken,
} from './token.service.js';

const allowedRegistrationRoles = new Set(['customer', 'seller']);

export async function register(input, context = {}) {
  if (!allowedRegistrationRoles.has(input.role)) {
    throw new AppError('Only customer and seller self-registration is allowed.', {
      code: 'REGISTRATION_ROLE_NOT_ALLOWED',
      statusCode: 400,
    });
  }

  return withTransaction(async (client) => {
    const email = input.email.toLowerCase();
    const existing = await findUserByEmail(client, email);

    if (existing) {
      throw new AppError('An account already exists for this email address.', {
        code: 'EMAIL_ALREADY_REGISTERED',
        statusCode: 409,
      });
    }

    const passwordHash = await hashPassword(input.password);
    const user = await createUser(client, {
      email,
      phone: input.phone,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      status: 'pending_verification',
    });

    let seller = null;
    let store = null;
    let customer = null;
    let subscription = null;

    if (input.role === 'seller') {
      const sellerContext = await createSellerWithStore(client, {
        ownerUserId: user.id,
        businessName: input.businessName,
        legalName: input.legalName,
        storeName: input.storeName,
        storeSlug: input.storeSlug,
        storeDescription: input.storeDescription,
      });

      seller = sellerContext.seller;
      store = sellerContext.store;

      if (env.TRIAL_ENABLED) {
        subscription = await createTrialSubscription(client, {
          sellerId: seller.id,
          trialDays: env.TRIAL_DAYS,
          planName: env.TRIAL_PLAN_NAME,
        });
      }
    } else {
      customer = await createCustomerProfile(client, user.id);
    }

    const verification = createEmailToken();
    await createEmailVerificationToken(client, {
      userId: user.id,
      tokenHash: verification.tokenHash,
      expiresAt: verification.expiresAt,
    });

    await enqueueJob(client, {
      queue: 'email',
      jobType: 'auth.email_verification',
      sellerId: seller?.id,
      idempotencyKey: `email-verification:${user.id}`,
      payload: {
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        verificationUrl: `${env.FRONTEND_URL}/verify-email?token=${verification.token}`,
      },
    });

    await writeAuditLog(client, {
      actorUserId: user.id,
      sellerId: seller?.id,
      action: 'auth.register',
      resourceType: 'user',
      resourceId: user.id,
      ipHash: context.ipAddress ? sha256(context.ipAddress) : null,
      userAgent: context.userAgent,
      metadata: { role: input.role },
    });

    return sanitizeRegistrationResult({ user, seller, store, customer, subscription });
  });
}

export async function login(input, context = {}) {
  return withTransaction(async (client) => {
    const user = await findUserByEmail(client, input.email.toLowerCase());

    if (!user || !(await verifyPassword(input.password, user.password_hash))) {
      await recordFailedLogin(client, input.email, context);
      throw new AppError('Invalid email or password.', {
        code: 'INVALID_CREDENTIALS',
        statusCode: 401,
      });
    }

    if (user.status !== 'active') {
      throw new AppError('Email verification is required before login.', {
        code: 'EMAIL_NOT_VERIFIED',
        statusCode: 403,
      });
    }

    const identity = await getIdentityContext(client, user.id);
    const accessToken = createAccessToken(identity);
    const refresh = createRefreshToken();

    await createRefreshTokenRow(client, {
      userId: user.id,
      tokenHash: refresh.tokenHash,
      expiresAt: refresh.expiresAt,
      userAgent: context.userAgent,
      ipHash: context.ipAddress ? sha256(context.ipAddress) : null,
    });
    await updateUserLastLogin(client, user.id);
    await writeAuditLog(client, {
      actorUserId: user.id,
      sellerId: identity.sellerId,
      action: 'auth.login',
      resourceType: 'user',
      resourceId: user.id,
      ipHash: context.ipAddress ? sha256(context.ipAddress) : null,
      userAgent: context.userAgent,
    });

    return {
      identity,
      accessToken,
      refreshToken: refresh.token,
      refreshExpiresAt: refresh.expiresAt,
    };
  });
}

export async function authenticateAccessToken(token) {
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (_error) {
    throw new AppError('Authentication token is invalid or expired.', {
      code: 'INVALID_ACCESS_TOKEN',
      statusCode: 401,
    });
  }

  return withTransaction(async (client) => {
    const identity = await getIdentityContext(client, payload.sub);

    if (!identity || identity.user.status !== 'active') {
      throw new AppError('Authenticated user is not active.', {
        code: 'USER_NOT_ACTIVE',
        statusCode: 401,
      });
    }

    return identity;
  });
}

export async function refreshSession(refreshTokenValue, context = {}) {
  if (!refreshTokenValue) {
    throw new AppError('Refresh token is required.', {
      code: 'REFRESH_TOKEN_REQUIRED',
      statusCode: 401,
    });
  }

  return withTransaction(async (client) => {
    const tokenHash = hashRefreshToken(refreshTokenValue);
    const stored = await findUsableRefreshToken(client, tokenHash);

    if (!stored) {
      throw new AppError('Refresh token is invalid or expired.', {
        code: 'INVALID_REFRESH_TOKEN',
        statusCode: 401,
      });
    }

    const user = await findUserById(client, stored.user_id);
    if (!user || user.status !== 'active') {
      throw new AppError('Refresh token user is not active.', {
        code: 'USER_NOT_ACTIVE',
        statusCode: 401,
      });
    }

    await markRefreshTokenUsed(client, stored.id);
    await revokeRefreshToken(client, stored.id);

    const identity = await getIdentityContext(client, user.id);
    const accessToken = createAccessToken(identity);
    const refresh = createRefreshToken();

    await createRefreshTokenRow(client, {
      userId: user.id,
      tokenHash: refresh.tokenHash,
      expiresAt: refresh.expiresAt,
      userAgent: context.userAgent,
      ipHash: context.ipAddress ? sha256(context.ipAddress) : null,
    });

    return {
      identity,
      accessToken,
      refreshToken: refresh.token,
      refreshExpiresAt: refresh.expiresAt,
    };
  });
}

export async function logout(refreshTokenValue) {
  if (!refreshTokenValue) {
    return;
  }

  await withTransaction(async (client) => {
    await revokeRefreshTokenByHash(client, hashRefreshToken(refreshTokenValue));
  });
}

export async function verifyEmail(token) {
  return withTransaction(async (client) => {
    const consumed = await consumeEmailVerificationToken(client, sha256(token));
    if (!consumed) {
      throw new AppError('Verification token is invalid or expired.', {
        code: 'INVALID_EMAIL_VERIFICATION_TOKEN',
        statusCode: 400,
      });
    }

    const user = await activateVerifiedUser(client, consumed.user_id);
    await writeAuditLog(client, {
      actorUserId: user.id,
      action: 'auth.email_verified',
      resourceType: 'user',
      resourceId: user.id,
    });

    return sanitizeUser(user);
  });
}

export async function requestPasswordReset(email, context = {}) {
  await withTransaction(async (client) => {
    const user = await findUserByEmail(client, email.toLowerCase());
    if (!user) {
      return;
    }

    const reset = createPasswordResetToken();
    await createPasswordResetTokenRow(client, {
      userId: user.id,
      tokenHash: reset.tokenHash,
      expiresAt: reset.expiresAt,
    });

    await enqueueJob(client, {
      queue: 'email',
      jobType: 'auth.password_reset',
      sellerId: null,
      idempotencyKey: `password-reset:${user.id}:${reset.tokenHash}`,
      payload: {
        userId: user.id,
        email: user.email,
        resetUrl: `${env.FRONTEND_URL}/reset-password?token=${reset.token}`,
      },
    });

    await writeAuditLog(client, {
      actorUserId: user.id,
      action: 'auth.password_reset_requested',
      resourceType: 'user',
      resourceId: user.id,
      ipHash: context.ipAddress ? sha256(context.ipAddress) : null,
      userAgent: context.userAgent,
    });
  });
}

export async function resetPassword(input, context = {}) {
  await withTransaction(async (client) => {
    const consumed = await consumePasswordResetToken(client, sha256(input.token));

    if (!consumed) {
      throw new AppError('Password reset token is invalid or expired.', {
        code: 'INVALID_PASSWORD_RESET_TOKEN',
        statusCode: 400,
      });
    }

    const passwordHash = await hashPassword(input.password);
    await updateUserPassword(client, consumed.user_id, passwordHash);
    await revokeAllRefreshTokensForUser(client, consumed.user_id);
    await writeAuditLog(client, {
      actorUserId: consumed.user_id,
      action: 'auth.password_reset_completed',
      resourceType: 'user',
      resourceId: consumed.user_id,
      ipHash: context.ipAddress ? sha256(context.ipAddress) : null,
      userAgent: context.userAgent,
    });
  });
}

export async function changePassword(userId, input, context = {}) {
  await withTransaction(async (client) => {
    const user = await findUserByEmail(client, context.email);
    if (!user || user.id !== userId || !(await verifyPassword(input.currentPassword, user.password_hash))) {
      throw new AppError('Current password is incorrect.', {
        code: 'INVALID_CURRENT_PASSWORD',
        statusCode: 400,
      });
    }

    await updateUserPassword(client, userId, await hashPassword(input.newPassword));
    await revokeAllRefreshTokensForUser(client, userId);
    await writeAuditLog(client, {
      actorUserId: userId,
      action: 'auth.password_changed',
      resourceType: 'user',
      resourceId: userId,
      ipHash: context.ipAddress ? sha256(context.ipAddress) : null,
      userAgent: context.userAgent,
    });
  });
}

export async function listUserSessions(userId) {
  return withTransaction(async (client) => listSessionsForUser(client, userId), {
    userId,
    role: 'customer',
  });
}

export async function revokeUserSession(userId, tokenId) {
  return withTransaction(async (client) => {
    const revoked = await revokeSessionForUser(client, userId, tokenId);
    if (!revoked) {
      throw new AppError('Session was not found.', {
        code: 'SESSION_NOT_FOUND',
        statusCode: 404,
      });
    }
  });
}

async function recordFailedLogin(client, email, context) {
  await client.query(
    `
      INSERT INTO fraud_events (user_id, seller_id, event_type, risk_score, ip_hash, device_hash, metadata)
      VALUES (NULL, NULL, 'failed_login', 15, $1, NULL, $2)
    `,
    [
      context.ipAddress ? sha256(context.ipAddress) : null,
      JSON.stringify({ email: email.toLowerCase(), userAgent: context.userAgent || null }),
    ],
  );
}

function sanitizeRegistrationResult(result) {
  return {
    user: sanitizeUser(result.user),
    seller: result.seller || null,
    store: result.store || null,
    customer: result.customer || null,
    subscription: result.subscription || null,
  };
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.first_name ?? user.firstName,
    lastName: user.last_name ?? user.lastName,
    role: user.role,
    status: user.status,
    emailVerifiedAt: user.email_verified_at ?? user.emailVerifiedAt,
    lastLoginAt: user.last_login_at ?? user.lastLoginAt,
    createdAt: user.created_at ?? user.createdAt,
    updatedAt: user.updated_at ?? user.updatedAt,
  };
}
