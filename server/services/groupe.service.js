"use strict";

const { sequelize } = require("../models");
const repo = require("../repos/groupe.repo");
const notifier = require("./notifier.service"); // already in your project

/* ===================== CRUD ===================== */
exports.create = async (payload) => {
  // Optionally: ensure year exists, etc.
  return repo.create(payload);
};

exports.list = (filters) => repo.list(filters);

exports.get = async (id) => {
  const g = await repo.findById(id);
  if (!g) {
    const e = new Error("Groupe introuvable");
    e.status = 404;
    throw e;
  }
  return g;
};

exports.update = async (id, attrs) => {
  const nb = await repo.updateById(id, attrs);
  if (!nb) {
    const e = new Error("Groupe introuvable");
    e.status = 404;
    throw e;
  }
  return repo.findById(id);
};

exports.archive = async (id, statut) => {
  if (!["actif", "archive"].includes(statut)) {
    const e = new Error("Statut invalide");
    e.status = 422;
    throw e;
  }
  const nb = await repo.updateById(id, { statut });
  if (!nb) {
    const e = new Error("Groupe introuvable");
    e.status = 404;
    throw e;
  }
  return repo.findById(id);
};

exports.remove = async (id, annee_id) => {
  // Optional: require year context for guard (or compute active year)
  const g = await repo.findById(id);
  if (!g) {
    const e = new Error("Groupe introuvable");
    e.status = 404;
    throw e;
  }
  const guard = await repo.hasUsages(id, annee_id ?? g.annee_id);
  if ((guard.inscriptions ?? 0) > 0 || (guard.affectations ?? 0) > 0) {
    const e = new Error("Suppression impossible: des inscriptions/affectations existent.");
    e.status = 409;
    throw e;
  }
  await repo.deleteById(id);
  return { deleted: true };
};

exports.listByYear = (annee_id) => repo.listByYear(annee_id);

/* ===================== Inscriptions ===================== */
exports.listInscriptions = ({ groupe_id, annee_id, page, limit }) =>
  repo.listInscriptions({ groupe_id, annee_id, page, limit });

exports.inscrireEnfants = async (groupe_id, annee_id, enfant_ids) => {
  // Normalize & dedupe
  const enfants = Array.from(new Set((enfant_ids || []).map(Number).filter(Boolean)));
  if (!enfants.length) {
    const e = new Error("Aucun enfant à inscrire");
    e.status = 422;
    throw e;
  }

  return sequelize.transaction(async (t) => {
    // Check duplicates (enfant already has a group that year)
    const already = await repo.getEnfantsAlreadyAssigned(enfants, annee_id, t);
    const alreadyIds = new Set(already.map((r) => r.enfant_id));
    const toInsert = enfants.filter((id) => !alreadyIds.has(id));
    if (!toInsert.length) {
      const e = new Error("Tous les enfants fournis sont déjà inscrits cette année.");
      e.status = 409;
      throw e;
    }

    const rows = toInsert.map((enfant_id) => ({ enfant_id, groupe_id, annee_id }));
    const created = await repo.addInscriptions(rows, t);

    // Notify parents of each child inserted
    for (const enfant_id of toInsert) {
      await notifier.notifyOnChildAssignedToGroup({ enfant_id, groupe_id, annee_id }, t);
    }

    return { created: created.length, skipped: enfants.length - toInsert.length, enfants_ignores: [...alreadyIds] };
  });
};

exports.removeInscription = async (inscription_id) => {
  const nb = await repo.removeInscription(inscription_id);
  if (!nb) {
    const e = new Error("Inscription introuvable");
    e.status = 404;
    throw e;
  }
  return { deleted: true };
};

/* ===================== Affectation ===================== */
exports.getAffectation = (groupe_id, annee_id) => repo.getAffectationByYear(groupe_id, annee_id);

exports.affecterEducateur = async (groupe_id, annee_id, educateur_id) => {
  return sequelize.transaction(async (t) => {
    // Ensure educator free this year
    const exists = await repo.findEducateurAssignment(educateur_id, annee_id, t);
    if (exists) {
      const e = new Error("Cet éducateur est déjà affecté pour cette année.");
      e.status = 409;
      throw e;
    }
    // Ensure group has no educator for this year (unique)
    const current = await repo.getAffectationByYear(groupe_id, annee_id, t);
    if (current) {
      // Replace strategy: clear previous then create new
      await repo.clearAffectation(groupe_id, annee_id, t);
    }
    const row = await repo.createAffectation({ groupe_id, annee_id, educateur_id }, t);

    // Notify educator
    await notifier.notifyOnEducatorAssignedToGroup({ educateur_id, groupe_id, annee_id }, t);

    return row;
  });
};

exports.removeAffectation = async (groupe_id, affectation_id) => {
  // Simple guard: ensure affectation belongs to this groupe (optional, implement in repo if needed)
  const deleted = await sequelize.transaction(async (t) => {
    return (await repo.clearAffectation(groupe_id, undefined, t)) || 1; // or implement a targeted delete by id
  });
  return { deleted: Boolean(deleted) };
};
