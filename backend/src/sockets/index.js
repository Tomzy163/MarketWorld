import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { authenticateAccessToken } from '../services/auth/auth.service.js';
import { authorizeConversationJoin } from '../services/communication/conversation-authorization.service.js';

export function registerSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      credentials: true,
      origin: env.CORS_ALLOWED_ORIGINS,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.accessToken || getBearerFromHeader(socket.handshake.headers);
      if (!token) {
        next(new Error('Authentication is required.'));
        return;
      }

      socket.data.identity = await authenticateAccessToken(token);
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', (socket) => {
    const identity = socket.data.identity;
    socket.join(`user:${identity.user.id}:notifications`);

    if (identity.sellerId) {
      socket.join(`seller:${identity.sellerId}:presence`);
    }

    socket.on('conversation:join', async (payload, acknowledge) => {
      try {
        const conversationId = payload?.conversationId;
        if (!conversationId) {
          acknowledge?.({ ok: false, code: 'CONVERSATION_ID_REQUIRED' });
          return;
        }

        const allowed = await authorizeConversationJoin(identity, conversationId);
        if (!allowed) {
          acknowledge?.({ ok: false, code: 'CONVERSATION_FORBIDDEN' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        acknowledge?.({ ok: true });
      } catch (error) {
        logger.warn({ err: error, userId: identity.user.id }, 'Socket conversation join failed');
        acknowledge?.({ ok: false, code: 'CONVERSATION_JOIN_FAILED' });
      }
    });

    socket.on('typing:start', (payload) => {
      emitConversationSignal(socket, payload, 'typing:start');
    });

    socket.on('typing:stop', (payload) => {
      emitConversationSignal(socket, payload, 'typing:stop');
    });
  });

  return io;
}

function getBearerFromHeader(headers) {
  const authorization = headers.authorization;
  if (!authorization || Array.isArray(authorization)) {
    return null;
  }

  const [scheme, token] = authorization.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : null;
}

function emitConversationSignal(socket, payload, eventName) {
  const conversationId = payload?.conversationId;
  if (!conversationId) {
    return;
  }

  if (!socket.rooms.has(`conversation:${conversationId}`)) {
    return;
  }

  socket.to(`conversation:${conversationId}`).emit(eventName, {
    conversationId,
    userId: socket.data.identity.user.id,
  });
}
