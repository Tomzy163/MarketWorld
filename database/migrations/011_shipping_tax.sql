CREATE TABLE shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  carrier text,
  fee numeric(14, 2) NOT NULL DEFAULT 0 CHECK (fee >= 0),
  estimated_min_days integer CHECK (estimated_min_days IS NULL OR estimated_min_days >= 0),
  estimated_max_days integer CHECK (estimated_max_days IS NULL OR estimated_max_days >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    estimated_min_days IS NULL
    OR estimated_max_days IS NULL
    OR estimated_max_days >= estimated_min_days
  )
);

CREATE TRIGGER shipping_methods_set_updated_at
BEFORE UPDATE ON shipping_methods
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  name text NOT NULL,
  countries text[] NOT NULL DEFAULT '{}',
  states text[] NOT NULL DEFAULT '{}',
  cities text[] NOT NULL DEFAULT '{}',
  postal_codes text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER shipping_zones_set_updated_at
BEFORE UPDATE ON shipping_zones
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  carrier text,
  tracking_number text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'returned')),
  estimated_delivery_at timestamptz,
  delivered_at timestamptz,
  delivery_proof_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER shipments_set_updated_at
BEFORE UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
  status text NOT NULL,
  location text,
  description text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tax_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  country text NOT NULL,
  region text,
  tax_type text NOT NULL CHECK (tax_type IN ('vat', 'gst', 'sales_tax')),
  rate numeric(8, 4) NOT NULL CHECK (rate >= 0),
  priority integer NOT NULL DEFAULT 100,
  is_exempt boolean NOT NULL DEFAULT false,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE TRIGGER tax_rules_set_updated_at
BEFORE UPDATE ON tax_rules
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE tax_exemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  reason text NOT NULL,
  certificate_reference text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER tax_exemptions_set_updated_at
BEFORE UPDATE ON tax_exemptions
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();
