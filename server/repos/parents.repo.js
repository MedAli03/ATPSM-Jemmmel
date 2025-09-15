"use strict";

const { Utilisateur, Enfant } = require("../models");
const { Op } = require("sequelize");

exports.findAll = async (filters = {}, pagination = {}, t = null) => {
  const where = { role: "PARENT" };
  if (typeof filters.is_active === "boolean")
    where.is_active = filters.is_active;
  if (filters.q) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${filters.q}%` } },
      { prenom: { [Op.like]: `%${filters.q}%` } },
      { email: { [Op.like]: `%${filters.q}%` } },
      { telephone: { [Op.like]: `%${filters.q}%` } },
    ];
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Utilisateur.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset,
    transaction: t,
    attributes: { exclude: ["mot_de_passe"] },
  });

  return { rows, count, page, limit };
};

exports.findById = (id, t = null) =>
  Utilisateur.findOne({
    where: { id, role: "PARENT" },
    attributes: { exclude: ["mot_de_passe"] },
    transaction: t,
  });

exports.findByEmailAny = (email, t = null) =>
  Utilisateur.findOne({ where: { email }, transaction: t });

exports.create = (attrs, t = null) =>
  Utilisateur.create(attrs, { transaction: t });

exports.updateById = async (id, attrs, t = null) => {
  const [n] = await Utilisateur.update(attrs, {
    where: { id, role: "PARENT" },
    transaction: t,
  });
  return n;
};

exports.changePassword = async (id, hash, t = null) => {
  const [n] = await Utilisateur.update(
    { mot_de_passe: hash },
    { where: { id, role: "PARENT" }, transaction: t }
  );
  return n;
};

exports.childrenOfParent = async (parentId, pagination = {}, t = null) => {
  const page = pagination.page || 1;
  const limit = pagination.limit || 100; // souvent peu d'enfants
  const offset = (page - 1) * limit;

  const { rows, count } = await Enfant.findAndCountAll({
    where: { parent_user_id: parentId },
    order: [["created_at", "DESC"]],
    limit,
    offset,
    transaction: t,
  });

  return { rows, count, page, limit };
};
