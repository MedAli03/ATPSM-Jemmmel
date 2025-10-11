"use strict";

let bcrypt;
try {
  bcrypt = require("bcrypt");
} catch (e) {
  bcrypt = require("bcryptjs");
}

const { sequelize } = require("../models");
const repo = require("../repos/educateurs.repo");

function normalizeEducateur(entity) {
  if (!entity) return null;
  const plain = entity.get ? entity.get({ plain: true }) : entity;
  const affectations = Array.isArray(plain.affectations) ? plain.affectations : [];
  const groupes = affectations
    .filter((aff) => aff && aff.est_active !== false && aff.groupe)
    .map((aff) => ({
      id: aff.groupe.id,
      nom: aff.groupe.nom,
      annee_id: aff.annee_id || aff.annee?.id || null,
      annee: aff.annee
        ? aff.annee.libelle || aff.annee.annee_scolaire || null
        : null,
    }));

  return {
    ...plain,
    groupes_actuels: groupes,
  };
}

exports.list = async (query) => {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const search = query.search ? String(query.search).trim() : undefined;
  const status = query.status || "all";
  const anneeId = query.annee_id ? Number(query.annee_id) : undefined;

  const { rows, count } = await repo.findAll(
    { search, status, anneeId },
    { page, limit }
  );

  return {
    items: rows.map(normalizeEducateur),
    total: count,
    page,
    limit,
  };
};

exports.get = async (id, options = {}) => {
  const entity = await repo.findById(id, { anneeId: options.annee_id });
  if (!entity) {
    const err = new Error("Éducateur introuvable");
    err.status = 404;
    throw err;
  }
  return normalizeEducateur(entity);
};

exports.create = async (payload) => {
  return sequelize.transaction(async (t) => {
    const existing = await repo.findByEmail(payload.email, t);
    if (existing) {
      const err = new Error("Email déjà utilisé");
      err.status = 409;
      throw err;
    }

    const hash = await bcrypt.hash(payload.mot_de_passe, 10);
    const created = await repo.create(
      {
        nom: payload.nom,
        prenom: payload.prenom,
        email: payload.email,
        mot_de_passe: hash,
        telephone: payload.telephone || null,
        avatar_url: payload.avatar_url || null,
        role: "EDUCATEUR",
        is_active:
          typeof payload.is_active === "boolean" ? payload.is_active : true,
      },
      t
    );

    return normalizeEducateur(created);
  });
};

exports.update = async (id, payload) => {
  return sequelize.transaction(async (t) => {
    const entity = await repo.findById(id, {});
    if (!entity) {
      const err = new Error("Éducateur introuvable");
      err.status = 404;
      throw err;
    }

    if (payload.email && payload.email !== entity.email) {
      const existing = await repo.findByEmail(payload.email, t);
      if (existing && existing.id !== id) {
        const err = new Error("Email déjà utilisé");
        err.status = 409;
        throw err;
      }
    }

    const attrs = { ...payload };
    if (attrs.mot_de_passe) {
      attrs.mot_de_passe = await bcrypt.hash(attrs.mot_de_passe, 10);
    }
    attrs.role = "EDUCATEUR";

    await repo.updateById(id, attrs, t);
    const fresh = await repo.findById(id, {});
    return normalizeEducateur(fresh);
  });
};

exports.archive = async (id) => {
  return sequelize.transaction(async (t) => {
    const updated = await repo.toggleActive(id, false, t);
    if (!updated) {
      const err = new Error("Éducateur introuvable");
      err.status = 404;
      throw err;
    }
    return normalizeEducateur(updated);
  });
};

exports.unarchive = async (id) => {
  return sequelize.transaction(async (t) => {
    const updated = await repo.toggleActive(id, true, t);
    if (!updated) {
      const err = new Error("Éducateur introuvable");
      err.status = 404;
      throw err;
    }
    return normalizeEducateur(updated);
  });
};
