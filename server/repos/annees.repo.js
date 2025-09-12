"use strict";

const {
  sequelize,
  AnneeScolaire, // from models/index.js
  Groupe,
  PEI,
} = require("../models");
const { Op } = require("sequelize");

exports.create = async (payload, t = null) => {
  return AnneeScolaire.create(payload, { transaction: t });
};

exports.findById = async (id, t = null) => {
  return AnneeScolaire.findByPk(id, { transaction: t });
};

exports.findAll = async (filters = {}, t = null) => {
  const where = {};
  if (filters.libelle) where.libelle = { [Op.like]: `%${filters.libelle}%` };
  return AnneeScolaire.findAll({ where, transaction: t });
};

exports.findActive = async (t = null) => {
  return AnneeScolaire.scope("active").findOne({ transaction: t });
};

exports.updateById = async (id, attrs, t = null) => {
  const [nb] = await AnneeScolaire.update(attrs, {
    where: { id },
    transaction: t,
  });
  return nb;
};

exports.deleteById = async (id, t = null) => {
  return AnneeScolaire.destroy({ where: { id }, transaction: t });
};

exports.countUsages = async (anneeId, t = null) => {
  const [gCount, pCount] = await Promise.all([
    Groupe.count({ where: { annee_id: anneeId }, transaction: t }),
    PEI.count({ where: { annee_id: anneeId }, transaction: t }),
  ]);
  return { groupes: gCount, peis: pCount };
};

exports.setActive = async (anneeId, extTransaction = null) => {
  const run = async (t) => {
    await AnneeScolaire.update(
      { est_active: false },
      { where: {}, transaction: t }
    );
    const [nb] = await AnneeScolaire.update(
      { est_active: true },
      { where: { id: anneeId }, transaction: t }
    );
    return nb;
  };
  if (extTransaction) return run(extTransaction);
  return sequelize.transaction(run);
};
