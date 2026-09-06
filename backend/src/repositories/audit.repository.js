export async function writeAuditLog(client, input) {
  await client.query(
    `
      INSERT INTO audit_logs (
        actor_user_id,
        seller_id,
        action,
        resource_type,
        resource_id,
        ip_hash,
        user_agent,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      input.actorUserId || null,
      input.sellerId || null,
      input.action,
      input.resourceType,
      input.resourceId || null,
      input.ipHash || null,
      input.userAgent || null,
      JSON.stringify(input.metadata || {}),
    ],
  );
}
