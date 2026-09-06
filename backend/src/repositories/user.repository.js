export async function findUserByEmail(client, email) {
  const result = await client.query(
    `
      SELECT id, email, phone, password_hash, first_name, last_name, role, status,
             email_verified_at, last_login_at, created_at, updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email],
  );

  return result.rows[0] || null;
}

export async function findUserById(client, id) {
  const result = await client.query(
    `
      SELECT id, email, phone, first_name, last_name, role, status,
             email_verified_at, last_login_at, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] || null;
}

export async function createUser(client, input) {
  const result = await client.query(
    `
      INSERT INTO users (email, phone, password_hash, first_name, last_name, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, phone, first_name, last_name, role, status,
                email_verified_at, last_login_at, created_at, updated_at
    `,
    [
      input.email,
      input.phone || null,
      input.passwordHash,
      input.firstName,
      input.lastName,
      input.role,
      input.status,
    ],
  );

  return result.rows[0];
}

export async function updateUserLastLogin(client, userId) {
  await client.query('UPDATE users SET last_login_at = now() WHERE id = $1', [userId]);
}

export async function activateVerifiedUser(client, userId) {
  const result = await client.query(
    `
      UPDATE users
      SET email_verified_at = COALESCE(email_verified_at, now()),
          status = CASE WHEN status = 'pending_verification' THEN 'active' ELSE status END
      WHERE id = $1
      RETURNING id, email, phone, first_name, last_name, role, status,
                email_verified_at, last_login_at, created_at, updated_at
    `,
    [userId],
  );

  return result.rows[0] || null;
}

export async function updateUserProfile(client, userId, input) {
  const result = await client.query(
    `
      UPDATE users
      SET first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          phone = COALESCE($4, phone)
      WHERE id = $1
      RETURNING id, email, phone, first_name, last_name, role, status,
                email_verified_at, last_login_at, created_at, updated_at
    `,
    [userId, input.firstName ?? null, input.lastName ?? null, input.phone ?? null],
  );

  return result.rows[0] || null;
}

export async function updateUserPassword(client, userId, passwordHash) {
  await client.query('UPDATE users SET password_hash = $2 WHERE id = $1', [userId, passwordHash]);
}

export async function createCustomerProfile(client, userId) {
  const result = await client.query(
    `
      INSERT INTO customers (user_id, status)
      VALUES ($1, 'active')
      RETURNING id, user_id, status, created_at, updated_at
    `,
    [userId],
  );

  return result.rows[0];
}

export async function getIdentityContext(client, userId) {
  const result = await client.query(
    `
      SELECT
        u.id,
        u.email,
        u.phone,
        u.first_name,
        u.last_name,
        u.role,
        u.status,
        u.email_verified_at,
        s.id AS seller_id,
        c.id AS customer_id,
        active_agent.seller_id AS agent_seller_id
      FROM users u
      LEFT JOIN sellers s ON s.owner_user_id = u.id
      LEFT JOIN customers c ON c.user_id = u.id
      LEFT JOIN LATERAL (
        SELECT seller_id
        FROM seller_agents
        WHERE user_id = u.id AND status = 'active'
        ORDER BY created_at ASC
        LIMIT 1
      ) active_agent ON true
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId],
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    user: {
      id: row.id,
      email: row.email,
      phone: row.phone,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      status: row.status,
      emailVerifiedAt: row.email_verified_at,
    },
    sellerId: row.seller_id || row.agent_seller_id || null,
    customerId: row.customer_id || null,
  };
}
