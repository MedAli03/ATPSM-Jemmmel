"use strict";

const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;
const enfantsRepo = require("../repos/enfant.repo");
const ficheRepo = require("../repos/fiche_enfant.repo");
const { sequelize, Utilisateur } = require("../models");
const repo = require("../repos/parents.repo");

exports.list = (q) =>
  repo.findAll(
    { q: q.q, is_active: q.is_active },
    { page: q.page, limit: q.limit }
  );

exports.get = async (id) => {
  const parent = await repo.findById(id);
  if (!parent) {
    const e = new Error("Parent introuvable");
    e.status = 404;
    throw e;
  }
  return parent;
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
    const created = await repo.create(
      {
        nom: payload.nom,
        prenom: payload.prenom,
        email: payload.email,
        mot_de_passe: hash,
        telephone: payload.telephone || null,
        role: "PARENT",
        is_active:
          typeof payload.is_active === "boolean" ? payload.is_active : true,
        avatar_url: payload.avatar_url || null,
      },
      t
    );

    // hide password in returned payload
    const safe = await repo.findById(created.id, t);
    return safe;
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
    const toUpdate = {
      nom: payload.nom ?? parent.nom,
      prenom: payload.prenom ?? parent.prenom,
      email: payload.email ?? parent.email,
      telephone: payload.telephone ?? parent.telephone,
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
    return repo.findById(id, t);
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
  return repo.childrenOfParent(id, { page: q.page, limit: q.limit });
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
