export async function canUserAccessConversation(client, input) {
  if (['admin', 'super_admin'].includes(input.role)) {
    const result = await client.query('SELECT 1 FROM conversations WHERE id = $1 LIMIT 1', [
      input.conversationId,
    ]);
    return result.rowCount > 0;
  }

  const result = await client.query(
    `
      SELECT 1
      FROM conversations c
      LEFT JOIN customers customer_identity ON customer_identity.id = c.customer_id
      LEFT JOIN sellers seller_identity ON seller_identity.id = c.seller_id
      LEFT JOIN seller_agents agent_identity
        ON agent_identity.seller_id = c.seller_id
       AND agent_identity.user_id = $2
       AND agent_identity.status = 'active'
      LEFT JOIN conversation_participants participant
        ON participant.conversation_id = c.id
       AND participant.user_id = $2
      WHERE c.id = $1
        AND (
          customer_identity.user_id = $2
          OR seller_identity.owner_user_id = $2
          OR agent_identity.user_id = $2
          OR participant.user_id = $2
        )
      LIMIT 1
    `,
    [input.conversationId, input.userId],
  );

  return result.rowCount > 0;
}
