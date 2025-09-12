"use strict";

const { sequelize } = require("../models");
const repo = require("../repos/notifications.repo");

exports.broadcast = async ({ target, type, titre, corps }, _currentUser) => {
  return sequelize.transaction(async (t) => {
    const users = await repo.findTargetUsers(target, t);
    if (!users.length) {
      const e = new Error("Aucun utilisateur cible");
      e.status = 404;
      throw e;
    }
    const now = new Date();
    const rows = users.map((u) => ({
      utilisateur_id: u.id,
      type,
      titre,
      corps,
      lu_le: null,
      created_at: now,
      updated_at: now,
    }));
    const created = await repo.bulkCreateNotifications(rows, t);
    return { created, target, type, titre };
  });
};
