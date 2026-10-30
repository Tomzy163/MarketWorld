<template><AppShell><section class="form-card"><p class="eyebrow">Account</p><h1>Sign in</h1><form @submit.prevent="submit"><label>Email<input v-model.trim="email" type="email" required autocomplete="email" /></label><label>Password<input v-model="password" type="password" required autocomplete="current-password" /></label><p v-if="error" class="error" role="alert">{{ error }}</p><button class="button" :disabled="auth.loading">{{ auth.loading ? 'Signing in…' : 'Sign in' }}</button></form><p>New here? <RouterLink to="/register">Create an account</RouterLink>.</p></section></AppShell></template>
<script setup>
import { ref } from 'vue'; import { useRouter } from 'vue-router'; import AppShell from '../../components/common/AppShell.vue'; import { useAuthStore } from '../../stores/auth.store.js';
const auth = useAuthStore(); const router = useRouter(); const email = ref(''); const password = ref(''); const error = ref('');
async function submit() { error.value = ''; try { await auth.login({ email: email.value, password: password.value }); router.push('/dashboard'); } catch (err) { error.value = err.message; } }
</script>
