CREATE TABLE subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  price numeric(14, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  currency char(3) NOT NULL DEFAULT 'NGN',
  billing_interval text NOT NULL DEFAULT 'month'
    CHECK (billing_interval IN ('trial', 'month', 'year')),
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  commission_rate numeric(8, 4) NOT NULL DEFAULT 0 CHECK (commission_rate >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER subscription_plans_set_updated_at
BEFORE UPDATE ON subscription_plans
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

INSERT INTO subscription_plans (name, description, price, currency, billing_interval, features)
VALUES ('Trial', 'Default 30-day seller trial plan', 0, 'NGN', 'trial', '{"trial": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'internal',
  provider_reference text,
  status text NOT NULL DEFAULT 'trialing'
    CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX subscriptions_provider_reference_idx
ON subscriptions (provider, provider_reference)
WHERE provider_reference IS NOT NULL;

CREATE TRIGGER subscriptions_set_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  provider_event_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_event_id)
);
