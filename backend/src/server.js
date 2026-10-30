import http from 'node:http';
import { createApp } from './app.js';
import { env, assertProductionConfig } from './config/env.js';
import { logger } from './config/logger.js';
import { registerSocketServer } from './sockets/index.js';

assertProductionConfig();

const app = createApp();
const server = http.createServer(app);

registerSocketServer(server);

server.listen(env.PORT, () => {
  logger.info({ app: env.APP_NAME, port: env.PORT }, 'API listening');
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});
