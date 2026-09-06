import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function createOpaqueToken(byteLength = 48) {
  return randomBytes(byteLength).toString('base64url');
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function generateOrderSafeReference(prefix = 'mw') {
  return `${prefix}_${randomBytes(18).toString('base64url')}`;
}
