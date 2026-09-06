BEGIN;

SELECT set_config('app.current_user_id', '00000000-0000-0000-0000-000000000001', true);
SELECT set_config('app.current_seller_id', '00000000-0000-0000-0000-000000000010', true);
SELECT set_config('app.current_role', 'seller', true);

SELECT app.current_user_id();
SELECT app.current_seller_id();
SELECT app.current_app_role();

ROLLBACK;
