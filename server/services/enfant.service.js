"use strict";

const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const { sequelize, Enfant, Utilisateur, ParentsFiche } = require("../models");
const repo = require("../repos/enfant.repo");

exports.list = (q) =>
  repo.findAll({ q: q.q }, { page: q.page, limit: q.limit });

exports.search = async (query) => {
  const limit = Math.min(20, Math.max(1, Number(query.limit || 10)));
  const term = query.q || query.query || null;
  const rows = await repo.search(term, limit);
  return rows.map((row) =>
    row.get
      ? row.get({ plain: true })
      : {
          id: row.id,
          nom: row.nom,
          prenom: row.prenom,
          date_naissance: row.date_naissance,
          parent_user_id: row.parent_user_id,
        }
  );
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
  return enfant;
};

exports.create = async (payload) => {
  return sequelize.transaction(async (t) => {
    const enfant = await repo.create(
      {
        nom: payload.nom,
        prenom: payload.prenom,
        date_naissance: payload.date_naissance,
        parent_user_id: null, // linked later
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

exports.listForParent = (parentId, q) =>
  repo.findByParent(parentId, { page: q.page, limit: q.limit });

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
