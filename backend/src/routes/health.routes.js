import { Router } from 'express';
import { healthController, liveController, readyController } from '../controllers/health.controller.js';

export const healthRouter = Router();

healthRouter.get('/', healthController);
healthRouter.get('/live', liveController);
healthRouter.get('/ready', readyController);
