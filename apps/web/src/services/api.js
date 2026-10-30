import { appConfig } from '../app/config.js';

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function request(path, options = {}) {
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.error?.message || `API responded with ${response.status}`,
      response.status,
      payload?.error?.code,
    );
  }
  return payload.data;
}

export async function getHealth() {
  return request('/health');
}
