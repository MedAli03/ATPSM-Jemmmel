"use strict";

const { Op } = require("sequelize");
const { Evenement, Document, Utilisateur } = require("../models");

exports.findById = (id, t = null) =>
  Evenement.findByPk(id, {
    include: [
      { model: Document, as: "document" },
      {
        model: Utilisateur,
        as: "admin",
        attributes: ["id", "nom", "prenom", "email"],
      },
    ],
    transaction: t,
  });

exports.list = async (filters = {}, pagination = {}, t = null) => {
  const where = {};
  if (filters.audience) where.audience = filters.audience;
  if (filters.date_debut || filters.date_fin) {
    where.debut = {};
    if (filters.date_debut) where.debut[Op.gte] = filters.date_debut;
    if (filters.date_fin) where.debut[Op.lte] = filters.date_fin;
  }
  if (filters.q) {
    where[Op.or] = [
      { titre: { [Op.like]: `%${filters.q}%` } },
      { lieu: { [Op.like]: `%${filters.q}%` } },
    ];
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Evenement.findAndCountAll({
    where,
    include: [
      { model: Document, as: "document" },
      {
        model: Utilisateur,
        as: "admin",
        attributes: ["id", "nom", "prenom", "email"],
      },
    ],
    order: [["debut", "DESC"]],
    offset,
    limit,
    transaction: t,
  });

  return { rows, count, page, limit };
};

exports.create = (attrs, t = null) =>
  Evenement.create(attrs, { transaction: t });

exports.updateById = async (id, attrs, t = null) => {
  const [n] = await Evenement.update(attrs, { where: { id }, transaction: t });
  return n;
};

exports.deleteById = (id, t = null) =>
  Evenement.destroy({ where: { id }, transaction: t });

exports.listUpcoming = async ({ limit = 5 } = {}, t = null) => {
  const now = new Date();
  return Evenement.findAll({
    where: { debut: { [Op.gte]: now } },
    include: [
      { model: Document, as: "document" },
      {
        model: Utilisateur,
        as: "admin",
        attributes: ["id", "nom", "prenom", "email"],
      },
    ],
    order: [["debut", "ASC"]],
    limit,
    transaction: t,
  });
};
