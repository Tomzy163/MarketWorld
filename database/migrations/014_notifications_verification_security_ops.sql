CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER notifications_set_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'push')),
  event_type text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, channel, event_type)
);

CREATE TRIGGER notification_preferences_set_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE seller_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('business', 'identity')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'needs_more_info')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  decision_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER seller_verifications_set_updated_at
BEFORE UPDATE ON seller_verifications
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  verification_id uuid NOT NULL REFERENCES seller_verifications(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  storage_key text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER verification_documents_set_updated_at
BEFORE UPDATE ON verification_documents
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE fraud_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES sellers(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  risk_score integer NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  ip_hash text,
  device_hash text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  seller_id uuid REFERENCES sellers(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  ip_hash text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  target_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  target_seller_id uuid REFERENCES sellers(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  ended_at timestamptz,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT false,
  scope text NOT NULL DEFAULT 'platform' CHECK (scope IN ('platform', 'seller', 'user')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER feature_flags_set_updated_at
BEFORE UPDATE ON feature_flags
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  is_sensitive boolean NOT NULL DEFAULT false,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE background_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue text NOT NULL,
  job_type text NOT NULL,
  seller_id uuid REFERENCES sellers(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  available_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  last_error text,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (queue, idempotency_key)
);

CREATE TRIGGER background_jobs_set_updated_at
BEFORE UPDATE ON background_jobs
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE analytics_daily_seller (
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  date date NOT NULL,
  revenue numeric(14, 2) NOT NULL DEFAULT 0,
  orders integer NOT NULL DEFAULT 0,
  customers integer NOT NULL DEFAULT 0,
  conversion_rate numeric(8, 4) NOT NULL DEFAULT 0,
  returns integer NOT NULL DEFAULT 0,
  profit numeric(14, 2) NOT NULL DEFAULT 0,
  inventory_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (seller_id, date)
);

CREATE TRIGGER analytics_daily_seller_set_updated_at
BEFORE UPDATE ON analytics_daily_seller
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE analytics_daily_platform (
  date date PRIMARY KEY,
  mrr numeric(14, 2) NOT NULL DEFAULT 0,
  arr numeric(14, 2) NOT NULL DEFAULT 0,
  active_sellers integer NOT NULL DEFAULT 0,
  active_customers integer NOT NULL DEFAULT 0,
  new_users integer NOT NULL DEFAULT 0,
  churn numeric(8, 4) NOT NULL DEFAULT 0,
  platform_revenue numeric(14, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER analytics_daily_platform_set_updated_at
BEFORE UPDATE ON analytics_daily_platform
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();
