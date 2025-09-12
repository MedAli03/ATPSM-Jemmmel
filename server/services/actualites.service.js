"use strict";

const repo = require("../repos/actualites.repo");

exports.list = (q) =>
  repo.list(
    { q: q.q, date_debut: q.date_debut, date_fin: q.date_fin },
    { page: q.page, limit: q.limit }
  );

exports.get = async (id) => {
  const a = await repo.findById(id);
  if (!a) {
    const err = new Error("Actualité introuvable");
    err.status = 404;
    throw err;
  }
  return a;
};

exports.create = async (payload, currentUser) => {
  const attrs = {
    admin_id: currentUser.id, // 🔐 force depuis JWT
    titre: payload.titre,
    contenu: payload.contenu,
    publie_le: payload.publie_le,
  };
  return repo.create(attrs);
};

exports.update = async (id, payload) => {
  const exists = await repo.findById(id);
  if (!exists) {
    const err = new Error("Actualité introuvable");
    err.status = 404;
    throw err;
  }

  const n = await repo.updateById(id, payload);
  if (!n) {
    const err = new Error("Aucune modification");
    err.status = 400;
    throw err;
  }
  return repo.findById(id);
};

exports.remove = async (id) => {
  const exists = await repo.findById(id);
  if (!exists) {
    const err = new Error("Actualité introuvable");
    err.status = 404;
    throw err;
  }
  await repo.deleteById(id);
  return { deleted: true };
};
