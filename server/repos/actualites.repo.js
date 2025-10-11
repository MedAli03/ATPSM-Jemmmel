"use strict";

const { Op } = require("sequelize");
const { Actualite, Utilisateur } = require("../models");

const adminInclude = {
  model: Utilisateur,
  as: "admin",
  attributes: ["id", "nom", "prenom", "email"],
};

exports.findById = (id, t = null) =>
  Actualite.findByPk(id, {
    include: [adminInclude],
    transaction: t,
  });

exports.list = async (filters = {}, pagination = {}, t = null) => {
  const where = {};

  if (filters.search) {
    where[Op.or] = [
      { titre: { [Op.like]: `%${filters.search}%` } },
      { resume: { [Op.like]: `%${filters.search}%` } },
      { contenu: { [Op.like]: `%${filters.search}%` } },
      { contenu_html: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  if (filters.status && filters.status !== "all") {
    where.statut = filters.status;
  }

  if (filters.pinned === true) {
    where.epingle = true;
  }

  if (filters.from || filters.to) {
    where.publie_le = {};
    if (filters.from) where.publie_le[Op.gte] = filters.from;
    if (filters.to) where.publie_le[Op.lte] = filters.to;
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Actualite.findAndCountAll({
    where,
    include: [adminInclude],
    order: [
      ["epingle", "DESC"],
      ["publie_le", "DESC"],
      ["created_at", "DESC"],
    ],
    offset,
    limit,
    transaction: t,
  });

  return { rows, count, page, limit };
};

exports.create = (attrs, t = null) => Actualite.create(attrs, { transaction: t });

exports.updateById = async (id, attrs, t = null) => {
  const [n] = await Actualite.update(attrs, { where: { id }, transaction: t });
  return n;
};

exports.updateStatus = (id, attrs, t = null) =>
  Actualite.update(attrs, { where: { id }, transaction: t });

exports.deleteById = (id, t = null) =>
  Actualite.destroy({ where: { id }, transaction: t });
