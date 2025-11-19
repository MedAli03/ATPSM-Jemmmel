"use strict";

const { sequelize } = require("../models");
const repo = require("../repos/groupe.repo");
const notifier = require("./notifier.service"); // already in your project
const educatorAccess = require("./educateur_access.service");

/* ===================== CRUD ===================== */
exports.create = async (payload) => {
  // Optionally: ensure year exists, etc.
  return repo.create(payload);
};

exports.list = async (filters = {}) => {
  const rows = await repo.list(filters);
  const plain = rows.map((g) => g.get({ plain: true }));

  if (!plain.length) return [];

  const counts = await repo.countEnfantsByGroup({
    annee_id: filters?.anneeId,
    groupe_ids: plain.map((g) => g.id),
  });

  return plain.map((g) => ({
    ...g,
    nb_enfants: counts[g.id] ?? 0,
  }));
};

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
exports.listInscriptions = async (
  { groupe_id, annee_id, page, limit },
  currentUser
) => {
  let targetYear = annee_id;
  if (currentUser?.role === "EDUCATEUR") {
    const { anneeId } = await educatorAccess.assertAssignmentForActiveYear(
      currentUser.id,
      groupe_id,
      annee_id
    );
    targetYear = anneeId;
  }

  const { rows, count } = await repo.listInscriptions({
    groupe_id,
    annee_id: targetYear,
    page,
    limit,
  });

  const items = rows.map((row) => {
    const plain = row.get({ plain: true });
    const enfant = plain.enfant || {};
    return {
      id: plain.id,
      groupe_id: plain.groupe_id,
      annee_id: plain.annee_id,
      enfant_id: plain.enfant_id,
      date_inscription: plain.date_inscription,
      date_sortie: plain.date_sortie,
      created_at: plain.created_at,
      updated_at: plain.updated_at,
      prenom: enfant.prenom ?? null,
      nom: enfant.nom ?? null,
      date_naissance: enfant.date_naissance ?? null,
    };
  });

  return {
    items,
    meta: {
      page,
      limit,
      total: count,
      hasMore: page * limit < count,
    },
  };
};

exports.inscrireEnfants = async (groupe_id, annee_id, enfant_ids) => {
  // Normalize & dedupe
  const enfants = Array.from(new Set((enfant_ids || []).map(Number).filter(Boolean)));
  if (!enfants.length) {
    const e = new Error("Aucun enfant à inscrire");
    e.status = 422;
    throw e;
  }

  return sequelize.transaction(async (t) => {
    const now = new Date();
    const summary = {
      created: 0,
      created_ids: [],
      transferred: [],
      skipped: [],
    };

    for (const enfant_id of enfants) {
      const active = await repo.findActiveInscription(enfant_id, annee_id, t);

      if (active && active.groupe_id === groupe_id) {
        summary.skipped.push(enfant_id);
        continue;
      }

      if (active) {
        await repo.closeInscriptionById(active.id, now, t);
      }

      const created = await repo.createInscription(
        {
          enfant_id,
          groupe_id,
          annee_id,
          date_inscription: now,
        },
        t
      );

      summary.created += 1;
      summary.created_ids.push(created.id);

      if (active) {
        summary.transferred.push({
          enfant_id,
          from_groupe_id: active.groupe_id,
        });
      }

      await notifier.notifyOnChildAssignedToGroup(
        { enfant_id, groupe_id, annee_id },
        t
      );
    }

    if (summary.created === 0) {
      const e = new Error(
        "Aucun enfant ajouté: déjà membre de ce groupe pour cette année."
      );
      e.status = 409;
      throw e;
    }

    return summary;
  });
};

exports.removeInscription = async (inscription_id) => {
  const [nb] = await repo.closeInscriptionById(
    inscription_id,
    new Date()
  );

  if (!nb) {
    const e = new Error("Inscription introuvable");
    e.status = 404;
    throw e;
  }
  return { deleted: true };
};

/* ===================== Affectation ===================== */
exports.getAffectation = async (groupe_id, annee_id) => {
  const row = await repo.getAffectationByYear(groupe_id, annee_id);
  return row ? row.get({ plain: true }) : null;
};

exports.affecterEducateur = async (groupe_id, annee_id, educateur_id) =>
  sequelize.transaction(async (t) => {
    const now = new Date();

    const existingForEducateur = await repo.findEducateurAssignment(
      educateur_id,
      annee_id,
      t
    );

    if (existingForEducateur && existingForEducateur.groupe_id !== groupe_id) {
      const e = new Error("Cet éducateur est déjà affecté à un autre groupe cette année.");
      e.status = 409;
      throw e;
    }

    const current = await repo.getAffectationByYear(groupe_id, annee_id, t);

    if (current && current.educateur_id === educateur_id) {
      return current.get({ plain: true });
    }

    if (existingForEducateur && existingForEducateur.groupe_id === groupe_id) {
      // Same group but previous assignment closed; just reactivate with new record
      await repo.closeAffectationById(existingForEducateur.id, now, t);
    }

    if (current) {
      await repo.closeAffectationById(current.id, now, t);
    }

    const row = await repo.createAffectation(
      { groupe_id, annee_id, educateur_id, date_affectation: now },
      t
    );

    await notifier.notifyOnEducatorAssignedToGroup(
      { educateur_id, groupe_id, annee_id },
      t
    );

    const fresh = await repo.getAffectationByYear(groupe_id, annee_id, t);
    return fresh ? fresh.get({ plain: true }) : row.get({ plain: true });
  });

exports.removeAffectation = async (groupe_id, affectation_id) => {
  const [nb] = await repo.removeAffectationById(groupe_id, affectation_id);

  if (!nb) {
    const e = new Error("Affectation introuvable");
    e.status = 404;
    throw e;
  }

  return { deleted: true };
};

/* ===================== Candidates ===================== */
exports.searchEnfantsCandidats = async (params) => {
  const page = Number(params.page) || 1;
  const rawLimit = Number(params.limit) || 10;
  const limit = Math.max(1, Math.min(rawLimit, 50));
  const scope = params.scope === "assigned" ? "assigned" : "available";
  const exclude_groupe_id =
    params.exclude_groupe_id != null ? Number(params.exclude_groupe_id) : undefined;
  const search =
    typeof params.search === "string" && params.search.trim().length > 0
      ? params.search.trim()
      : undefined;

  const { items, total } = await repo.listChildrenCandidates({
    annee_id: params.annee_id,
    search,
    page,
    limit,
    scope,
    exclude_groupe_id,
  });

  return {
    items,
    meta: {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    },
  };
};

exports.searchEducateursCandidats = async (params) => {
  const { rows, count } = await repo.listEducateurCandidates(params);
  const items = rows.map((row) => row.get({ plain: true }));

  return {
    items,
    meta: {
      page: params.page,
      limit: params.limit,
      total: count,
      hasMore: params.page * params.limit < count,
    },
  };
};
