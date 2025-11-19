"use strict";

const repo = require("../repos/observation_initiale.repo");
const educatorAccess = require("./educateur_access.service");

/**
 * List with filters & pagination
 */
exports.list = async (
  { enfant_id, educateur_id, date_debut, date_fin, page, limit },
  currentUser
) => {
  const filters = { enfant_id, educateur_id, date_debut, date_fin };
  if (currentUser?.role === "EDUCATEUR") {
    const { enfantIds } = await educatorAccess.listAccessibleChildIds(
      currentUser.id
    );
    if (!enfantIds.length) {
      return { rows: [], count: 0, page: page || 1, limit: limit || 20 };
    }
    if (enfant_id) {
      if (!enfantIds.includes(Number(enfant_id))) {
        return { rows: [], count: 0, page: page || 1, limit: limit || 20 };
      }
    } else {
      filters.enfant_ids = enfantIds;
    }
    filters.educateur_id = currentUser.id;
  }
  return repo.list(filters, { page, limit });
};

/**
 * Get one by id
 */
exports.get = async (id, currentUser) => {
  const item = await repo.findById(id);
  if (!item) {
    const err = new Error("Observation introuvable");
    err.status = 404;
    throw err;
  }
  if (currentUser?.role === "EDUCATEUR") {
    await educatorAccess.assertCanAccessChild(currentUser.id, item.enfant_id);
  }
  return item;
};

/**
 * Create — educateur_id enforced from JWT
 */
exports.create = async (
  { enfant_id, date_observation, contenu },
  currentUser
) => {
  if (currentUser?.role === "EDUCATEUR") {
    await educatorAccess.assertCanAccessChild(currentUser.id, enfant_id);
  }
  const payload = {
    enfant_id,
    educateur_id: currentUser.id,
    date_observation,
    contenu,
  };
  return repo.create(payload);
};

/**
 * Update — only owner (educateur) or DIRECTEUR/PRESIDENT
 */
exports.update = async (id, attrs, currentUser) => {
  const existing = await repo.findById(id);
  if (!existing) {
    const err = new Error("Observation introuvable");
    err.status = 404;
    throw err;
  }

  if (currentUser?.role === "EDUCATEUR") {
    await educatorAccess.assertCanAccessChild(currentUser.id, existing.enfant_id);
  }
  const isOwner = existing.educateur_id === currentUser.id;
  const isAdmin = ["DIRECTEUR", "PRESIDENT"].includes(currentUser.role);

  if (!isOwner && !isAdmin) {
    const err = new Error("Accès refusé");
    err.status = 403;
    throw err;
  }

  const updateAttrs = {};
  if (attrs.date_observation !== undefined)
    updateAttrs.date_observation = attrs.date_observation;
  if (attrs.contenu !== undefined) updateAttrs.contenu = attrs.contenu;

  const nb = await repo.updateById(id, updateAttrs);
  if (nb === 0) {
    const err = new Error("Aucune modification effectuée");
    err.status = 400;
    throw err;
  }
  return repo.findById(id);
};

/**
 * Delete — only owner or DIRECTEUR/PRESIDENT
 */
exports.remove = async (id, currentUser) => {
  const existing = await repo.findById(id);
  if (!existing) {
    const err = new Error("Observation introuvable");
    err.status = 404;
    throw err;
  }

  if (currentUser?.role === "EDUCATEUR") {
    await educatorAccess.assertCanAccessChild(currentUser.id, existing.enfant_id);
  }
  const isOwner = existing.educateur_id === currentUser.id;
  const isAdmin = ["DIRECTEUR", "PRESIDENT"].includes(currentUser.role);

  if (!isOwner && !isAdmin) {
    const err = new Error("Accès refusé");
    err.status = 403;
    throw err;
  }

  await repo.deleteById(id);
  return { deleted: true };
};
