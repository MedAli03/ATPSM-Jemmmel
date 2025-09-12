"use strict";

const repo = require("../repos/reglements.repo");
const { Document, Reglement } = require("../models");

exports.list = (q) =>
  repo.list(
    { document_id: q.document_id, q: q.q },
    { page: q.page, limit: q.limit }
  );

exports.get = async (id) => {
  const r = await repo.findById(id);
  if (!r) {
    const e = new Error("Règlement introuvable");
    e.status = 404;
    throw e;
  }
  return r;
};

exports.create = async (payload) => {
  // Vérifier que le document parent existe et est de type reglement
  const doc = await Document.findByPk(payload.document_id);
  if (!doc) {
    const e = new Error("Document parent introuvable");
    e.status = 404;
    throw e;
  }
  if (doc.type !== "reglement") {
    const e = new Error("Le document lié doit être de type 'reglement'");
    e.status = 422;
    throw e;
  }
  return repo.create({
    document_id: payload.document_id,
    version: payload.version,
    date_effet: payload.date_effet,
  });
};

exports.update = async (id, payload) => {
  const exists = await repo.findById(id);
  if (!exists) {
    const e = new Error("Règlement introuvable");
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
    const e = new Error("Règlement introuvable");
    e.status = 404;
    throw e;
  }
  await repo.deleteById(id);
  return { deleted: true };
};
