import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => {
  const rootDir = fileURLToPath(new URL('../..', import.meta.url));
  const env = loadEnv(mode, rootDir, '');
  const port = Number(env.WEB_PORT || 5173);

  return {
    plugins: [vue()],
    envDir: rootDir,
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
