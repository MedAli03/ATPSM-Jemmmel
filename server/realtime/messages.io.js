"use strict";

const jwt = require("jsonwebtoken");
const messagesService = require("../services/messages.service");

const NAMESPACE = "/messages";

function extractToken(socket) {
  const authHeader = socket.handshake.headers?.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const authToken = socket.handshake.auth?.token;
  if (typeof authToken === "string" && authToken.trim()) {
    return authToken.startsWith("Bearer ") ? authToken.slice(7) : authToken;
  }
  return null;
}

function emitError(socket, error) {
  const payload = {
    code: error.code || "MESSAGING_ERROR",
    message: error.message || "حدث خطأ غير متوقع",
  };
  socket.emit("messaging:error", payload);
}

module.exports = function registerMessagingNamespace(server, ioInstance) {
  const io = ioInstance;
  const namespace = io.of(NAMESPACE);

  namespace.use(async (socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) {
        return next(new Error("AUTH_REQUIRED"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) {
        return next(new Error("AUTH_INVALID"));
      }
      socket.user = { id: Number(decoded.id), role: decoded.role };
      return next();
    } catch (error) {
      return next(new Error("AUTH_INVALID"));
    }
  });

  namespace.on("connection", async (socket) => {
    const { id: userId, role } = socket.user;
    const userRoom = `user:${userId}`;
    const joinedThreads = new Set();

    socket.join(userRoom);

    try {
      const count = await messagesService.unreadCount(userId);
      socket.emit("unread:count", { count });
    } catch (error) {
      emitError(socket, error);
    }

    socket.on("thread:join", async ({ threadId }) => {
      try {
        if (!threadId) return;
        await messagesService.getThread(userId, threadId, role);
        const room = `thread:${threadId}`;
        socket.join(room);
        joinedThreads.add(threadId);
        const typing = messagesService.getTyping(threadId).filter((id) => id !== userId);
        if (typing.length) {
          socket.emit("typing", { threadId, userIds: typing, on: true });
        }
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on("thread:leave", ({ threadId }) => {
      if (!threadId) return;
      const room = `thread:${threadId}`;
      socket.leave(room);
      joinedThreads.delete(threadId);
      messagesService.setTyping({ userId, threadId, on: false });
    });

    socket.on("typing:start", async ({ threadId }) => {
      try {
        await messagesService.getThread(userId, threadId, role);
        const active = messagesService.setTyping({ userId, threadId, on: true });
        console.log(`[ws] typing:start user=${userId} thread=${threadId}`);
        namespace.to(`thread:${threadId}`).emit("typing", {
          threadId,
          userId,
          on: true,
          userIds: active,
        });
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on("typing:stop", async ({ threadId }) => {
      try {
        await messagesService.getThread(userId, threadId, role);
        const active = messagesService.setTyping({ userId, threadId, on: false });
        console.log(`[ws] typing:stop user=${userId} thread=${threadId}`);
        namespace.to(`thread:${threadId}`).emit("typing", {
          threadId,
          userId,
          on: false,
          userIds: active,
        });
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on("message:send", async (payload = {}) => {
      try {
        const { threadId, text, attachments } = payload;
        if (!threadId) {
          throw new Error("THREAD_REQUIRED");
        }
        const message = await messagesService.sendMessage({
          userId,
          threadId,
          text,
          attachments,
        });

        console.log(`[ws] message:send user=${userId} thread=${threadId}`);
        namespace.to(`thread:${threadId}`).emit("message:new", message);

        try {
          const thread = await messagesService.getThread(userId, threadId, role);
          await Promise.all(
            (thread.participants || []).map(async (participant) => {
              const room = `user:${participant.id}`;
              namespace.to(room).emit("thread:updated", {
                threadId,
                lastMessage: message,
                updatedAt: message.createdAt,
              });
              const unread = await messagesService.unreadCount(participant.id);
              namespace.to(room).emit("unread:count", { count: unread });
            })
          );
        } catch (broadcastError) {
          console.error("[ws] broadcast error", broadcastError);
        }
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on("thread:read", async ({ threadId, upToMessageId }) => {
      try {
        if (!threadId) return;
        const result = await messagesService.markRead({
          userId,
          threadId,
          upToMessageId,
        });
        if (result.updated > 0) {
          console.log(`[ws] thread:read user=${userId} thread=${threadId}`);
          namespace.to(`thread:${threadId}`).emit("read:updated", {
            threadId,
            userId,
            upToMessageId: upToMessageId || null,
          });
          const count = await messagesService.unreadCount(userId);
          namespace.to(userRoom).emit("unread:count", { count });
        }
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on("disconnect", () => {
      joinedThreads.forEach((threadId) => {
        const active = messagesService.setTyping({ userId, threadId, on: false });
        console.log(`[ws] typing:stop user=${userId} thread=${threadId}`);
        namespace.to(`thread:${threadId}`).emit("typing", {
          threadId,
          userId,
          on: false,
          userIds: active,
        });
      });
    });
  });

  return namespace;
};
