"use strict";

const { Op } = require("sequelize");
const { Actualite, Utilisateur } = require("../models");

exports.findById = (id, t = null) =>
  Actualite.findByPk(id, {
    include: [{ model: Utilisateur, as: "admin", attributes: ["id", "nom", "prenom", "email"] }],
    transaction: t,
  });

exports.list = async (filters = {}, pagination = {}, t = null) => {
  const where = {};
  if (filters.q) {
    where[Op.or] = [
      { titre: { [Op.like]: `%${filters.q}%` } },
      { contenu: { [Op.like]: `%${filters.q}%` } },
    ];
  }
  if (filters.date_debut || filters.date_fin) {
    where.publie_le = {};
    if (filters.date_debut) where.publie_le[Op.gte] = filters.date_debut;
    if (filters.date_fin) where.publie_le[Op.lte] = filters.date_fin;
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Actualite.findAndCountAll({
    where,
    include: [{ model: Utilisateur, as: "admin", attributes: ["id", "nom", "prenom", "email"] }],
    order: [["publie_le", "DESC"]],
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

exports.deleteById = (id, t = null) =>
  Actualite.destroy({ where: { id }, transaction: t });
