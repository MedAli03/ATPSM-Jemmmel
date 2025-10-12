"use strict";

const repo = require("../repos/evenements.repo");
const { Document } = require("../models");

function normalize(event) {
  if (!event) return null;
  const plain = event.toJSON ? event.toJSON() : event;
  return {
    id: plain.id,
    titre: plain.titre,
    description: plain.description || null,
    debut: plain.debut,
    fin: plain.fin,
    audience: plain.audience,
    lieu: plain.lieu || null,
    document: plain.document || null,
    admin: plain.admin || null,
    created_at: plain.created_at,
    updated_at: plain.updated_at,
  };
}

exports.list = async (q) => {
  const result = await repo.list(
    {
      date_debut: q.date_debut,
      date_fin: q.date_fin,
      audience: q.audience,
      q: q.q,
    },
    { page: q.page, limit: q.limit }
  );

  return {
    rows: result.rows.map(normalize),
    count: result.count,
    page: result.page,
    limit: result.limit,
  };
};

exports.get = async (id) => {
  const e = await repo.findById(id);
  if (!e) {
    const err = new Error("Événement introuvable");
    err.status = 404;
    throw err;
  }
  return normalize(e);
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
  const created = await repo.create(attrs);
  const fresh = await repo.findById(created.id);
  return normalize(fresh);
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
  const fresh = await repo.findById(id);
  return normalize(fresh);
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

exports.listUpcoming = async ({ limit = 5 } = {}) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 50);
  const events = await repo.listUpcoming({ limit: safeLimit });
  return events.map(normalize);
};
