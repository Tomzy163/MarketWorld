import { Router } from 'express';
import {
  changePasswordController,
  meController,
  revokeSessionController,
  sessionsController,
  updateMeController,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  changePasswordSchema,
  sessionIdSchema,
  updateMeSchema,
} from '../validators/user.validator.js';

export const userRouter = Router();

userRouter.use(authenticate);
userRouter.get('/me', meController);
userRouter.patch('/me', validate(updateMeSchema), updateMeController);
userRouter.patch('/me/password', validate(changePasswordSchema), changePasswordController);
userRouter.get('/me/sessions', sessionsController);
userRouter.delete('/me/sessions/:id', validate(sessionIdSchema), revokeSessionController);
