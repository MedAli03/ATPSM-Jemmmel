"use strict";

const TTL_MS = 5000;

const store = new Map();

function getThreadKey(threadId) {
  return String(threadId);
}

function pruneExpired(threadId) {
  const key = getThreadKey(threadId);
  const entry = store.get(key);
  if (!entry) return;
  const now = Date.now();
  for (const [userId, status] of entry.status.entries()) {
    if (status.expiresAt <= now) {
      entry.status.delete(userId);
    }
  }
  if (entry.status.size === 0) {
    store.delete(key);
  }
}

exports.setTyping = (threadId, userId, details = {}) => {
  const key = getThreadKey(threadId);
  pruneExpired(threadId);
  if (!store.has(key)) {
    store.set(key, { status: new Map() });
  }
  const entry = store.get(key);
  if (details.isTyping) {
    entry.status.set(String(userId), {
      userId: String(userId),
      label: details.label,
      name: details.name,
      expiresAt: Date.now() + TTL_MS,
    });
  } else {
    entry.status.delete(String(userId));
    if (entry.status.size === 0) {
      store.delete(key);
    }
  }
};

exports.getTyping = (threadId, currentUserId) => {
  pruneExpired(threadId);
  const entry = store.get(getThreadKey(threadId));
  if (!entry) {
    return { isTyping: false, users: [] };
  }
  const others = Array.from(entry.status.values()).filter(
    (status) => status.userId !== String(currentUserId)
  );
  if (!others.length) {
    return { isTyping: false, users: [] };
  }
  const [first] = others;
  return {
    isTyping: true,
    label: first.label,
    users: others.map((status) => ({
      userId: status.userId,
      label: status.label,
      name: status.name,
    })),
  };
};

exports.flushAll = () => {
  store.clear();
};
