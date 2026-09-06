import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';

export function assertCloudinaryConfigured() {
  const configured =
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;

  if (!configured) {
    throw new AppError('Cloudinary is not configured.', {
      code: 'CLOUDINARY_NOT_CONFIGURED',
      statusCode: 503,
    });
  }
}
