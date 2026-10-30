<template>
  <header class="app-header">
    <RouterLink class="brand" to="/">{{ config.name }}</RouterLink>
    <nav aria-label="Primary navigation">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/store/demo-store">Storefront</RouterLink>
      <RouterLink v-if="auth.isAuthenticated" to="/dashboard">Dashboard</RouterLink>
    </nav>
    <div class="header-actions">
      <span v-if="cart.count" class="cart-count" aria-label="Cart items">{{ cart.count }}</span>
      <RouterLink v-if="!auth.isAuthenticated" class="button subtle" to="/login">Sign in</RouterLink>
      <button v-else class="button subtle" type="button" @click="signOut">Sign out</button>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { appConfig as config } from '../../app/config.js';
import { useAuthStore } from '../../stores/auth.store.js';
import { useCartStore } from '../../stores/cart.store.js';

const router = useRouter();
const auth = useAuthStore();
const cart = useCartStore();
async function signOut() {
  await auth.logout();
  router.push('/');
}
</script>
