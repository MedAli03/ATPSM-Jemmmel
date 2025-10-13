"use strict";

const { sequelize } = require("../models");
const notifier = require("./notifier.service");

exports.broadcast = async (
  { target, type, titre, corps, icon = null, action_url = null, data = null },
  _currentUser
) => {
  return sequelize.transaction(async (t) => {
    const payload = { type, titre, corps, icon, action_url, data };
    const created =
      target === "ALL"
        ? await notifier.notifyBroadcastToAll(payload, t)
        : await notifier.notifyBroadcastToRole(target, payload, t);
    if (!created) {
      const e = new Error("Aucun utilisateur cible");
      e.status = 404;
      throw e;
    }
    return { created, target, type, titre };
  });
};
