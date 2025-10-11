"use strict";

const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const enfantsRepo = require("../repos/enfant.repo");
const ficheRepo = require("../repos/fiche_enfant.repo");
const { sequelize, Utilisateur } = require("../models");
const repo = require("../repos/parents.repo");

function normalizeParent(entity, { includeChildren = false } = {}) {
  if (!entity) return null;
  const plain = entity.get ? entity.get({ plain: true }) : entity;
  const enfants = Array.isArray(plain.enfants) ? plain.enfants : [];
  const mappedChildren = enfants.map((enfant) => {
    const child = enfant.get ? enfant.get({ plain: true }) : enfant;
    const inscription = Array.isArray(child.inscriptions)
      ? child.inscriptions.find((ins) => ins && ins.est_active !== false)
      : null;
    return {
      id: child.id,
      nom: child.nom,
      prenom: child.prenom,
      date_naissance: child.date_naissance,
      groupe_actif: inscription && inscription.groupe
        ? {
            id: inscription.groupe.id,
            nom: inscription.groupe.nom,
            annee_id: inscription.annee_id || inscription.annee?.id || null,
            annee:
              inscription.annee?.libelle || inscription.annee?.annee_scolaire || null,
          }
        : null,
    };
  });

  const result = {
    ...plain,
    children_count: mappedChildren.length,
    missing_contact:
      (!plain.email || plain.email === "") &&
      (!plain.telephone || plain.telephone === ""),
  };

  if (includeChildren) {
    result.enfants = mappedChildren;
  } else {
    delete result.enfants;
  }

  return result;
}

exports.list = async (q) => {
  const page = q.page;
  const limit = q.limit;
  const { rows, count } = await repo.findAll(
    {
      search: q.search,
      status: q.status,
      hasContact: q.has_contact,
    },
    { page, limit }
  );

  return {
    items: rows.map((row) => normalizeParent(row, { includeChildren: false })),
    total: Array.isArray(count) ? count.length : count,
    page,
    limit,
  };
};

exports.get = async (id) => {
  const parent = await repo.findById(id);
  if (!parent) {
    const e = new Error("Parent introuvable");
    e.status = 404;
    throw e;
  }
  return normalizeParent(parent, { includeChildren: true });
};

exports.create = async (payload) => {
  return sequelize.transaction(async (t) => {
    // email unique
    const exists = await repo.findByEmailAny(payload.email, t);
    if (exists) {
      const e = new Error("Email déjà utilisé");
      e.status = 409;
      throw e;
    }

    // hash pwd
    const hash = await bcrypt.hash(payload.mot_de_passe, SALT_ROUNDS);

    // role forcé = PARENT
    if (!payload.email && !payload.telephone) {
      const e = new Error("Téléphone ou email requis");
      e.status = 422;
      throw e;
    }

    const created = await repo.create(
      {
        nom: payload.nom,
        prenom: payload.prenom,
        email: payload.email,
        mot_de_passe: hash,
        telephone: payload.telephone || null,
        adresse: payload.adresse || null,
        role: "PARENT",
        is_active:
          typeof payload.is_active === "boolean" ? payload.is_active : true,
        avatar_url: payload.avatar_url || null,
      },
      t
    );

    const safe = await repo.findById(created.id, t);
    return normalizeParent(safe, { includeChildren: true });
  });
};

exports.update = async (id, payload) => {
  return sequelize.transaction(async (t) => {
    const parent = await repo.findById(id, t);
    if (!parent) {
      const e = new Error("Parent introuvable");
      e.status = 404;
      throw e;
    }

    // email unique si modifié
    if (payload.email && payload.email !== parent.email) {
      const exists = await repo.findByEmailAny(payload.email, t);
      if (exists && exists.id !== id) {
        const e = new Error("Email déjà utilisé");
        e.status = 409;
        throw e;
      }
    }

    // on n'autorise pas le changement de role ici
    const nextEmail = payload.email ?? parent.email;
    const nextPhone =
      payload.telephone !== undefined ? payload.telephone : parent.telephone;
    const nextAdresse =
      payload.adresse !== undefined ? payload.adresse : parent.adresse;
    if (!nextEmail && !nextPhone) {
      const e = new Error("Téléphone ou email requis");
      e.status = 422;
      throw e;
    }

    const sanitizedPhone =
      typeof nextPhone === "string" && nextPhone.trim() === ""
        ? null
        : nextPhone;
    const sanitizedAdresse =
      typeof nextAdresse === "string" && nextAdresse.trim() === ""
        ? null
        : nextAdresse;

    const toUpdate = {
      nom: payload.nom ?? parent.nom,
      prenom: payload.prenom ?? parent.prenom,
      email: nextEmail,
      telephone: sanitizedPhone,
      adresse: sanitizedAdresse,
      is_active:
        typeof payload.is_active === "boolean"
          ? payload.is_active
          : parent.is_active,
      avatar_url: payload.avatar_url ?? parent.avatar_url,
    };

    const n = await repo.updateById(id, toUpdate, t);
    if (!n) {
      const e = new Error("Aucune modification");
      e.status = 400;
      throw e;
    }
    const fresh = await repo.findById(id, t);
    return normalizeParent(fresh, { includeChildren: true });
  });
};

exports.changePassword = async (id, mot_de_passe) => {
  return sequelize.transaction(async (t) => {
    const parent = await repo.findById(id, t);
    if (!parent) {
      const e = new Error("Parent introuvable");
      e.status = 404;
      throw e;
    }
    const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);
    const n = await repo.changePassword(id, hash, t);
    if (!n) {
      const e = new Error("Aucune modification");
      e.status = 400;
      throw e;
    }
    return { changed: true };
  });
};

exports.children = async (id, q) => {
  // vérifie que le parent existe
  const parent = await repo.findById(id);
  if (!parent) {
    const e = new Error("Parent introuvable");
    e.status = 404;
    throw e;
  }
  const data = await repo.childrenOfParent(id, { page: q.page, limit: q.limit });
  const rows = data.rows.map((child) => {
    const plain = child.get ? child.get({ plain: true }) : child;
    const inscription = Array.isArray(plain.inscriptions)
      ? plain.inscriptions.find((ins) => ins && ins.est_active !== false)
      : null;
    return {
      id: plain.id,
      nom: plain.nom,
      prenom: plain.prenom,
      date_naissance: plain.date_naissance,
      groupe_actif: inscription && inscription.groupe
        ? {
            id: inscription.groupe.id,
            nom: inscription.groupe.nom,
            annee_id: inscription.annee_id || inscription.annee?.id || null,
            annee:
              inscription.annee?.libelle || inscription.annee?.annee_scolaire || null,
          }
        : null,
    };
  });
  return {
    rows,
    count: data.count,
    page: data.page,
    limit: data.limit,
  };
};

exports.archive = async (id, active) => {
  return sequelize.transaction(async (t) => {
    const parent = await repo.findById(id, t);
    if (!parent) {
      const e = new Error("Parent introuvable");
      e.status = 404;
      throw e;
    }
    await repo.updateById(id, { is_active: active }, t);
    const fresh = await repo.findById(id, t);
    return normalizeParent(fresh, { includeChildren: true });
  });
};

exports.linkChild = async (parentId, enfantId) => {
  return sequelize.transaction(async (t) => {
    const parent = await repo.findById(parentId, t);
    if (!parent) {
      const e = new Error("Parent introuvable");
      e.status = 404;
      throw e;
    }

    const child = await enfantsRepo.findById(enfantId, t);
    if (!child) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }
    if (child.parent_user_id && child.parent_user_id !== parentId) {
      const e = new Error("Enfant déjà lié à un autre parent");
      e.status = 409;
      throw e;
    }

    await repo.linkChild(parentId, enfantId, t);
    const fresh = await repo.findById(parentId, t);
    return normalizeParent(fresh, { includeChildren: true });
  });
};

exports.unlinkChild = async (parentId, enfantId) => {
  return sequelize.transaction(async (t) => {
    const parent = await repo.findById(parentId, t);
    if (!parent) {
      const e = new Error("Parent introuvable");
      e.status = 404;
      throw e;
    }

    const child = await enfantsRepo.findById(enfantId, t);
    if (!child || child.parent_user_id !== parentId) {
      const e = new Error("Lien introuvable");
      e.status = 404;
      throw e;
    }

    await repo.unlinkChild(parentId, enfantId, t);
    const fresh = await repo.findById(parentId, t);
    return normalizeParent(fresh, { includeChildren: true });
  });
};

/**
 * Créer un NOUVEL enfant pour un parent existant (déjà lié à un autre enfant)
 * - Vérifie que le parent existe, est actif et a le rôle PARENT
 * - Crée l'enfant lié (parent_user_id = parentId)
 * - Upsert la fiche_enfant si fournie
 */
exports.createChildForParent = async (parentId, payload) => {
  return sequelize.transaction(async (t) => {
    // 1) Vérifier parent
    const parent = await Utilisateur.findOne({
      where: { id: parentId, role: "PARENT", is_active: true },
      transaction: t,
    });
    if (!parent) {
      const e = new Error("Parent introuvable ou inactif");
      e.status = 404;
      throw e;
    }

    // 2) Créer enfant (lié au parent)
    const enfant = await enfantsRepo.create(
      {
        nom: payload.enfant.nom,
        prenom: payload.enfant.prenom,
        date_naissance: payload.enfant.date_naissance,
        parent_user_id: parentId,
      },
      t
    );

    // 3) Upsert fiche_enfant (si fournie)
    let fiche = null;
    if (payload.fiche && Object.keys(payload.fiche).length > 0) {
      fiche = await ficheRepo.upsert(enfant.id, payload.fiche, t);
    }

    // 4) Retour
    return {
      enfant,
      fiche: fiche || null,
      parent: { id: parent.id, email: parent.email },
    };
  });
};
