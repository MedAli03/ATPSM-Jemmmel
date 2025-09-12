"use strict";

const repo = require("../repos/documents.repo");

exports.list = (q) =>
  repo.list(
    { type: q.type, statut: q.statut, q: q.q },
    { page: q.page, limit: q.limit }
  );

exports.get = async (id) => {
  const doc = await repo.findById(id);
  if (!doc) {
    const e = new Error("Document introuvable");
    e.status = 404;
    throw e;
  }
  return doc;
};

exports.create = async (payload, currentUser) => {
  const attrs = {
    admin_id: currentUser.id, // 🔐 force depuis JWT
    type: payload.type,
    titre: payload.titre,
    url: payload.url,
    statut: payload.statut ?? "brouillon",
  };
  return repo.create(attrs);
};

exports.update = async (id, payload) => {
  const exists = await repo.findById(id);
  if (!exists) {
    const e = new Error("Document introuvable");
    e.status = 404;
    throw e;
  }

  const n = await repo.updateById(id, payload);
  if (!n) {
    const e = new Error("Aucune modification");
    e.status = 400;
    throw e;
  }
  return repo.findById(id);
};

exports.remove = async (id) => {
  const exists = await repo.findById(id);
  if (!exists) {
    const e = new Error("Document introuvable");
    e.status = 404;
    throw e;
  }
  await repo.deleteById(id);
  return { deleted: true };
};
