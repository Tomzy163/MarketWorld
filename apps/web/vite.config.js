import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, new URL('../..', import.meta.url).pathname, '');
  const port = Number(env.WEB_PORT || 5173);

  return {
    plugins: [vue()],
    server: {
      host: '0.0.0.0',
      port,
    },
    preview: {
      host: '0.0.0.0',
      port,
    },
  };
});
