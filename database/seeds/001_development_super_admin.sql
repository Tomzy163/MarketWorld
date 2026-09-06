INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  role,
  status,
  email_verified_at
)
VALUES (
  'admin@example.com',
  '$2b$12$replace_this_hash_before_local_use_only',
  'MarketWorld',
  'Admin',
  'super_admin',
  'disabled',
  now()
)
ON CONFLICT (email) DO NOTHING;
