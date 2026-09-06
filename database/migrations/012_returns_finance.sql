CREATE TABLE return_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'approved', 'rejected', 'received', 'inspected', 'completed', 'cancelled')),
  reason text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER return_requests_set_updated_at
BEFORE UPDATE ON return_requests
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE return_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_request_id uuid NOT NULL REFERENCES return_requests(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  condition text,
  inspection_result text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  method text NOT NULL CHECK (method IN ('paystack', 'wallet_credit', 'manual')),
  provider_reference text,
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'approved', 'rejected', 'processing', 'processed', 'failed')),
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER refunds_set_updated_at
BEFORE UPDATE ON refunds
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type text NOT NULL CHECK (scope_type IN ('platform', 'seller', 'category', 'subscription_plan')),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  subscription_plan_id uuid REFERENCES subscription_plans(id) ON DELETE CASCADE,
  percentage_rate numeric(8, 4) NOT NULL DEFAULT 0 CHECK (percentage_rate >= 0),
  flat_amount numeric(14, 2) NOT NULL DEFAULT 0 CHECK (flat_amount >= 0),
  withdrawal_fee numeric(14, 2) NOT NULL DEFAULT 0 CHECK (withdrawal_fee >= 0),
  priority integer NOT NULL DEFAULT 100,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE TRIGGER commission_rules_set_updated_at
BEFORE UPDATE ON commission_rules
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  order_item_id uuid REFERENCES order_items(id) ON DELETE SET NULL,
  rule_id uuid REFERENCES commission_rules(id) ON DELETE SET NULL,
  amount numeric(14, 2) NOT NULL CHECK (amount >= 0),
  rate_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type text NOT NULL CHECK (owner_type IN ('seller', 'customer', 'platform')),
  owner_id uuid NOT NULL,
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  currency char(3) NOT NULL DEFAULT 'NGN',
  available_balance numeric(14, 2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
  pending_balance numeric(14, 2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_type, owner_id, currency)
);

CREATE TRIGGER wallets_set_updated_at
BEFORE UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  seller_id uuid REFERENCES sellers(id) ON DELETE RESTRICT,
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'hold', 'release', 'payout', 'refund', 'commission')),
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  balance_before numeric(14, 2) NOT NULL CHECK (balance_before >= 0),
  balance_after numeric(14, 2) NOT NULL CHECK (balance_after >= 0),
  reference_type text,
  reference_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  fee numeric(14, 2) NOT NULL DEFAULT 0 CHECK (fee >= 0),
  net_amount numeric(14, 2) NOT NULL CHECK (net_amount >= 0),
  status text NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'approved', 'rejected', 'processing', 'paid', 'failed', 'cancelled')),
  provider_reference text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (net_amount = amount - fee)
);

CREATE TRIGGER payout_requests_set_updated_at
BEFORE UPDATE ON payout_requests
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();
