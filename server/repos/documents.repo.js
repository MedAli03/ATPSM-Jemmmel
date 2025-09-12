"use strict";

const { Op } = require("sequelize");
const { Document, Utilisateur } = require("../models");

exports.findById = (id, t = null) =>
  Document.findByPk(id, {
    include: [
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
  if (filters.type) where.type = filters.type;
  if (filters.statut) where.statut = filters.statut;
  if (filters.q) {
    where[Op.or] = [
      { titre: { [Op.like]: `%${filters.q}%` } },
      { url: { [Op.like]: `%${filters.q}%` } },
    ];
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Document.findAndCountAll({
    where,
    include: [
      {
        model: Utilisateur,
        as: "admin",
        attributes: ["id", "nom", "prenom", "email"],
      },
    ],
    order: [["created_at", "DESC"]],
    offset,
    limit,
    transaction: t,
  });

  return { rows, count, page, limit };
};

exports.create = (attrs, t = null) =>
  Document.create(attrs, { transaction: t });

exports.updateById = async (id, attrs, t = null) => {
  const [n] = await Document.update(attrs, { where: { id }, transaction: t });
  return n;
};

exports.deleteById = (id, t = null) =>
  Document.destroy({ where: { id }, transaction: t });
