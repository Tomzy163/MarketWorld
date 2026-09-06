import { withTransaction } from '../../db/transaction.js';
import { enqueueJob } from '../../repositories/job.repository.js';

export async function enqueueBackgroundJob(input, context) {
  return withTransaction((client) => enqueueJob(client, input), context);
}
