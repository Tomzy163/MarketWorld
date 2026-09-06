import { createHmac } from 'node:crypto';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';
import { safeEqual } from '../../utils/crypto.js';

const baseUrl = 'https://api.paystack.co';

export function verifyPaystackSignature(rawBody, signature) {
  if (!env.PAYSTACK_WEBHOOK_SECRET && !env.PAYSTACK_SECRET_KEY) {
    throw new AppError('Paystack webhook signing key is not configured.', {
      code: 'PAYSTACK_WEBHOOK_SECRET_MISSING',
      statusCode: 503,
    });
  }

  const key = env.PAYSTACK_WEBHOOK_SECRET || env.PAYSTACK_SECRET_KEY;
  const expected = createHmac('sha512', key).update(rawBody).digest('hex');
  return safeEqual(expected, signature || '');
}

export async function initializePaystackTransaction(input) {
  return paystackRequest('/transaction/initialize', {
    method: 'POST',
    body: {
      email: input.email,
      amount: input.amountKobo,
      currency: input.currency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    },
  });
}

export async function verifyPaystackTransaction(reference) {
  return paystackRequest(`/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
  });
}

async function paystackRequest(path, options) {
  if (!env.PAYSTACK_SECRET_KEY) {
    throw new AppError('Paystack is not configured.', {
      code: 'PAYSTACK_NOT_CONFIGURED',
      statusCode: 503,
    });
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json();
  if (!response.ok || payload.status !== true) {
    throw new AppError('Paystack request failed.', {
      code: 'PAYSTACK_REQUEST_FAILED',
      statusCode: 502,
      details: { providerStatus: response.status },
    });
  }

  return payload.data;
}
