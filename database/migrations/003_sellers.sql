CREATE TABLE sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  business_name text NOT NULL,
  legal_name text,
  status text NOT NULL DEFAULT 'trialing'
    CHECK (status IN ('trialing', 'active', 'suspended', 'closed')),
  verification_status text NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'approved', 'rejected')),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER sellers_set_updated_at
BEFORE UPDATE ON sellers
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL UNIQUE REFERENCES sellers(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  logo_url text,
  banner_url text,
  favicon_url text,
  theme_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  font_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  homepage_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  contact_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  business_hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'suspended', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER stores_set_updated_at
BEFORE UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  hostname citext NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('subdomain', 'custom')),
  verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'failed', 'revoked')),
  verification_token text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  verified_at timestamptz,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER domains_set_updated_at
BEFORE UPDATE ON domains
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE seller_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'active', 'inactive', 'removed')),
  display_name text,
  invited_by uuid REFERENCES users(id) ON DELETE SET NULL,
  activated_at timestamptz,
  deactivated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (seller_id, user_id)
);

CREATE TRIGGER seller_agents_set_updated_at
BEFORE UPDATE ON seller_agents
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE agent_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES seller_agents(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
