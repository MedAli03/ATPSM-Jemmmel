"use strict";

const repo = require("../repos/notifications.user.repo");
const mapper = require("../utils/notification-mapper");
const realtime = require("../realtime");

exports.listMine = async (currentUser, q) => {
  const filters = { only_unread: q.only_unread, type: q.type, q: q.q };
  const pagination = { page: q.page, limit: q.limit };
  const { rows, count, page, limit } = await repo.listByUser(
    currentUser.id,
    filters,
    pagination
  );
  const items = rows.map((row) => mapper.forClient(row)).filter(Boolean);
  const unread = await repo.countUnread(currentUser.id);
  return { items, meta: { total: count, page, limit, unread } };
};

exports.getMine = async (currentUser, id) => {
  const n = await repo.findByIdForUser(id, currentUser.id);
  if (!n) {
    const e = new Error("Notification introuvable");
    e.status = 404;
    throw e;
  }
  return mapper.forClient(n);
};

exports.unreadCount = async (currentUser) => repo.countUnread(currentUser.id);

exports.readOne = async (currentUser, id) => {
  const existing = await repo.findByIdForUser(id, currentUser.id);
  if (!existing) {
    const e = new Error("Notification introuvable");
    e.status = 404;
    throw e;
  }

  const changed = await repo.markAsRead(id, currentUser.id);
  const updated = await repo.findByIdForUser(id, currentUser.id);
  const data = mapper.forClient(updated);
  const unread = await repo.countUnread(currentUser.id);
  realtime.setUnread(currentUser.id, unread);
  realtime.emitNotificationRead(currentUser.id, id);
  return { updated: changed === 1, data, unread };
};

exports.readAll = async (currentUser) => {
  const n = await repo.markAllAsRead(currentUser.id);
  if (n) {
    realtime.setUnread(currentUser.id, 0);
    realtime.emitAllRead(currentUser.id);
  }
  return { updated: n };
};

exports.removeOne = async (currentUser, id) => {
  const existing = await repo.findByIdForUser(id, currentUser.id);
  if (!existing) {
    const e = new Error("Notification introuvable");
    e.status = 404;
    throw e;
  }
  const plain = existing.get({ plain: true });
  const deleted = await repo.deleteForUser(id, currentUser.id);
  if (!deleted) {
    const e = new Error("Notification introuvable");
    e.status = 404;
    throw e;
  }
  if (!plain.lu_le) {
    realtime.adjustUnread(currentUser.id, -1);
  }
  realtime.emitNotificationDeleted(currentUser.id, id);
  return { deleted: true };
};
