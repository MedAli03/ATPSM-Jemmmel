"use strict";

const repo = require("../repos/notifications.user.repo");

exports.listMine = (currentUser, q) =>
  repo.listByUser(
    currentUser.id,
    { only_unread: q.only_unread, type: q.type, q: q.q },
    { page: q.page, limit: q.limit }
  );

exports.getMine = async (currentUser, id) => {
  const n = await repo.findByIdForUser(id, currentUser.id);
  if (!n) {
    const e = new Error("Notification introuvable");
    e.status = 404;
    throw e;
  }
  return n;
};

exports.unreadCount = (currentUser) => repo.countUnread(currentUser.id);

exports.readOne = async (currentUser, id) => {
  const existing = await repo.findByIdForUser(id, currentUser.id);
  if (!existing) {
    const e = new Error("Notification introuvable");
    e.status = 404;
    throw e;
  }

  const changed = await repo.markAsRead(id, currentUser.id);
  const data = await repo.findByIdForUser(id, currentUser.id);
  return { updated: changed === 1, data };
};

exports.readAll = async (currentUser) => {
  const n = await repo.markAllAsRead(currentUser.id);
  return { updated: n };
};
