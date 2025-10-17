import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getMessagingSocket, disconnectMessagingSocket } from "../realtime/socket";
import { useAuth } from "../context/AuthContext";
import { messagingApi } from "../services/messagingApi";

function updateThreadsCache(queryClient, threadId, updater) {
  queryClient.setQueriesData({ queryKey: ["threads"] }, (old) => {
    if (!old) return old;
    const nextData = (old.data || []).map((thread) =>
      thread.id === threadId ? updater(thread) : thread
    );
    return { ...old, data: nextData };
  });
}

function appendMessageToCache(queryClient, threadId, message) {
  queryClient.setQueryData(["messages", threadId], (old) => {
    if (!old) {
      return {
        pages: [{ data: [message], nextCursor: null }],
        pageParams: [undefined],
      };
    }
    const pages = old.pages.slice();
    const lastIndex = pages.length - 1;
    if (lastIndex >= 0) {
      const lastPage = pages[lastIndex];
      const exists = lastPage.data?.some?.((item) => item.id === message.id);
      if (!exists) {
        pages[lastIndex] = {
          ...lastPage,
          data: [...(lastPage.data || []), message],
        };
      }
    } else {
      pages.push({ data: [message], nextCursor: null });
    }
    return { ...old, pages };
  });
}

export function useRealtimeThread(threadId) {
  const queryClient = useQueryClient();
  const { token, role, currentUser } = useAuth();
  const [connected, setConnected] = useState(false);
  const [typingState, setTypingState] = useState({});

  useEffect(() => {
    if (!token) {
      disconnectMessagingSocket();
      return undefined;
    }

    let isActive = true;
    let socketRef;
    let cleanup = () => {};

    getMessagingSocket(token)
      .then((socket) => {
        if (!socket || !isActive) {
          return;
        }
        socketRef = socket;

        const handleConnect = () => setConnected(true);
        const handleDisconnect = () => setConnected(false);
        const handleMessageNew = (message) => {
          if (role === "PARENT" && message.kind === "system") {
            return;
          }
          const targetThreadId = message.threadId || message.thread_id;
          const isMine = message.sender?.id === currentUser?.id;
          appendMessageToCache(queryClient, targetThreadId, message);
          updateThreadsCache(queryClient, targetThreadId, (thread) => ({
            ...thread,
            lastMessage: message,
            updatedAt: message.createdAt,
            unreadCount:
              !isMine && Number(threadId) !== Number(targetThreadId)
                ? (thread.unreadCount || 0) + 1
                : thread.unreadCount || 0,
          }));
        };
        const handleThreadUpdated = ({ threadId: incomingId, lastMessage, updatedAt }) => {
          const sanitizedLast =
            role === "PARENT" && lastMessage?.kind === "system" ? null : lastMessage;
          updateThreadsCache(queryClient, incomingId, (thread) => ({
            ...thread,
            lastMessage: sanitizedLast,
            updatedAt,
          }));
          if (threadId && incomingId === Number(threadId)) {
            queryClient.setQueryData(["thread", threadId], (old) =>
              old ? { ...old, lastMessage: sanitizedLast, updatedAt } : old
            );
          }
        };
        const handleUnread = ({ count }) => {
          queryClient.setQueryData(["unreadCount"], count);
        };
        const handleReadUpdated = ({ threadId: targetThreadId, userId, upToMessageId }) => {
          queryClient.setQueryData(["messages", targetThreadId], (old) => {
            if (!old) return old;
            const pages = old.pages.map((page) => ({
              ...page,
              data: page.data?.map((message) => {
                if (upToMessageId && Number(message.id) > Number(upToMessageId)) {
                  return message;
                }
                if ((message.readBy || []).includes(userId)) return message;
                return {
                  ...message,
                  readBy: [...(message.readBy || []), userId],
                };
              }),
            }));
            return { ...old, pages };
          });
          if (currentUser?.id === userId) {
            updateThreadsCache(queryClient, targetThreadId, (thread) => ({
              ...thread,
              unreadCount: 0,
            }));
          }
        };
        const handleTyping = ({ threadId: targetThreadId, userIds = [], on }) => {
          setTypingState((prev) => {
            const existing = new Set(prev[targetThreadId] || []);
            userIds.forEach((id) => {
              if (id === currentUser?.id) return;
              if (on) {
                existing.add(id);
              } else {
                existing.delete(id);
              }
            });
            return { ...prev, [targetThreadId]: Array.from(existing) };
          });
        };

        socketRef.on("connect", handleConnect);
        socketRef.on("disconnect", handleDisconnect);
        socketRef.on("message:new", handleMessageNew);
        socketRef.on("thread:updated", handleThreadUpdated);
        socketRef.on("unread:count", handleUnread);
        socketRef.on("read:updated", handleReadUpdated);
        socketRef.on("typing", handleTyping);

        if (!socketRef.connected) {
          socketRef.connect();
        }

        cleanup = () => {
          socketRef.off("connect", handleConnect);
          socketRef.off("disconnect", handleDisconnect);
          socketRef.off("message:new", handleMessageNew);
          socketRef.off("thread:updated", handleThreadUpdated);
          socketRef.off("unread:count", handleUnread);
          socketRef.off("read:updated", handleReadUpdated);
          socketRef.off("typing", handleTyping);
          setConnected(false);
        };
      })
      .catch((error) => {
        console.error("Failed to bind messaging socket", error);
      });

    return () => {
      isActive = false;
      cleanup();
    };
  }, [token, queryClient, role, threadId, currentUser]);

  useEffect(() => {
    if (!token || !threadId) return undefined;

    let isSubscribed = true;
    let socketRef;

    getMessagingSocket(token)
      .then((socket) => {
        if (!socket || !isSubscribed) {
          return;
        }
        socketRef = socket;
        socketRef.emit("thread:join", { threadId });
      })
      .catch((error) => {
        console.error("Failed to join messaging thread", error);
      });

    return () => {
      isSubscribed = false;
      if (socketRef) {
        socketRef.emit("thread:leave", { threadId });
      }
    };
  }, [token, threadId]);

  const typingActive = useMemo(() => {
    const list = typingState[threadId];
    return Array.isArray(list) && list.length > 0;
  }, [typingState, threadId]);

  const sendTyping = useCallback(
    (isTyping) => {
      if (!token || !threadId) return;
      getMessagingSocket(token)
        .then((socket) => {
          if (!socket) return;
          socket.emit(isTyping ? "typing:start" : "typing:stop", { threadId });
        })
        .catch((error) => {
          console.error("Failed to emit typing event", error);
        });
    },
    [threadId, token]
  );

  const markRead = useCallback(
    async (messageId) => {
      if (!token || !threadId) return;
      try {
        const socket = await getMessagingSocket(token);
        if (socket?.connected) {
          socket.emit("thread:read", { threadId, upToMessageId: messageId || null });
        }
      } catch (error) {
        console.error("Failed to emit read receipt", error);
      }
      await messagingApi.markRead(threadId, messageId);
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
    [threadId, token, queryClient]
  );

  return { connected, typingActive, sendTyping, markRead };
}
