import { getPool } from './pool.js';
import { setRlsContext } from './rls-context.js';

export async function withTransaction(work, context) {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');

    if (context) {
      await setRlsContext(client, context);
    }

    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
