<template>
  <div class="app-shell">
    <AppHeader />
    <main class="page-content"><slot /></main>
    <footer class="app-footer">{{ config.name }} · Secure multi-tenant marketplace foundation</footer>
    <aside class="toasts" aria-live="polite">
      <div v-for="item in notifications.items" :key="item.id" class="toast" :class="item.type">
        {{ item.message }}
        <button aria-label="Dismiss notification" @click="notifications.dismiss(item.id)">×</button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { appConfig as config } from '../../app/config.js';
import { useNotificationStore } from '../../stores/notification.store.js';
import AppHeader from './AppHeader.vue';
const notifications = useNotificationStore();
</script>
