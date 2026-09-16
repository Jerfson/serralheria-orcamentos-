/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function sqliteApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-sqlite-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          try {
            const { handleApiRequest } = await import('./src/server/apiRouter.js');
            const handled = await handleApiRequest(req, res);
            if (handled) return;
          } catch (err) {
            console.error('Erro no plugin SQLite API:', err);
          }
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sqliteApiPlugin()],
  test: {
    globals: true,
    environment: 'node',
  },
});
