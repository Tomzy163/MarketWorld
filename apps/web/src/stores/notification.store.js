import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notifications', {
  state: () => ({ items: [] }),
  actions: {
    push(message, type = 'info') {
      const id = crypto.randomUUID();
      this.items.push({ id, message, type });
      window.setTimeout(() => this.dismiss(id), 5000);
    },
    dismiss(id) {
      this.items = this.items.filter((item) => item.id !== id);
    },
  },
});
