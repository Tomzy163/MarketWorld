import pg from 'pg';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

const { Pool } = pg;
let pool;

export function getPool() {
  if (!env.DATABASE_URL) {
    throw new AppError('Database is not configured.', {
      code: 'DATABASE_NOT_CONFIGURED',
      statusCode: 503,
    });
  }

  if (!pool) {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.DATABASE_SSL ? { rejectUnauthorized: true } : undefined,
      application_name: 'marketworld-api',
    });
  }

  return pool;
}

export async function query(text, params = []) {
  return getPool().query(text, params);
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
