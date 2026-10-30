<template>
  <AppShell>
  <section class="hero">
    <section class="card">
      <p class="eyebrow">{{ config.name }}</p>
      <h1>{{ config.tagline }}</h1>
      <p>
        The secure platform foundation is online. Marketplace dashboards, storefronts, and role-specific
        workflows can now connect through the documented API.
      </p>
      <ul>
        <li>Vue 3 + Router foundation</li>
        <li>Express backend with secure middleware</li>
        <li>PostgreSQL + RLS-ready architecture</li>
      </ul>
      <button type="button" :disabled="checking" @click="checkApi">
        {{ checking ? 'Checking API…' : 'Check API status' }}
      </button>
      <p class="status" :class="status.kind" role="status">{{ status.message }}</p>
    </section>
  </section>
  </AppShell>
</template>

<script setup>
import { ref } from 'vue';
import AppShell from '../components/common/AppShell.vue';
import { appConfig } from '../app/config.js';
import { getHealth } from '../services/api.js';

const config = appConfig;
const checking = ref(false);
const status = ref({
  kind: 'neutral',
  message: `API: ${appConfig.apiBaseUrl}`,
});

async function checkApi() {
  checking.value = true;
  status.value = { kind: 'neutral', message: 'Checking API health…' };

  try {
    const health = await getHealth();
    status.value = {
      kind: 'success',
      message: `API is ${health.status} (${health.service}).`,
    };
  } catch (error) {
    status.value = {
      kind: 'error',
      message: `API unavailable: ${error.message}`,
    };
  } finally {
    checking.value = false;
  }
}
</script>

<style scoped>
.card {
  width: min(700px, calc(100vw - 2rem));
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.5);
}
.eyebrow {
  margin: 0 0 0.5rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 0.7rem;
  color: #93c5fd;
}
h1 {
  margin: 0 0 0.75rem;
  font-size: clamp(2rem, 4vw, 3.25rem);
}
ul {
  padding-left: 1.25rem;
  line-height: 1.8;
}
button {
  margin-top: 1rem;
  border: 0;
  border-radius: 0.5rem;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 0.7rem 1rem;
}
button:disabled { cursor: wait; opacity: 0.7; }
.status { min-height: 1.5rem; margin: 1rem 0 0; }
.success { color: #86efac; }
.error { color: #fca5a5; }
.neutral { color: #cbd5e1; }
</style>
