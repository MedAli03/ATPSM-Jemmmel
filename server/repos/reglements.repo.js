"use strict";

const { Op } = require("sequelize");
const { Reglement, Document, Utilisateur } = require("../models");

exports.findById = (id, t = null) =>
  Reglement.findByPk(id, {
    include: [
      {
        model: Document,
        as: "document",
        include: [
          {
            model: Utilisateur,
            as: "admin",
            attributes: ["id", "nom", "prenom", "email"],
          },
        ],
      },
    ],
    transaction: t,
  });

exports.list = async (filters = {}, pagination = {}, t = null) => {
  const where = {};
  if (filters.document_id) where.document_id = filters.document_id;
  if (filters.q) where.version = { [Op.like]: `%${filters.q}%` };

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Reglement.findAndCountAll({
    where,
    include: [
      {
        model: Document,
        as: "document",
        include: [
          {
            model: Utilisateur,
            as: "admin",
            attributes: ["id", "nom", "prenom", "email"],
          },
        ],
      },
    ],
    order: [["date_effet", "DESC"]],
    offset,
    limit,
    transaction: t,
  });

  return { rows, count, page, limit };
};

exports.create = (attrs, t = null) =>
  Reglement.create(attrs, { transaction: t });

exports.updateById = async (id, attrs, t = null) => {
  const [n] = await Reglement.update(attrs, { where: { id }, transaction: t });
  return n;
};

exports.deleteById = (id, t = null) =>
  Reglement.destroy({ where: { id }, transaction: t });
