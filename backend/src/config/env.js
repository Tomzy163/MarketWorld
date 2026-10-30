import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: resolve(process.cwd(), '.env') });
dotenv.config({ path: resolve(process.cwd(), '..', '.env') });

const optionalString = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().optional());

const csv = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return [];
  }

  const normalized = value.trim();
  if (!normalized) {
    return [];
  }

  return normalized
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}, z.array(z.string()));

const booleanFlag = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) {
      return false;
    }
    return ['true', '1', 'yes'].includes(normalized.toLowerCase());
  }

  return false;
}, z.boolean());

const schema = z.object({
  APP_NAME: z.string().min(1).default('MarketWorld'),
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().min(1).default('/api/v1'),
  WEB_PORT: z.coerce.number().int().positive().default(5173),
  API_BASE_URL: optionalString.pipe(z.string().url().optional()),
  DATABASE_URL: optionalString.pipe(z.string().min(1).optional()),
  DATABASE_SSL: booleanFlag.default(false),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  CORS_ALLOWED_ORIGINS: csv.default(['http://localhost:5173']),
  TRUST_PROXY: booleanFlag.default(false),
  LOG_LEVEL: z.enum(['silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  JSON_BODY_LIMIT: z.string().default('1mb'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(600),
  SOCKET_PATH: z.string().default('/socket.io'),
  JWT_ISSUER: z.string().default('marketworld-api'),
  JWT_AUDIENCE: z.string().default('marketworld-web'),
  JWT_ACCESS_SECRET: optionalString.pipe(z.string().min(32).optional()),
  JWT_REFRESH_SECRET: optionalString.pipe(z.string().min(32).optional()),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default('15m'),
  JWT_REFRESH_EXPIRES_IN_DAYS: z.coerce.number().int().positive().default(30),
  REFRESH_COOKIE_NAME: z.string().min(1).default('mw_refresh'),
  REFRESH_COOKIE_SECURE: booleanFlag.default(false),
  REFRESH_COOKIE_SAMESITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  PAYSTACK_API_URL: optionalString.pipe(z.string().url().optional()).default('https://api.paystack.co'),
  PAYSTACK_SECRET_KEY: optionalString,
  PAYSTACK_PUBLIC_KEY: optionalString,
  PAYSTACK_SPLIT_CODE: optionalString,
  PAYSTACK_WEBHOOK_SECRET: optionalString,
  REDIS_URL: optionalString,
  SENDGRID_API_KEY: optionalString,
  SMTP_HOST: optionalString,
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  EMAIL_FROM: optionalString.pipe(z.string().email().optional()),
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  TRIAL_ENABLED: booleanFlag.default(true),
  TRIAL_DAYS: z.coerce.number().int().positive().default(30),
  TRIAL_PLAN_NAME: z.string().min(1).default('Trial'),
  ADMIN_PREMIUM_OVERRIDE_ENABLED: booleanFlag.default(false),
  ADMIN_PREMIUM_EMAILS: csv.default([]),
  ADMIN_PREMIUM_USER_IDS: csv.default([]),
  ADMIN_PREMIUM_PLAN_NAME: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${details.join('\n')}`);
}

export const env = Object.freeze(parsed.data);

export function requireRuntimeSecret(name) {
  const value = env[name];
  if (!value) {
    throw new Error(`${name} must be configured before this operation can run.`);
  }

  return value;
}

export function assertProductionConfig() {
  if (env.NODE_ENV !== 'production') {
    return;
  }

  const missing = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'].filter(
    (name) => !env[name],
  );

  if (missing.length > 0) {
    throw new Error(`Production configuration is missing: ${missing.join(', ')}`);
  }

  if (!env.REFRESH_COOKIE_SECURE) {
    throw new Error('REFRESH_COOKIE_SECURE must be true in production.');
  }

  if (env.REFRESH_COOKIE_SAMESITE === 'none' && !env.REFRESH_COOKIE_SECURE) {
    throw new Error('SameSite=None refresh cookies require REFRESH_COOKIE_SECURE=true.');
  }
}

if (process.argv.includes('--check')) {
  assertProductionConfig();
  process.stdout.write('Backend environment schema check passed.\n');
}
