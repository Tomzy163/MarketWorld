import jwt from 'jsonwebtoken';
import { addDays } from '@marketworld/shared';
import { env, requireRuntimeSecret } from '../../config/env.js';
import { createOpaqueToken, sha256 } from '../../utils/crypto.js';

export function createAccessToken(identity) {
  return jwt.sign(
    {
      sub: identity.user.id,
      role: identity.user.role,
      sellerId: identity.sellerId || undefined,
      customerId: identity.customerId || undefined,
    },
    requireRuntimeSecret('JWT_ACCESS_SECRET'),
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      issuer: 'marketworld-api',
      audience: 'marketworld-web',
    },
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, requireRuntimeSecret('JWT_ACCESS_SECRET'), {
    issuer: 'marketworld-api',
    audience: 'marketworld-web',
  });
}

export function createRefreshToken() {
  const token = createOpaqueToken(64);
  return {
    token,
    tokenHash: hashRefreshToken(token),
    expiresAt: addDays(new Date(), env.JWT_REFRESH_EXPIRES_IN_DAYS),
  };
}

export function hashRefreshToken(token) {
  return sha256(token);
}

export function createEmailToken() {
  const token = createOpaqueToken(48);
  return {
    token,
    tokenHash: sha256(token),
    expiresAt: addDays(new Date(), 2),
  };
}

export function createPasswordResetToken() {
  const token = createOpaqueToken(48);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  return {
    token,
    tokenHash: sha256(token),
    expiresAt,
  };
}
