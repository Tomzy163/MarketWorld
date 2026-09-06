import { logger } from '../../config/logger.js';

export async function processEmailJob(job) {
  logger.info({ jobId: job.id, jobType: job.job_type }, 'Email job reserved for delivery provider');
}
