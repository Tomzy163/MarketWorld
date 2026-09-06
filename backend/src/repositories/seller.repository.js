import { toSlug } from '../utils/slug.js';

export async function createSellerWithStore(client, input) {
  const sellerResult = await client.query(
    `
      INSERT INTO sellers (owner_user_id, business_name, legal_name, status, verification_status)
      VALUES ($1, $2, $3, 'trialing', 'unverified')
      RETURNING id, owner_user_id, business_name, legal_name, status, verification_status,
                verified_at, created_at, updated_at
    `,
    [input.ownerUserId, input.businessName, input.legalName || input.businessName],
  );

  const seller = sellerResult.rows[0];
  const baseSlug = toSlug(input.storeSlug || input.businessName);
  const slug = await reserveStoreSlug(client, baseSlug || `store-${seller.id.slice(0, 8)}`);

  const storeResult = await client.query(
    `
      INSERT INTO stores (seller_id, slug, name, description, status)
      VALUES ($1, $2, $3, $4, 'draft')
      RETURNING id, seller_id, slug, name, description, status, created_at, updated_at
    `,
    [seller.id, slug, input.storeName || input.businessName, input.storeDescription || null],
  );

  return {
    seller,
    store: storeResult.rows[0],
  };
}

export async function createTrialSubscription(client, input) {
  const planResult = await client.query(
    `
      SELECT id
      FROM subscription_plans
      WHERE lower(name) = lower($1) AND status = 'active'
      LIMIT 1
    `,
    [input.planName],
  );

  const planId = planResult.rows[0]?.id || null;
  const result = await client.query(
    `
      INSERT INTO subscriptions (
        seller_id,
        plan_id,
        provider,
        status,
        trial_started_at,
        trial_ends_at,
        current_period_start,
        current_period_end
      )
      VALUES ($1, $2, 'internal', 'trialing', now(), now() + ($3::text || ' days')::interval, now(),
              now() + ($3::text || ' days')::interval)
      RETURNING id, seller_id, plan_id, provider, status, trial_started_at, trial_ends_at,
                current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at
    `,
    [input.sellerId, planId, input.trialDays],
  );

  return result.rows[0];
}

async function reserveStoreSlug(client, baseSlug) {
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await client.query('SELECT 1 FROM stores WHERE slug = $1 LIMIT 1', [candidate]);
    if (existing.rowCount === 0) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
