import { defineStore } from 'pinia';
import { authService } from '../services/auth.service.js';

const tokenKey = 'marketworld.access-token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    sellerId: null,
    customerId: null,
    accessToken: sessionStorage.getItem(tokenKey),
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken && state.user),
  },
  actions: {
    async login(credentials) {
      this.loading = true;
      try {
        const data = await authService.login(credentials);
        this.setSession(data);
        return data;
      } finally {
        this.loading = false;
      }
    },
    setSession(data) {
      this.user = data.user;
      this.sellerId = data.sellerId;
      this.customerId = data.customerId;
      this.accessToken = data.accessToken;
      sessionStorage.setItem(tokenKey, data.accessToken);
    },
    async restore() {
      if (!this.accessToken) return;
      try {
        const data = await authService.me(this.accessToken);
        this.user = data.user;
        this.sellerId = data.sellerId;
        this.customerId = data.customerId;
      } catch {
        this.clearSession();
      }
    },
    async logout() {
      try {
        await authService.logout();
      } finally {
        this.clearSession();
      }
    },
    clearSession() {
      this.user = null;
      this.sellerId = null;
      this.customerId = null;
      this.accessToken = null;
      sessionStorage.removeItem(tokenKey);
    },
  },
});
