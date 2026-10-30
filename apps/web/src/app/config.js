const fallbackApiBaseUrl = 'http://localhost:4000/api/v1';

function readString(value, fallback) {
  const normalized = value?.trim();
  return normalized || fallback;
}

function readBoolean(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
}

export const appConfig = Object.freeze({
  name: readString(import.meta.env.VITE_APP_NAME, 'MarketWorld'),
  tagline: readString(import.meta.env.VITE_APP_TAGLINE, 'Seller-first marketplace operations'),
  apiBaseUrl: readString(import.meta.env.VITE_API_BASE_URL, fallbackApiBaseUrl).replace(/\/$/, ''),
  socketPath: readString(import.meta.env.VITE_SOCKET_PATH, '/socket.io'),
  features: Object.freeze({
    registration: readBoolean(import.meta.env.VITE_ENABLE_REGISTRATION, true),
    liveChat: readBoolean(import.meta.env.VITE_ENABLE_LIVE_CHAT, false),
    pwa: readBoolean(import.meta.env.VITE_ENABLE_PWA, false),
    ai: readBoolean(import.meta.env.VITE_ENABLE_AI_FEATURES, false),
  }),
});
