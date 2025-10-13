"use strict";

const jwt = require("jsonwebtoken");
const notificationsRepo = require("../repos/notifications.user.repo");

const clientsByUser = new Map();
const unreadByUser = new Map();

const ROLES = ["PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT"];

function addClient(userId, res) {
  if (!clientsByUser.has(userId)) clientsByUser.set(userId, new Set());
  clientsByUser.get(userId).add(res);
  res.on("close", () => {
    const set = clientsByUser.get(userId);
    if (set) {
      set.delete(res);
      if (set.size === 0) {
        clientsByUser.delete(userId);
        unreadByUser.delete(userId);
      }
    }
  });
}

function sendEvent(userId, event, payload) {
  const clients = clientsByUser.get(userId);
  if (!clients || clients.size === 0) return;
  const data = JSON.stringify(payload ?? {});
  clients.forEach((res) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${data}\n\n`);
  });
}

async function register(userId, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders?.();

  addClient(userId, res);

  if (!unreadByUser.has(userId)) {
    try {
      const count = await notificationsRepo.countUnread(userId);
      unreadByUser.set(userId, count);
    } catch {
      unreadByUser.set(userId, 0);
    }
  }

  sendEvent(userId, "notification:count", unreadByUser.get(userId));
}

function adjustUnread(userId, delta) {
  if (!clientsByUser.has(userId)) return;
  const current = unreadByUser.get(userId) || 0;
  const next = Math.max(0, current + delta);
  unreadByUser.set(userId, next);
  sendEvent(userId, "notification:count", next);
}

function setUnread(userId, value) {
  if (!clientsByUser.has(userId)) return;
  const next = Math.max(0, value || 0);
  unreadByUser.set(userId, next);
  sendEvent(userId, "notification:count", next);
}

function emitNotification(userId, notification) {
  sendEvent(userId, "notification:new", notification);
}

function emitNotificationRead(userId, notificationId) {
  sendEvent(userId, "notification:read", { id: notificationId });
}

function emitNotificationDeleted(userId, notificationId) {
  sendEvent(userId, "notification:deleted", { id: notificationId });
}

function emitAllRead(userId) {
  sendEvent(userId, "notification:read-all", {});
}

async function stream(req, res) {
  const token = req.query?.token;
  if (!token) {
    res.status(401).json({ ok: false, message: "TOKEN_REQUIRED" });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.id || !ROLES.includes(payload.role)) {
      res.status(403).json({ ok: false, message: "ROLE_FORBIDDEN" });
      return;
    }
    await register(payload.id, res);
  } catch (err) {
    res.status(401).json({ ok: false, message: "TOKEN_INVALID" });
  }
}

module.exports = {
  stream,
  emitNotification,
  emitNotificationRead,
  emitNotificationDeleted,
  emitAllRead,
  adjustUnread,
  setUnread,
};
