import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] }),
  getters: {
    count: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    total: (state) => state.items.reduce((total, item) => total + item.quantity * item.price, 0),
  },
  actions: {
    add(product) {
      const existing = this.items.find((item) => item.id === product.id);
      if (existing) existing.quantity += 1;
      else this.items.push({ ...product, quantity: 1 });
    },
    remove(productId) {
      this.items = this.items.filter((item) => item.id !== productId);
    },
  },
});
