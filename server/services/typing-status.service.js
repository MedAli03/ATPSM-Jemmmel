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

exports.setTyping = (threadId, userId, isTyping, label) => {
  const key = getThreadKey(threadId);
  pruneExpired(threadId);
  if (!store.has(key)) {
    store.set(key, { status: new Map() });
  }
  const entry = store.get(key);
  if (isTyping) {
    entry.status.set(String(userId), {
      label,
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
  if (!entry) return { isTyping: false };
  const others = Array.from(entry.status.entries()).filter(
    ([userId]) => userId !== String(currentUserId)
  );
  if (!others.length) return { isTyping: false };
  const [, status] = others[0];
  return { isTyping: true, label: status.label };
};

exports.flushAll = () => {
  store.clear();
};
