import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';

export function assertEmailConfigured() {
  const hasSmtp = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.EMAIL_FROM;
  const hasSendGrid = env.SENDGRID_API_KEY && env.EMAIL_FROM;

  if (!hasSmtp && !hasSendGrid) {
    throw new AppError('Email delivery is not configured.', {
      code: 'EMAIL_NOT_CONFIGURED',
      statusCode: 503,
    });
  }
}
