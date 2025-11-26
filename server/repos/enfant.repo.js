"use strict";

const { Enfant, Utilisateur } = require("../models");
const { Op } = require("sequelize");

exports.create = (attrs, t = null) =>
  Enfant.create(attrs, { transaction: t });

exports.findById = (id, t = null) =>
  Enfant.findByPk(id, {
    include: [
      { model: Utilisateur, as: "parent", attributes: ["id", "nom", "prenom", "email", "telephone"] },
    ],
    transaction: t,
  });

exports.findAll = async (filters = {}, pagination = {}, t = null) => {
  const where = {};
  if (filters.q) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${filters.q}%` } },
      { prenom: { [Op.like]: `%${filters.q}%` } },
    ];
  }
  if (filters.parent_user_id !== undefined) {
    where.parent_user_id = filters.parent_user_id;
  }
  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Enfant.findAndCountAll({
    where,
    include: [
      { model: Utilisateur, as: "parent", attributes: ["id", "nom", "prenom", "email", "telephone"] },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    transaction: t,
  });

  return { rows, count, page, limit };
};

exports.updateById = async (id, attrs, t = null) => {
  const [n] = await Enfant.update(attrs, { where: { id }, transaction: t });
  return n;
};

exports.deleteById = (id, t = null) =>
  Enfant.destroy({ where: { id }, transaction: t });

exports.linkParent = async (id, parent_user_id, t = null) => {
  const [n] = await Enfant.update({ parent_user_id }, { where: { id }, transaction: t });
  return n;
};

exports.unlinkParent = async (id, t = null) => {
  const [n] = await Enfant.update({ parent_user_id: null }, { where: { id }, transaction: t });
  return n;
};

exports.findByParent = (parentId, pagination = {}, t = null) => {
  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  return Enfant.findAndCountAll({
    where: { parent_user_id: parentId },
    order: [["created_at", "DESC"]],
    limit,
    offset,
    transaction: t,
  });
};
