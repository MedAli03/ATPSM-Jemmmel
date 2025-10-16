import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { initialState, messagingReducer, selectors } from "../state/messagingReducer";
import { MockMessagingService } from "../services/MockMessagingService";
import { sanitizeMessagesForRole } from "../utils/sanitizeMessages";

const MessagingContext = createContext(null);

const STORAGE_KEY = "messaging:drafts";

function loadDraftsFromStorage() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
    return {};
  } catch (error) {
    console.warn("Failed to parse drafts", error);
    return {};
  }
}

export const MessagingProvider = ({ children, service, currentUser }) => {
  const serviceRef = useRef(service || null);
  if (!serviceRef.current) {
    serviceRef.current = new MockMessagingService();
  }
  const messagingService = serviceRef.current;

  const [state, dispatch] = useReducer(
    messagingReducer,
    initialState,
    (base) => ({
      ...base,
      drafts: { ...base.drafts, ...loadDraftsFromStorage() },
    })
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.drafts));
    } catch (error) {
      console.warn("Failed to persist drafts", error);
    }
  }, [state.drafts]);

  useEffect(() => {
    const unsubscribe = messagingService.onEvent((event) => {
      switch (event.type) {
        case "thread.updated": {
          dispatch({ type: "thread/updated", payload: { thread: event.thread } });
          break;
        }
        case "message.created": {
          if (!event.message) break;
          const filtered = sanitizeMessagesForRole([event.message], currentUser?.role || null)[0];
          if (!filtered) break;
          dispatch({
            type: "messages/append",
            payload: {
              threadId: filtered.threadId,
              messages: [filtered],
            },
          });
          if (event.thread) {
            dispatch({ type: "thread/updated", payload: { thread: event.thread } });
          }
          break;
        }
        case "typing": {
          dispatch({
            type: "typing/update",
            payload: { threadId: event.threadId, typing: event.users || [] },
          });
          break;
        }
        case "message.status": {
          dispatch({
            type: "message/status",
            payload: { messageId: event.messageId, patch: event.patch || {} },
          });
          break;
        }
        default:
          break;
      }
    });
    return unsubscribe;
  }, [messagingService, currentUser?.role]);

  const actions = useMemo(() => {
    return {
      async listThreads(params = {}) {
        const page = await messagingService.listThreads(params);
        dispatch({
          type: "threads/received",
          payload: { threads: page.items, replaceOrder: params.reset ?? false },
        });
        page.items.forEach((thread) => {
          if (Array.isArray(thread.previewMessages) && thread.previewMessages.length) {
            dispatch({
              type: "messages/received",
              payload: {
                threadId: thread.id,
                messages: sanitizeMessagesForRole(thread.previewMessages, currentUser?.role || null),
              },
            });
          }
        });
        return page;
      },
      async getThread(threadId) {
        const thread = await messagingService.getThread(threadId);
        dispatch({ type: "thread/updated", payload: { thread } });
        return thread;
      },
      async listMessages(threadId, cursor) {
        const page = await messagingService.listMessages(threadId, cursor);
        const sanitized = sanitizeMessagesForRole(page.items, currentUser?.role || null);
        dispatch({
          type: cursor ? "messages/prepend" : "messages/received",
          payload: { threadId, messages: sanitized, cursor: page.nextCursor || null },
        });
        return { ...page, items: sanitized };
      },
      async sendMessage(threadId, draft) {
        const optimisticMessage = messagingService.buildOptimisticMessage
          ? await messagingService.buildOptimisticMessage(threadId, draft)
          : {
              id: `temp-${Date.now()}`,
              threadId,
              senderId: draft.senderId,
              kind: draft.attachments?.length ? "attachment" : "text",
              text: draft.text,
              attachments: draft.attachments || [],
              createdAt: new Date().toISOString(),
              status: "sending",
              clientId: `temp-${Date.now()}`,
            };
        dispatch({ type: "message/optimistic", payload: { message: optimisticMessage } });
        try {
          const confirmed = await messagingService.sendMessage(threadId, draft);
          const filtered = sanitizeMessagesForRole([confirmed], currentUser?.role || null)[0];
          if (!filtered) {
            dispatch({ type: "message/status", payload: { messageId: optimisticMessage.id, patch: { status: "read" } } });
            return confirmed;
          }
          dispatch({
            type: "message/succeeded",
            payload: { tempId: optimisticMessage.id, message: filtered },
          });
          dispatch({ type: "drafts/clear", payload: { threadId } });
          return filtered;
        } catch (error) {
          dispatch({ type: "message/failed", payload: { messageId: optimisticMessage.id } });
          throw error;
        }
      },
      async createThread(payload) {
        const thread = await messagingService.createThread(payload);
        dispatch({ type: "thread/created", payload: { thread } });
        return thread;
      },
      async markRead(threadId, messageId) {
        await messagingService.markRead(threadId, messageId);
        dispatch({
          type: "thread/updated",
          payload: { thread: { id: threadId, unreadCount: 0 } },
        });
      },
      async archiveThread(threadId, archived) {
        await messagingService.archiveThread(threadId, archived);
        dispatch({ type: "thread/archived", payload: { threadId, archived } });
      },
      saveDraft(threadId, content) {
        dispatch({ type: "drafts/save", payload: { threadId, content } });
      },
      clearDraft(threadId) {
        dispatch({ type: "drafts/clear", payload: { threadId } });
      },
    };
  }, [messagingService, currentUser?.role]);

  const value = useMemo(
    () => ({ state, dispatch, actions, service: messagingService, selectors }),
    [state, actions, messagingService]
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
};

export const useMessagingContext = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessagingContext must be used within MessagingProvider");
  }
  return context;
};
