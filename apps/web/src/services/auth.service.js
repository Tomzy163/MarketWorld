import { request } from './api.js';

export const authService = {
  login(input) {
    return request('/auth/login', { method: 'POST', body: JSON.stringify(input) });
  },
  register(input) {
    return request('/auth/register', { method: 'POST', body: JSON.stringify(input) });
  },
  refresh() {
    return request('/auth/refresh', { method: 'POST' });
  },
  logout() {
    return request('/auth/logout', { method: 'POST' });
  },
  me(accessToken) {
    return request('/users/me', { headers: { Authorization: `Bearer ${accessToken}` } });
  },
};
