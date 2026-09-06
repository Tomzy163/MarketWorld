ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select_self_or_admin ON users
FOR SELECT USING (app.is_internal_actor() OR id = app.current_user_id());
CREATE POLICY users_insert_registration ON users
FOR INSERT WITH CHECK (role IN ('customer', 'seller', 'agent'));
CREATE POLICY users_update_self_or_admin ON users
FOR UPDATE USING (app.is_internal_actor() OR id = app.current_user_id())
WITH CHECK (app.is_internal_actor() OR id = app.current_user_id());

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY refresh_tokens_self ON refresh_tokens
FOR SELECT USING (app.is_internal_actor() OR user_id = app.current_user_id());
CREATE POLICY refresh_tokens_insert_self ON refresh_tokens
FOR INSERT WITH CHECK (app.is_internal_actor() OR user_id = app.current_user_id());
CREATE POLICY refresh_tokens_update_self ON refresh_tokens
FOR UPDATE USING (app.is_internal_actor() OR user_id = app.current_user_id())
WITH CHECK (app.is_internal_actor() OR user_id = app.current_user_id());

ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_verification_tokens_self ON email_verification_tokens
FOR SELECT USING (app.is_internal_actor() OR user_id = app.current_user_id());
CREATE POLICY email_verification_tokens_insert ON email_verification_tokens
FOR INSERT WITH CHECK (true);
CREATE POLICY email_verification_tokens_update_self ON email_verification_tokens
FOR UPDATE USING (app.is_internal_actor() OR user_id = app.current_user_id())
WITH CHECK (app.is_internal_actor() OR user_id = app.current_user_id());

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY password_reset_tokens_self ON password_reset_tokens
FOR SELECT USING (app.is_internal_actor() OR user_id = app.current_user_id());
CREATE POLICY password_reset_tokens_insert ON password_reset_tokens
FOR INSERT WITH CHECK (true);
CREATE POLICY password_reset_tokens_update_self ON password_reset_tokens
FOR UPDATE USING (app.is_internal_actor() OR user_id = app.current_user_id())
WITH CHECK (app.is_internal_actor() OR user_id = app.current_user_id());

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_read_authenticated ON roles
FOR SELECT USING (app.current_user_id() IS NOT NULL OR app.is_internal_actor());

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY permissions_read_authenticated ON permissions
FOR SELECT USING (app.current_user_id() IS NOT NULL OR app.is_internal_actor());

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY role_permissions_read_authenticated ON role_permissions
FOR SELECT USING (app.current_user_id() IS NOT NULL OR app.is_internal_actor());

ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_permissions_self_or_admin ON user_permissions
FOR SELECT USING (app.is_internal_actor() OR user_id = app.current_user_id());
CREATE POLICY user_permissions_admin_insert ON user_permissions
FOR INSERT WITH CHECK (app.is_internal_actor());
CREATE POLICY user_permissions_admin_update ON user_permissions
FOR UPDATE USING (app.is_internal_actor()) WITH CHECK (app.is_internal_actor());
CREATE POLICY user_permissions_admin_delete ON user_permissions
FOR DELETE USING (app.is_internal_actor());

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY sellers_select_owned_agent_or_admin ON sellers
FOR SELECT USING (
  app.is_internal_actor()
  OR owner_user_id = app.current_user_id()
  OR id = app.current_seller_id()
);
CREATE POLICY sellers_insert_owner ON sellers
FOR INSERT WITH CHECK (owner_user_id = app.current_user_id() OR app.is_internal_actor());
CREATE POLICY sellers_update_owner_or_admin ON sellers
FOR UPDATE USING (app.is_internal_actor() OR owner_user_id = app.current_user_id())
WITH CHECK (app.is_internal_actor() OR owner_user_id = app.current_user_id());

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_select_self_seller_or_admin ON customers
FOR SELECT USING (
  app.is_internal_actor()
  OR user_id = app.current_user_id()
  OR EXISTS (
    SELECT 1 FROM seller_customers
    WHERE seller_customers.customer_id = customers.id
      AND seller_customers.seller_id = app.current_seller_id()
  )
);
CREATE POLICY customers_insert_self ON customers
FOR INSERT WITH CHECK (app.is_internal_actor() OR user_id = app.current_user_id());
CREATE POLICY customers_update_self_or_admin ON customers
FOR UPDATE USING (app.is_internal_actor() OR user_id = app.current_user_id())
WITH CHECK (app.is_internal_actor() OR user_id = app.current_user_id());

ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY customer_addresses_select_owner_or_admin ON customer_addresses
FOR SELECT USING (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_addresses.customer_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY customer_addresses_insert_owner ON customer_addresses
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_addresses.customer_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY customer_addresses_update_owner ON customer_addresses
FOR UPDATE USING (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_addresses.customer_id
      AND customers.user_id = app.current_user_id()
  )
) WITH CHECK (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_addresses.customer_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY customer_addresses_delete_owner ON customer_addresses
FOR DELETE USING (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = customer_addresses.customer_id
      AND customers.user_id = app.current_user_id()
  )
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY cart_items_customer_or_admin ON cart_items
FOR SELECT USING (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1
    FROM carts
    JOIN customers ON customers.id = carts.customer_id
    WHERE carts.id = cart_items.cart_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY cart_items_customer_insert ON cart_items
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1
    FROM carts
    JOIN customers ON customers.id = carts.customer_id
    WHERE carts.id = cart_items.cart_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY cart_items_customer_update ON cart_items
FOR UPDATE USING (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1
    FROM carts
    JOIN customers ON customers.id = carts.customer_id
    WHERE carts.id = cart_items.cart_id
      AND customers.user_id = app.current_user_id()
  )
) WITH CHECK (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1
    FROM carts
    JOIN customers ON customers.id = carts.customer_id
    WHERE carts.id = cart_items.cart_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY cart_items_customer_delete ON cart_items
FOR DELETE USING (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1
    FROM carts
    JOIN customers ON customers.id = carts.customer_id
    WHERE carts.id = cart_items.cart_id
      AND customers.user_id = app.current_user_id()
  )
);

ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY return_items_select_related ON return_items
FOR SELECT USING (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM return_requests
    WHERE return_requests.id = return_items.return_request_id
      AND (
        return_requests.seller_id = app.current_seller_id()
        OR EXISTS (
          SELECT 1 FROM customers
          WHERE customers.id = return_requests.customer_id
            AND customers.user_id = app.current_user_id()
        )
      )
  )
);
CREATE POLICY return_items_insert_related ON return_items
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM return_requests
    WHERE return_requests.id = return_items.return_request_id
      AND return_requests.seller_id = app.current_seller_id()
  )
);

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'stores',
    'domains',
    'seller_agents',
    'agent_activity',
    'seller_customers',
    'brands',
    'product_media',
    'inventory',
    'inventory_movements',
    'payments',
    'shipping_methods',
    'shipping_zones',
    'shipments',
    'shipment_events',
    'tax_exemptions',
    'return_requests',
    'refunds',
    'commissions',
    'payout_requests',
    'review_reports',
    'support_tickets',
    'support_ticket_attachments',
    'conversations',
    'conversation_participants',
    'messages',
    'message_attachments',
    'subscription_events',
    'seller_verifications',
    'verification_documents',
    'analytics_daily_seller'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (app.is_internal_actor() OR seller_id = app.current_seller_id())',
      table_name || '_tenant_select',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (app.is_internal_actor() OR seller_id = app.current_seller_id())',
      table_name || '_tenant_insert',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE USING (app.is_internal_actor() OR seller_id = app.current_seller_id()) WITH CHECK (app.is_internal_actor() OR seller_id = app.current_seller_id())',
      table_name || '_tenant_update',
      table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR DELETE USING (app.is_internal_actor() OR (app.current_app_role() = ''seller'' AND seller_id = app.current_seller_id()))',
      table_name || '_tenant_delete',
      table_name
    );
  END LOOP;
END $$;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_public_or_tenant_select ON categories
FOR SELECT USING (seller_id IS NULL OR app.is_internal_actor() OR seller_id = app.current_seller_id());
CREATE POLICY categories_tenant_insert ON categories
FOR INSERT WITH CHECK (app.is_internal_actor() OR seller_id = app.current_seller_id());
CREATE POLICY categories_tenant_update ON categories
FOR UPDATE USING (app.is_internal_actor() OR seller_id = app.current_seller_id())
WITH CHECK (app.is_internal_actor() OR seller_id = app.current_seller_id());
CREATE POLICY categories_tenant_delete ON categories
FOR DELETE USING (app.is_internal_actor() OR seller_id = app.current_seller_id());

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_public_or_tenant_select ON products
FOR SELECT USING (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR (status = 'active' AND moderation_status = 'approved')
);
CREATE POLICY products_tenant_insert ON products
FOR INSERT WITH CHECK (app.is_internal_actor() OR seller_id = app.current_seller_id());
CREATE POLICY products_tenant_update ON products
FOR UPDATE USING (app.is_internal_actor() OR seller_id = app.current_seller_id())
WITH CHECK (app.is_internal_actor() OR seller_id = app.current_seller_id());
CREATE POLICY products_tenant_delete ON products
FOR DELETE USING (app.is_internal_actor() OR seller_id = app.current_seller_id());

ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_tags_public_or_tenant_select ON product_tags
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_tags.product_id
      AND (
        app.is_internal_actor()
        OR products.seller_id = app.current_seller_id()
        OR (products.status = 'active' AND products.moderation_status = 'approved')
      )
  )
);
CREATE POLICY product_tags_tenant_insert ON product_tags
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_tags.product_id
      AND (app.is_internal_actor() OR products.seller_id = app.current_seller_id())
  )
);
CREATE POLICY product_tags_tenant_delete ON product_tags
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_tags.product_id
      AND (app.is_internal_actor() OR products.seller_id = app.current_seller_id())
  )
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_variants_public_or_tenant_select ON product_variants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
      AND (
        app.is_internal_actor()
        OR products.seller_id = app.current_seller_id()
        OR (products.status = 'active' AND products.moderation_status = 'approved')
      )
  )
);
CREATE POLICY product_variants_tenant_insert ON product_variants
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
      AND (app.is_internal_actor() OR products.seller_id = app.current_seller_id())
  )
);
CREATE POLICY product_variants_tenant_update ON product_variants
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
      AND (app.is_internal_actor() OR products.seller_id = app.current_seller_id())
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
      AND (app.is_internal_actor() OR products.seller_id = app.current_seller_id())
  )
);
CREATE POLICY product_variants_tenant_delete ON product_variants
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_variants.product_id
      AND (app.is_internal_actor() OR products.seller_id = app.current_seller_id())
  )
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY carts_customer_or_admin_select ON carts
FOR SELECT USING (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = carts.customer_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY carts_customer_insert ON carts
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = carts.customer_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY carts_customer_update ON carts
FOR UPDATE USING (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = carts.customer_id
      AND customers.user_id = app.current_user_id()
  )
) WITH CHECK (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = carts.customer_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY carts_customer_delete ON carts
FOR DELETE USING (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = carts.customer_id
      AND customers.user_id = app.current_user_id()
  )
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_seller_customer_or_admin_select ON orders
FOR SELECT USING (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = orders.customer_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY orders_customer_or_admin_insert ON orders
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = orders.customer_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY orders_seller_update ON orders
FOR UPDATE USING (app.is_internal_actor() OR seller_id = app.current_seller_id())
WITH CHECK (app.is_internal_actor() OR seller_id = app.current_seller_id());

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_items_seller_customer_or_admin_select ON order_items
FOR SELECT USING (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR EXISTS (
    SELECT 1
    FROM orders
    JOIN customers ON customers.id = orders.customer_id
    WHERE orders.id = order_items.order_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY order_items_order_insert ON order_items
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR EXISTS (
    SELECT 1
    FROM orders
    JOIN customers ON customers.id = orders.customer_id
    WHERE orders.id = order_items.order_id
      AND customers.user_id = app.current_user_id()
  )
);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_status_history_seller_customer_or_admin_select ON order_status_history
FOR SELECT USING (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR EXISTS (
    SELECT 1
    FROM orders
    JOIN customers ON customers.id = orders.customer_id
    WHERE orders.id = order_status_history.order_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY order_status_history_insert_seller_or_admin ON order_status_history
FOR INSERT WITH CHECK (app.is_internal_actor() OR seller_id = app.current_seller_id());

ALTER TABLE tax_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tax_rules_public_or_tenant_select ON tax_rules
FOR SELECT USING (seller_id IS NULL OR app.is_internal_actor() OR seller_id = app.current_seller_id());
CREATE POLICY tax_rules_admin_or_tenant_insert ON tax_rules
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR (seller_id IS NOT NULL AND seller_id = app.current_seller_id())
);
CREATE POLICY tax_rules_admin_or_tenant_update ON tax_rules
FOR UPDATE USING (
  app.is_internal_actor()
  OR (seller_id IS NOT NULL AND seller_id = app.current_seller_id())
) WITH CHECK (
  app.is_internal_actor()
  OR (seller_id IS NOT NULL AND seller_id = app.current_seller_id())
);
CREATE POLICY tax_rules_admin_or_tenant_delete ON tax_rules
FOR DELETE USING (
  app.is_internal_actor()
  OR (seller_id IS NOT NULL AND seller_id = app.current_seller_id())
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallets_owner_seller_or_admin_select ON wallets
FOR SELECT USING (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR owner_id = app.current_user_id()
);
CREATE POLICY wallets_owner_seller_or_admin_insert ON wallets
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR owner_id = app.current_user_id()
);
CREATE POLICY wallets_owner_seller_or_admin_update ON wallets
FOR UPDATE USING (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
) WITH CHECK (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallet_transactions_owner_seller_or_admin_select ON wallet_transactions
FOR SELECT USING (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR EXISTS (
    SELECT 1 FROM wallets
    WHERE wallets.id = wallet_transactions.wallet_id
      AND wallets.owner_id = app.current_user_id()
  )
);
CREATE POLICY wallet_transactions_insert_system_or_admin ON wallet_transactions
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR EXISTS (
    SELECT 1 FROM wallets
    WHERE wallets.id = wallet_transactions.wallet_id
      AND wallets.owner_id = app.current_user_id()
  )
);

ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY support_ticket_messages_select_visible ON support_ticket_messages
FOR SELECT USING (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR (
    is_internal = false
    AND EXISTS (
      SELECT 1
      FROM support_tickets
      JOIN customers ON customers.id = support_tickets.customer_id
      WHERE support_tickets.id = support_ticket_messages.ticket_id
        AND customers.user_id = app.current_user_id()
    )
  )
);
CREATE POLICY support_ticket_messages_insert_related ON support_ticket_messages
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR (
    is_internal = false
    AND EXISTS (
      SELECT 1
      FROM support_tickets
      JOIN customers ON customers.id = support_tickets.customer_id
      WHERE support_tickets.id = support_ticket_messages.ticket_id
        AND customers.user_id = app.current_user_id()
    )
  )
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_user_or_admin_select ON notifications
FOR SELECT USING (app.is_internal_actor() OR user_id = app.current_user_id());
CREATE POLICY notifications_insert_tenant_or_admin ON notifications
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR user_id = app.current_user_id()
  OR seller_id = app.current_seller_id()
);
CREATE POLICY notifications_update_owner ON notifications
FOR UPDATE USING (app.is_internal_actor() OR user_id = app.current_user_id())
WITH CHECK (app.is_internal_actor() OR user_id = app.current_user_id());

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_preferences_owner_select ON notification_preferences
FOR SELECT USING (app.is_internal_actor() OR user_id = app.current_user_id());
CREATE POLICY notification_preferences_owner_insert ON notification_preferences
FOR INSERT WITH CHECK (app.is_internal_actor() OR user_id = app.current_user_id());
CREATE POLICY notification_preferences_owner_update ON notification_preferences
FOR UPDATE USING (app.is_internal_actor() OR user_id = app.current_user_id())
WITH CHECK (app.is_internal_actor() OR user_id = app.current_user_id());

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscription_plans_public_select ON subscription_plans
FOR SELECT USING (status = 'active' OR app.is_internal_actor());
CREATE POLICY subscription_plans_admin_insert ON subscription_plans
FOR INSERT WITH CHECK (app.is_internal_actor());
CREATE POLICY subscription_plans_admin_update ON subscription_plans
FOR UPDATE USING (app.is_internal_actor()) WITH CHECK (app.is_internal_actor());
CREATE POLICY subscription_plans_admin_delete ON subscription_plans
FOR DELETE USING (app.is_internal_actor());

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_tenant_or_admin_select ON subscriptions
FOR SELECT USING (app.is_internal_actor() OR seller_id = app.current_seller_id());
CREATE POLICY subscriptions_tenant_or_admin_insert ON subscriptions
FOR INSERT WITH CHECK (app.is_internal_actor() OR seller_id = app.current_seller_id());
CREATE POLICY subscriptions_tenant_or_admin_update ON subscriptions
FOR UPDATE USING (app.is_internal_actor() OR seller_id = app.current_seller_id())
WITH CHECK (app.is_internal_actor() OR seller_id = app.current_seller_id());

ALTER TABLE fraud_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY fraud_events_admin_select ON fraud_events
FOR SELECT USING (app.is_internal_actor());
CREATE POLICY fraud_events_insert_system ON fraud_events
FOR INSERT WITH CHECK (true);
CREATE POLICY fraud_events_admin_update ON fraud_events
FOR UPDATE USING (app.is_internal_actor()) WITH CHECK (app.is_internal_actor());

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_admin_or_actor_select ON audit_logs
FOR SELECT USING (
  app.is_internal_actor()
  OR actor_user_id = app.current_user_id()
  OR seller_id = app.current_seller_id()
);
CREATE POLICY audit_logs_insert_system ON audit_logs
FOR INSERT WITH CHECK (true);

ALTER TABLE impersonation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY impersonation_sessions_super_admin_select ON impersonation_sessions
FOR SELECT USING (app.current_app_role() = 'super_admin');
CREATE POLICY impersonation_sessions_super_admin_insert ON impersonation_sessions
FOR INSERT WITH CHECK (app.current_app_role() = 'super_admin');
CREATE POLICY impersonation_sessions_super_admin_update ON impersonation_sessions
FOR UPDATE USING (app.current_app_role() = 'super_admin')
WITH CHECK (app.current_app_role() = 'super_admin');

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY feature_flags_admin_select ON feature_flags
FOR SELECT USING (app.is_internal_actor());
CREATE POLICY feature_flags_super_admin_write ON feature_flags
FOR ALL USING (app.current_app_role() = 'super_admin')
WITH CHECK (app.current_app_role() = 'super_admin');

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY system_settings_admin_select_non_sensitive ON system_settings
FOR SELECT USING (app.current_app_role() = 'super_admin' OR (app.is_internal_actor() AND is_sensitive = false));
CREATE POLICY system_settings_super_admin_write ON system_settings
FOR ALL USING (app.current_app_role() = 'super_admin')
WITH CHECK (app.current_app_role() = 'super_admin');

ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY background_jobs_admin_or_tenant_select ON background_jobs
FOR SELECT USING (app.is_internal_actor() OR seller_id = app.current_seller_id());
CREATE POLICY background_jobs_insert_tenant_or_system ON background_jobs
FOR INSERT WITH CHECK (app.is_internal_actor() OR seller_id IS NULL OR seller_id = app.current_seller_id());
CREATE POLICY background_jobs_admin_update ON background_jobs
FOR UPDATE USING (app.is_internal_actor()) WITH CHECK (app.is_internal_actor());

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY payment_events_admin_select ON payment_events
FOR SELECT USING (app.is_internal_actor());
CREATE POLICY payment_events_insert_webhook ON payment_events
FOR INSERT WITH CHECK (true);
CREATE POLICY payment_events_admin_update ON payment_events
FOR UPDATE USING (app.is_internal_actor()) WITH CHECK (app.is_internal_actor());

ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY commission_rules_admin_or_own_impact_select ON commission_rules
FOR SELECT USING (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR scope_type IN ('platform', 'subscription_plan')
);
CREATE POLICY commission_rules_admin_insert ON commission_rules
FOR INSERT WITH CHECK (app.is_internal_actor());
CREATE POLICY commission_rules_admin_update ON commission_rules
FOR UPDATE USING (app.is_internal_actor()) WITH CHECK (app.is_internal_actor());
CREATE POLICY commission_rules_admin_delete ON commission_rules
FOR DELETE USING (app.is_internal_actor());

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY reviews_public_seller_customer_or_admin_select ON reviews
FOR SELECT USING (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR status = 'published'
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = reviews.customer_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY reviews_customer_insert ON reviews
FOR INSERT WITH CHECK (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = reviews.customer_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY reviews_customer_update ON reviews
FOR UPDATE USING (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = reviews.customer_id
      AND customers.user_id = app.current_user_id()
  )
) WITH CHECK (
  app.is_internal_actor()
  OR seller_id = app.current_seller_id()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = reviews.customer_id
      AND customers.user_id = app.current_user_id()
  )
);
CREATE POLICY reviews_customer_delete ON reviews
FOR DELETE USING (
  app.is_internal_actor()
  OR EXISTS (
    SELECT 1 FROM customers
    WHERE customers.id = reviews.customer_id
      AND customers.user_id = app.current_user_id()
  )
);

ALTER TABLE analytics_daily_platform ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_daily_platform_admin_select ON analytics_daily_platform
FOR SELECT USING (app.is_internal_actor());
CREATE POLICY analytics_daily_platform_admin_insert ON analytics_daily_platform
FOR INSERT WITH CHECK (app.is_internal_actor());
CREATE POLICY analytics_daily_platform_admin_update ON analytics_daily_platform
FOR UPDATE USING (app.is_internal_actor()) WITH CHECK (app.is_internal_actor());
