"use strict";

const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const {  
  sequelize,
  Enfant,
  Utilisateur,
  ParentsFiche,
  PEI,
  DailyNote,
  ActiviteProjet,
  EvaluationProjet,
} = require("../models");
const repo = require("../repos/enfant.repo");
const educatorAccess = require("./educateur_access.service");
const anneesRepo = require("../repos/annees.repo");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toPositiveInt(value, fallback) {
  const n = Number(value);
  if (Number.isInteger(n) && n > 0) return n;
  return fallback;
}

function normalizeSearch(term) {
  if (typeof term !== "string") return null;
  const trimmed = term.trim();
  return trimmed.length ? trimmed : null;
}

exports.list = async (q, currentUser) => {
  const page = toPositiveInt(q?.page, DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, toPositiveInt(q?.limit, DEFAULT_LIMIT));
  const search = normalizeSearch(q?.q ?? q?.search);
  const hasParentFilter = Object.prototype.hasOwnProperty.call(q ?? {}, "parent_user_id");
  let parent_user_id = undefined;

  if (hasParentFilter) {
    const rawParent = q?.parent_user_id;
    const sentinelValues = [undefined, null, "", "null", "undefined"];

    if (!sentinelValues.includes(rawParent)) {
      const parsed = Number(rawParent);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        const e = new Error("Paramètre parent_user_id invalide");
        e.status = 400;
        throw e;
      }
      parent_user_id = parsed;
    }
  }

  if (currentUser?.role === "EDUCATEUR") {
    return educatorAccess.listChildrenForEducateurCurrentYear(currentUser.id, {
      search,
      page,
      limit,
    });
  }
  const filters = {};
  if (search) filters.q = search;
  if (parent_user_id !== undefined) filters.parent_user_id = parent_user_id;

  return repo.findAll(filters, { page, limit });
};

exports.get = async (id, currentUser) => {
  const enfant = await repo.findById(id);
  if (!enfant) {
    const e = new Error("Enfant introuvable");
    e.status = 404;
    throw e;
  }
  // If requester is PARENT, ensure ownership
  if (
    currentUser?.role === "PARENT" &&
    enfant.parent_user_id !== currentUser.id
  ) {
    const e = new Error("Accès refusé");
    e.status = 403;
    throw e;
  }
  if (currentUser?.role === "EDUCATEUR") {
    await educatorAccess.assertCanAccessChild(currentUser.id, id);
  }
  return enfant;
};

exports.timeline = async (enfantId, options = {}, currentUser) => {
  const enfant = await repo.findById(enfantId);
  if (!enfant) {
    const e = new Error("Enfant introuvable");
    e.status = 404;
    throw e;
  }

  const role = currentUser?.role;
  if (role === "PARENT") {
    if (enfant.parent_user_id !== currentUser.id) {
      const e = new Error("Accès refusé");
      e.status = 403;
      throw e;
    }
  } else if (role === "EDUCATEUR") {
    await educatorAccess.assertCanAccessChild(currentUser.id, enfantId);
  } else if (role !== "PRESIDENT" && role !== "DIRECTEUR") {
    const e = new Error("Accès refusé");
    e.status = 403;
    throw e;
  }

  const normalizedLimit = Math.max(1, Math.min(toPositiveInt(options?.limit, 100), 200));
  const parsedYear = Number(options?.anneeId);
  const targetYear = Number.isInteger(parsedYear) && parsedYear > 0 ? parsedYear : null;

  const peiWhere = { enfant_id: enfantId };
  if (targetYear) {
    peiWhere.annee_id = targetYear;
  }

  const peis = await PEI.findAll({
    where: peiWhere,
    attributes: [
      "id",
      "annee_id",
      "statut",
      "date_creation",
      "date_validation",
      "objectifs",
      "est_actif",
      "created_at",
    ],
    order: [["date_creation", "DESC"]],
  });

  const peiIds = peis.map((p) => p.id);

  const [notes, activities, evaluations] = await Promise.all([
    peiIds.length
      ? DailyNote.findAll({
          where: { enfant_id: enfantId, projet_id: peiIds },
          attributes: ["id", "date_note", "contenu", "type", "projet_id", "created_at"],
          order: [
            ["date_note", "DESC"],
            ["id", "DESC"],
          ],
        })
      : [],
    peiIds.length
      ? ActiviteProjet.findAll({
          where: { enfant_id: enfantId, projet_id: peiIds },
          attributes: [
            "id",
            "titre",
            "description",
            "date_activite",
            "type",
            "projet_id",
            "created_at",
          ],
          order: [
            ["date_activite", "DESC"],
            ["id", "DESC"],
          ],
        })
      : [],
    peiIds.length
      ? EvaluationProjet.findAll({
          where: { projet_id: peiIds },
          attributes: [
            "id",
            "score",
            "notes",
            "date_evaluation",
            "projet_id",
            "created_at",
          ],
          order: [
            ["date_evaluation", "DESC"],
            ["id", "DESC"],
          ],
        })
      : [],
  ]);

  const normalizeDate = (value) => {
    const d = value ? new Date(value) : null;
    return d && !Number.isNaN(d.getTime()) ? d.toISOString() : new Date(0).toISOString();
  };

  const items = [];

  for (const pei of peis) {
    items.push({
      id: `pei-${pei.id}`,
      type: "pei",
      date: normalizeDate(pei.date_validation || pei.date_creation || pei.created_at),
      title: `PEI ${pei.statut}`,
      description: pei.objectifs || undefined,
      meta: { anneeId: pei.annee_id, est_actif: pei.est_actif },
    });
  }

  for (const note of notes) {
    items.push({
      id: `daily_note-${note.id}`,
      type: "daily_note",
      date: normalizeDate(note.date_note || note.created_at),
      title: note.type ? `Note ${note.type}` : "Note quotidienne",
      description: note.contenu || undefined,
      meta: { peiId: note.projet_id },
    });
  }

  for (const activity of activities) {
    items.push({
      id: `activity-${activity.id}`,
      type: "activity",
      date: normalizeDate(activity.date_activite || activity.created_at),
      title: activity.titre,
      description: activity.description || undefined,
      meta: { peiId: activity.projet_id, type: activity.type },
    });
  }

  for (const evaluation of evaluations) {
    items.push({
      id: `evaluation-${evaluation.id}`,
      type: "evaluation",
      date: normalizeDate(evaluation.date_evaluation || evaluation.created_at),
      title:
        evaluation.score != null
          ? `Évaluation (${evaluation.score})`
          : "Évaluation",
      description: evaluation.notes || undefined,
      meta: { peiId: evaluation.projet_id, score: evaluation.score },
    });
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return items.slice(0, normalizedLimit);
};

exports.create = async (payload) => {
  return sequelize.transaction(async (t) => {
    const enfant = await repo.create(
      {
        nom: payload.nom,
        prenom: payload.prenom,
        date_naissance: payload.date_naissance,
        parent_user_id:
          payload.parent_user_id != null
            ? Number(payload.parent_user_id)
            : null,
      },
      t
    );
    return enfant;
  });
};

exports.update = async (id, payload) => {
  return sequelize.transaction(async (t) => {
    const exists = await repo.findById(id, t);
    if (!exists) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }
    const n = await repo.updateById(id, payload, t);
    if (!n) {
      const e = new Error("Aucune modification");
      e.status = 400;
      throw e;
    }
    return repo.findById(id, t);
  });
};

exports.remove = async (id) => {
  return sequelize.transaction(async (t) => {
    const exists = await repo.findById(id, t);
    if (!exists) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }

    // If your DB FKs have ON DELETE CASCADE to fiche tables, this is enough.
    // If you need app-level cascade, delete here via repos before deleting enfant.

    await repo.deleteById(id, t);
    return { deleted: true };
  });
};

exports.linkParent = async (id, parent_user_id) => {
  return sequelize.transaction(async (t) => {
    const enfant = await repo.findById(id, t);
    if (!enfant) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }
    const parent = await Utilisateur.findOne({
      where: { id: parent_user_id, role: "PARENT", is_active: true },
      transaction: t,
    });
    if (!parent) {
      const e = new Error("Parent introuvable ou inactif");
      e.status = 404;
      throw e;
    }
    await repo.linkParent(id, parent_user_id, t);
    return repo.findById(id, t);
  });
};

exports.unlinkParent = async (id) => {
  return sequelize.transaction(async (t) => {
    const enfant = await repo.findById(id, t);
    if (!enfant) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }
    await repo.unlinkParent(id, t);
    return repo.findById(id, t);
  });
};

exports.listForParent = async (parentId, q) => {
  const page = toPositiveInt(q?.page, DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, toPositiveInt(q?.limit, DEFAULT_LIMIT));
  const activeYear = await anneesRepo.findActive();

  if (!activeYear) {
    const err = new Error("Aucune année scolaire active");
    err.status = 409;
    throw err;
  }

  const { rows, count } = await repo.findByParent(
    parentId,
    { page, limit, annee_id: activeYear.id }
  );

  const items = rows.map((row) => {
    const enfant = row.get({ plain: true });
    const activeInscription = Array.isArray(enfant.inscriptions)
      ? enfant.inscriptions[0]
      : null;
    const groupe = activeInscription?.groupe || null;
    const affectation = Array.isArray(groupe?.affectations)
      ? groupe.affectations[0]
      : null;
    const educateur = affectation?.educateur || null;

    return {
      id: enfant.id,
      prenom: enfant.prenom,
      nom: enfant.nom,
      date_naissance: enfant.date_naissance,
      diagnostic: enfant.diagnostic ?? null,
      besoins_specifiques: enfant.besoins_specifiques ?? null,
      allergies: enfant.allergies ?? null,
      photo_url: enfant.photo_url ?? null,
      groupe_actuel: groupe
        ? { id: groupe.id, nom: groupe.nom, annee_id: groupe.annee_id }
        : null,
      educateur_referent: educateur
        ? { id: educateur.id, nom: educateur.nom, prenom: educateur.prenom }
        : null,
      active_pei: enfant.active_pei ?? null,
      parent: enfant.parent ?? null,
      last_note_date: enfant.last_note_date ?? null,
      last_note_preview: enfant.last_note_preview ?? null,
      thread_id: enfant.thread_id ?? null,
    };
  });

  return {
    data: items,
    meta: {
      page,
      limit,
      total: count,
      hasMore: page * limit < count,
    },
  };
};

/**
 * Helper: create parent account from parents_fiche and link to child.
 * - Requires that parents_fiche exists for the child (to fill names/phones)
 * - Checks email uniqueness
 * - Hashes password
 * - Creates Utilisateur with role=PARENT
 * - Links enfant.parent_user_id
 */
exports.createParentAccount = async (
  enfantId,
  { email, mot_de_passe },
  currentUser
) => {
  return sequelize.transaction(async (t) => {
    // 1) Child must exist
    const enfant = await Enfant.findByPk(enfantId, { transaction: t });
    if (!enfant) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }
    // 2) Must not already be linked
    if (enfant.parent_user_id) {
      const e = new Error("Un parent est déjà lié à cet enfant");
      e.status = 409;
      throw e;
    }
    // 3) parents_fiche must exist
    const pf = await ParentsFiche.findOne({
      where: { enfant_id: enfantId },
      transaction: t,
    });
    if (!pf) {
      const e = new Error(
        "Fiche parents introuvable. Veuillez la renseigner d'abord."
      );
      e.status = 409;
      throw e;
    }
    // 4) email unique among all users
    const emailUsed = await Utilisateur.findOne({
      where: { email },
      transaction: t,
    });
    if (emailUsed) {
      const e = new Error("Email déjà utilisé");
      e.status = 409;
      throw e;
    }
    // 5) Build display name from fiche
    const nom = pf.mere_nom || pf.pere_nom || "Parent";
    const prenom = pf.mere_prenom || pf.pere_prenom || "Compte";
    const telephone = pf.mere_tel_portable || pf.pere_tel_portable || null;

    // 6) Hash password
    const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);

    // 7) Create parent user
    const parentUser = await Utilisateur.create(
      {
        nom,
        prenom,
        email,
        mot_de_passe: hash,
        telephone,
        role: "PARENT",
        is_active: true,
        avatar_url: null,
      },
      { transaction: t }
    );

    // 8) Link child to new parent
    await Enfant.update(
      { parent_user_id: parentUser.id },
      { where: { id: enfantId }, transaction: t }
    );

    // 9) Return compact result
    const linked = await Enfant.findByPk(enfantId, { transaction: t });
    return {
      enfant: { id: linked.id, nom: linked.nom, prenom: linked.prenom },
      parent: {
        id: parentUser.id,
        email: parentUser.email,
        role: parentUser.role,
      },
      linked: true,
    };
  });
};
