"use strict";

const repo = require("../repos/annees.repo");
const { AnneeScolaire } = require("../models");

exports.list = async (filters = {}) => repo.findAll(filters);

exports.get = async (id) => {
  const item = await repo.findById(id);
  if (!item) {
    const err = new Error("Année scolaire introuvable");
    err.status = 404;
    throw err;
  }
  return item;
};

exports.getActive = async () => repo.findActive();

exports.create = async (payload) => {
  // Ne pas activer à la création
  if (payload.est_active === true) payload.est_active = false;

  // Unicité libelle
  const existing = await AnneeScolaire.findOne({
    where: { libelle: payload.libelle },
  });
  if (existing) {
    const err = new Error("libelle déjà utilisé");
    err.status = 409;
    throw err;
  }
  return repo.create(payload);
};

exports.update = async (id, payload) => {
  if (payload.est_active !== undefined) delete payload.est_active;

  if (payload.libelle) {
    const dup = await AnneeScolaire.findOne({
      where: { libelle: payload.libelle },
    });
    if (dup && dup.id !== Number(id)) {
      const err = new Error("libelle déjà utilisé");
      err.status = 409;
      throw err;
    }
  }

  const nb = await repo.updateById(id, payload);
  if (nb === 0) {
    const err = new Error("Année scolaire introuvable");
    err.status = 404;
    throw err;
  }
  return repo.findById(id);
};

exports.remove = async (id) => {
  const usage = await repo.countUsages(id);
  if (usage.groupes > 0 || usage.peis > 0) {
    const err = new Error(
      "Suppression impossible : l'année est référencée (groupes/PEI)."
    );
    err.status = 409;
    throw err;
  }
  const nb = await repo.deleteById(id);
  if (nb === 0) {
    const err = new Error("Année scolaire introuvable");
    err.status = 404;
    throw err;
  }
  return { deleted: true };
};

exports.activate = async (id) => {
  const found = await repo.findById(id);
  if (!found) {
    const err = new Error("Année scolaire introuvable");
    err.status = 404;
    throw err;
  }
  const nb = await repo.setActive(id);
  if (!nb) {
    const err = new Error("Activation non effectuée");
    err.status = 500;
    throw err;
  }
  return repo.findById(id);
};
