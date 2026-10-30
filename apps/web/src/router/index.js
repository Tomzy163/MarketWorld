import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/auth/LoginView.vue';
import RegisterView from '../views/auth/RegisterView.vue';
import DashboardView from '../views/dashboard/DashboardView.vue';
import StorefrontView from '../views/storefront/StorefrontView.vue';
import NotFoundView from '../views/NotFoundView.vue';
import { useAuthStore } from '../stores/auth.store.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guest: true } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/store/:slug', name: 'storefront', component: StorefrontView, props: true },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (auth.accessToken && !auth.user) await auth.restore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.guest && auth.isAuthenticated) return { name: 'dashboard' };
  return true;
});

export default router;
