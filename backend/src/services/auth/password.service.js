import bcrypt from 'bcrypt';
import { env } from '../../config/env.js';

export async function hashPassword(password) {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

export async function verifyPassword(password, passwordHash) {
  if (!passwordHash) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}
