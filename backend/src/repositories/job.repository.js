export async function enqueueJob(client, input) {
  const result = await client.query(
    `
      INSERT INTO background_jobs (
        queue,
        job_type,
        seller_id,
        payload,
        status,
        available_at,
        idempotency_key
      )
      VALUES ($1, $2, $3, $4, 'queued', COALESCE($5, now()), $6)
      ON CONFLICT (queue, idempotency_key)
      DO UPDATE SET available_at = LEAST(background_jobs.available_at, EXCLUDED.available_at)
      RETURNING id, queue, job_type, seller_id, status, available_at, created_at
    `,
    [
      input.queue,
      input.jobType,
      input.sellerId || null,
      JSON.stringify(input.payload || {}),
      input.availableAt || null,
      input.idempotencyKey,
    ],
  );

  return result.rows[0];
}
