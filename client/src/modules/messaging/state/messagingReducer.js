export const initialState = {
  threadsById: {},
  threadOrder: [],
  messagesById: {},
  messagesByThread: {},
  messageCursors: {},
  drafts: {},
  typingByThread: {},
  pendingByThread: {},
};

function mergeThread(state, thread) {
  const existing = state.threadsById[thread.id] || {};
  return {
    ...state,
    threadsById: {
      ...state.threadsById,
      [thread.id]: { ...existing, ...thread },
    },
  };
}

export function messagingReducer(state, action) {
  switch (action.type) {
    case "threads/received": {
      const nextThreads = { ...state.threadsById };
      const ids = [];
      action.payload.threads.forEach((thread) => {
        nextThreads[thread.id] = {
          ...state.threadsById[thread.id],
          ...thread,
        };
        ids.push(thread.id);
      });
      return {
        ...state,
        threadsById: nextThreads,
        threadOrder: action.payload.replaceOrder
          ? ids
          : Array.from(new Set([...state.threadOrder, ...ids])),
      };
    }
    case "thread/updated": {
      return mergeThread(state, action.payload.thread);
    }
    case "thread/archived": {
      const { threadId, archived } = action.payload;
      return mergeThread(state, { id: threadId, archived });
    }
    case "thread/created": {
      const nextState = mergeThread(state, action.payload.thread);
      return {
        ...nextState,
        threadOrder: [action.payload.thread.id, ...nextState.threadOrder.filter((id) => id !== action.payload.thread.id)],
      };
    }
    case "messages/received": {
      const { threadId, messages, cursor } = action.payload;
      const nextMessagesById = { ...state.messagesById };
      const existingIds = state.messagesByThread[threadId] || [];
      const newIds = messages.map((message) => message.id);
      messages.forEach((message) => {
        nextMessagesById[message.id] = {
          ...state.messagesById[message.id],
          ...message,
        };
      });
      return {
        ...state,
        messagesById: nextMessagesById,
        messagesByThread: {
          ...state.messagesByThread,
          [threadId]: Array.from(new Set([...newIds, ...existingIds])),
        },
        messageCursors: {
          ...state.messageCursors,
          [threadId]: cursor ?? state.messageCursors[threadId] ?? null,
        },
      };
    }
    case "messages/prepend": {
      const { threadId, messages, cursor } = action.payload;
      const nextMessagesById = { ...state.messagesById };
      const existing = state.messagesByThread[threadId] || [];
      const newIds = messages.map((message) => message.id);
      messages.forEach((message) => {
        nextMessagesById[message.id] = {
          ...state.messagesById[message.id],
          ...message,
        };
      });
      return {
        ...state,
        messagesById: nextMessagesById,
        messagesByThread: {
          ...state.messagesByThread,
          [threadId]: Array.from(new Set([...newIds, ...existing])),
        },
        messageCursors: {
          ...state.messageCursors,
          [threadId]: cursor ?? state.messageCursors[threadId] ?? null,
        },
      };
    }
    case "messages/append": {
      const { threadId, messages } = action.payload;
      const nextMessagesById = { ...state.messagesById };
      const existing = state.messagesByThread[threadId] || [];
      const newIds = messages.map((message) => message.id);
      messages.forEach((message) => {
        nextMessagesById[message.id] = {
          ...state.messagesById[message.id],
          ...message,
        };
      });
      return {
        ...state,
        messagesById: nextMessagesById,
        messagesByThread: {
          ...state.messagesByThread,
          [threadId]: Array.from(new Set([...existing, ...newIds])),
        },
      };
    }
    case "message/optimistic": {
      const { message } = action.payload;
      const existing = state.messagesByThread[message.threadId] || [];
      return {
        ...state,
        messagesById: {
          ...state.messagesById,
          [message.id]: message,
        },
        messagesByThread: {
          ...state.messagesByThread,
          [message.threadId]: Array.from(new Set([...existing, message.id])),
        },
        pendingByThread: {
          ...state.pendingByThread,
          [message.threadId]: {
            ...(state.pendingByThread[message.threadId] || {}),
            [message.clientId || message.id]: message.id,
          },
        },
      };
    }
    case "message/succeeded": {
      const { tempId, message } = action.payload;
      const existingTemp = state.messagesById[tempId] || {};
      const { [tempId]: _removed, ...rest } = state.messagesById;
      const nextMessagesById = {
        ...rest,
        [message.id]: { ...existingTemp, ...message },
      };
      const ids = (state.messagesByThread[message.threadId] || []).map((id) =>
        id === tempId ? message.id : id
      );
      const pending = { ...(state.pendingByThread[message.threadId] || {}) };
      if (tempId && pending[tempId]) {
        delete pending[tempId];
      }
      return {
        ...state,
        messagesById: nextMessagesById,
        messagesByThread: {
          ...state.messagesByThread,
          [message.threadId]: Array.from(new Set(ids)),
        },
        pendingByThread: {
          ...state.pendingByThread,
          [message.threadId]: pending,
        },
      };
    }
    case "message/failed": {
      const { messageId } = action.payload;
      const existing = state.messagesById[messageId];
      if (!existing) return state;
      return {
        ...state,
        messagesById: {
          ...state.messagesById,
          [messageId]: {
            ...existing,
            status: "failed",
          },
        },
      };
    }
    case "message/status": {
      const { messageId, patch } = action.payload;
      const existing = state.messagesById[messageId];
      if (!existing) return state;
      return {
        ...state,
        messagesById: {
          ...state.messagesById,
          [messageId]: {
            ...existing,
            ...patch,
          },
        },
      };
    }
    case "drafts/save": {
      const { threadId, content } = action.payload;
      return {
        ...state,
        drafts: {
          ...state.drafts,
          [threadId]: content,
        },
      };
    }
    case "drafts/clear": {
      const nextDrafts = { ...state.drafts };
      delete nextDrafts[action.payload.threadId];
      return {
        ...state,
        drafts: nextDrafts,
      };
    }
    case "typing/update": {
      const { threadId, typing } = action.payload;
      return {
        ...state,
        typingByThread: {
          ...state.typingByThread,
          [threadId]: typing,
        },
      };
    }
    default:
      return state;
  }
}

export const selectors = {
  threads(state) {
    return state.threadOrder
      .map((id) => state.threadsById[id])
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  },
  threadById(state, threadId) {
    return state.threadsById[threadId] || null;
  },
  messagesForThread(state, threadId) {
    const ids = state.messagesByThread[threadId] || [];
    return ids
      .map((id) => state.messagesById[id])
      .filter(Boolean)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  },
  draftForThread(state, threadId) {
    return state.drafts[threadId] || "";
  },
  typingForThread(state, threadId) {
    return state.typingByThread[threadId] || [];
  },
};
