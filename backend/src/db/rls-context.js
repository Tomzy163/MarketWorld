export async function setRlsContext(client, context = {}) {
  const userId = context.userId || '';
  const sellerId = context.sellerId || '';
  const role = context.role || 'anonymous';

  await client.query('SELECT set_config($1, $2, true)', ['app.current_user_id', userId]);
  await client.query('SELECT set_config($1, $2, true)', ['app.current_seller_id', sellerId]);
  await client.query('SELECT set_config($1, $2, true)', ['app.current_role', role]);
}
