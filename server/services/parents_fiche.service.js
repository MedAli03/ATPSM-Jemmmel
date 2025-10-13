"use strict";

const { sequelize, Enfant } = require("../models");
const repo = require("../repos/parents_fiche.repo");

exports.getByEnfant = async (enfantId) => {
  const fiche = await repo.findByEnfantId(enfantId);
  if (!fiche) {
    const e = new Error("Fiche parents introuvable");
    e.status = 404;
    throw e;
  }
  return fiche;
};

exports.upsert = async (enfantId, payload) => {
  return sequelize.transaction(async (t) => {
    // Vérifier que l'enfant existe
    const enfant = await Enfant.findByPk(enfantId, { transaction: t });
    if (!enfant) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }

    // Upsert fiche parents
    const fiche = await repo.upsert(enfantId, payload, t);
    return fiche?.get ? fiche.get({ plain: true }) : fiche;
  });
};
