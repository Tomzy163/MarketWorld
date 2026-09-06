export async function createRefreshToken(client, input) {
  const result = await client.query(
    `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, expires_at, created_at, last_used_at
    `,
    [input.userId, input.tokenHash, input.expiresAt, input.userAgent || null, input.ipHash || null],
  );

  return result.rows[0];
}

export async function findUsableRefreshToken(client, tokenHash) {
  const result = await client.query(
    `
      SELECT id, user_id, token_hash, expires_at, revoked_at, created_at, last_used_at
      FROM refresh_tokens
      WHERE token_hash = $1
        AND revoked_at IS NULL
        AND expires_at > now()
      LIMIT 1
    `,
    [tokenHash],
  );

  return result.rows[0] || null;
}

export async function markRefreshTokenUsed(client, tokenId) {
  await client.query('UPDATE refresh_tokens SET last_used_at = now() WHERE id = $1', [tokenId]);
}

export async function revokeRefreshToken(client, tokenId) {
  await client.query('UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, now()) WHERE id = $1', [
    tokenId,
  ]);
}

export async function revokeRefreshTokenByHash(client, tokenHash) {
  await client.query(
    'UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, now()) WHERE token_hash = $1',
    [tokenHash],
  );
}

export async function revokeAllRefreshTokensForUser(client, userId) {
  await client.query(
    'UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, now()) WHERE user_id = $1',
    [userId],
  );
}

export async function listSessionsForUser(client, userId) {
  const result = await client.query(
    `
      SELECT id, expires_at, revoked_at, created_at, last_used_at, user_agent
      FROM refresh_tokens
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId],
  );

  return result.rows;
}

export async function revokeSessionForUser(client, userId, tokenId) {
  const result = await client.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = COALESCE(revoked_at, now())
      WHERE user_id = $1 AND id = $2
      RETURNING id
    `,
    [userId, tokenId],
  );

  return result.rowCount > 0;
}

export async function createEmailVerificationToken(client, input) {
  await client.query(
    `
      INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
    `,
    [input.userId, input.tokenHash, input.expiresAt],
  );
}

export async function consumeEmailVerificationToken(client, tokenHash) {
  const result = await client.query(
    `
      UPDATE email_verification_tokens
      SET used_at = now()
      WHERE token_hash = $1
        AND used_at IS NULL
        AND expires_at > now()
      RETURNING user_id
    `,
    [tokenHash],
  );

  return result.rows[0] || null;
}

export async function createPasswordResetToken(client, input) {
  await client.query(
    `
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
    `,
    [input.userId, input.tokenHash, input.expiresAt],
  );
}

export async function consumePasswordResetToken(client, tokenHash) {
  const result = await client.query(
    `
      UPDATE password_reset_tokens
      SET used_at = now()
      WHERE token_hash = $1
        AND used_at IS NULL
        AND expires_at > now()
      RETURNING user_id
    `,
    [tokenHash],
  );

  return result.rows[0] || null;
}
