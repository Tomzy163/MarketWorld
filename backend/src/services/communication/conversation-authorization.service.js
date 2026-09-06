import { withTransaction } from '../../db/transaction.js';
import { canUserAccessConversation } from '../../repositories/conversation.repository.js';

export async function authorizeConversationJoin(identity, conversationId) {
  return withTransaction(
    async (client) =>
      canUserAccessConversation(client, {
        conversationId,
        userId: identity.user.id,
        role: identity.user.role,
      }),
    {
      userId: identity.user.id,
      sellerId: identity.sellerId,
      role: identity.user.role,
    },
  );
}
