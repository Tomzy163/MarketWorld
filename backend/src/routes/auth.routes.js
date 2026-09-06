import { Router } from 'express';
import {
  forgotPasswordController,
  googleOAuthController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  resetPasswordController,
  verifyEmailController,
} from '../controllers/auth.controller.js';
import { authRateLimit } from '../middleware/rate-limits.js';
import { validate } from '../middleware/validate.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/register', authRateLimit, validate(registerSchema), registerController);
authRouter.post('/login', authRateLimit, validate(loginSchema), loginController);
authRouter.post('/refresh', authRateLimit, refreshController);
authRouter.post('/logout', logoutController);
authRouter.post('/forgot-password', authRateLimit, validate(forgotPasswordSchema), forgotPasswordController);
authRouter.post('/reset-password', authRateLimit, validate(resetPasswordSchema), resetPasswordController);
authRouter.get('/verify-email', authRateLimit, validate(verifyEmailSchema), verifyEmailController);
authRouter.get('/google', googleOAuthController);
authRouter.get('/google/callback', googleOAuthController);
