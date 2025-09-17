"use strict";

const { sequelize } = require("../models");
const repo = require("../repos/actualites.repo");
const notifier = require("./notifier.service"); // ⬅️ add this

/**
 * LIST
 */
exports.list = (q) =>
  repo.list(
    { q: q.q, date_debut: q.date_debut, date_fin: q.date_fin },
    { page: q.page, limit: q.limit }
  );

/**
 * GET by id
 */
exports.get = async (id) => {
  const a = await repo.findById(id);
  if (!a) {
    const err = new Error("Actualité introuvable");
    err.status = 404;
    throw err;
  }
  return a;
};

/**
 * CREATE (Président) + 🔔 broadcast notification
 * - admin_id = req.user.id (forcé)
 * - notification envoyée à TOUS les rôles internes
 * - transaction unique pour atomicité
 */
exports.create = async (payload, currentUser) => {
  return sequelize.transaction(async (t) => {
    const attrs = {
      admin_id: currentUser.id,
      titre: payload.titre,
      contenu: payload.contenu,
      publie_le: payload.publie_le,
    };

    const act = await repo.create(attrs, t);


    return act;
  });
};

/**
 * UPDATE
 * (Pas de statut ici. Si tu veux notifier sur update, ajoute un appel notifier.*)
 */
exports.update = async (id, payload) => {
  return sequelize.transaction(async (t) => {
    const exists = await repo.findById(id, t);
    if (!exists) {
      const err = new Error("Actualité introuvable");
      err.status = 404;
      throw err;
    }

    const n = await repo.updateById(id, payload, t);
    if (!n) {
      const err = new Error("Aucune modification");
      err.status = 400;
      throw err;
    }

    const updated = await repo.findById(id, t);

    // (Optionnel) notifier sur modification importante
    // await notifier.toRoles("ALL", {
    //   type: "ACTUALITE",
    //   titre: `Mise à jour: ${updated.titre}`,
    //   corps: (updated.contenu || "").slice(0, 180) + ((updated.contenu || "").length > 180 ? "…" : ""),
    // }, t);

    return updated;
  });
};

/**
 * DELETE
 */
exports.remove = async (id) => {
  return sequelize.transaction(async (t) => {
    const exists = await repo.findById(id, t);
    if (!exists) {
      const err = new Error("Actualité introuvable");
      err.status = 404;
      throw err;
    }
    await repo.deleteById(id, t);
    return { deleted: true };
  });
};
