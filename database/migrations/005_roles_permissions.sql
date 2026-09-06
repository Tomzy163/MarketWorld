CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text
);

CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  description text
);

CREATE TABLE role_permissions (
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_permissions (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, permission_id)
);

CREATE TABLE agent_permissions (
  agent_id uuid NOT NULL REFERENCES seller_agents(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, permission_id)
);

INSERT INTO roles (name, description)
VALUES
  ('customer', 'Customer account'),
  ('seller', 'Seller owner account'),
  ('agent', 'Seller customer-care agent'),
  ('admin', 'Platform administrator'),
  ('super_admin', 'Super administrator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (key, description)
VALUES
  ('auth.session.manage', 'Manage own authenticated sessions'),
  ('seller.store.manage', 'Manage own seller store'),
  ('seller.products.manage', 'Manage own seller products'),
  ('seller.inventory.manage', 'Manage own seller inventory'),
  ('seller.orders.manage', 'Manage own seller orders'),
  ('seller.support.manage', 'Manage own seller support tickets'),
  ('seller.agents.manage', 'Manage seller support agents'),
  ('admin.users.read', 'Read platform users'),
  ('admin.sellers.manage', 'Manage sellers'),
  ('admin.verifications.manage', 'Manage seller verification'),
  ('admin.audit.read', 'Read audit logs'),
  ('super_admin.system.manage', 'Manage platform configuration'),
  ('super_admin.impersonation.manage', 'Manage audited impersonation')
ON CONFLICT (key) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.key = 'auth.session.manage'
WHERE roles.name IN ('customer', 'seller', 'agent', 'admin', 'super_admin')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.key LIKE 'seller.%'
WHERE roles.name = 'seller'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.key IN ('seller.support.manage')
WHERE roles.name = 'agent'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
JOIN permissions ON permissions.key LIKE 'admin.%'
WHERE roles.name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT roles.id, permissions.id
FROM roles
CROSS JOIN permissions
WHERE roles.name = 'super_admin'
ON CONFLICT DO NOTHING;
