"use strict";

const repo = require("../repos/evenements.repo");
const { Document } = require("../models");

exports.list = (q) =>
  repo.list(
    {
      date_debut: q.date_debut,
      date_fin: q.date_fin,
      audience: q.audience,
      q: q.q,
    },
    { page: q.page, limit: q.limit }
  );

exports.get = async (id) => {
  const e = await repo.findById(id);
  if (!e) {
    const err = new Error("Événement introuvable");
    err.status = 404;
    throw err;
  }
  return e;
};

exports.create = async (payload, currentUser) => {
  if (payload.document_id) {
    const doc = await Document.findByPk(payload.document_id);
    if (!doc) {
      const err = new Error("Document lié introuvable");
      err.status = 404;
      throw err;
    }
  }
  if (
    payload.debut &&
    payload.fin &&
    new Date(payload.debut) >= new Date(payload.fin)
  ) {
    const err = new Error("debut doit être < fin");
    err.status = 422;
    throw err;
  }
  const attrs = { ...payload, admin_id: currentUser.id };
  return repo.create(attrs);
};

exports.update = async (id, payload) => {
  const exists = await repo.findById(id);
  if (!exists) {
    const err = new Error("Événement introuvable");
    err.status = 404;
    throw err;
  }

  if (payload.document_id) {
    const doc = await Document.findByPk(payload.document_id);
    if (!doc) {
      const err = new Error("Document lié introuvable");
      err.status = 404;
      throw err;
    }
  }
  if (
    payload.debut &&
    payload.fin &&
    new Date(payload.debut) >= new Date(payload.fin)
  ) {
    const err = new Error("debut doit être < fin");
    err.status = 422;
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
    const err = new Error("Événement introuvable");
    err.status = 404;
    throw err;
  }
  await repo.deleteById(id);
  return { deleted: true };
};
