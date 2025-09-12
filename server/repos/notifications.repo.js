"use strict";

const { Notification, Utilisateur } = require("../models");
const { Op } = require("sequelize");

exports.findTargetUsers = async (target, t = null) => {
  const where = { is_active: true };
  if (target !== "ALL") where.role = target;
  return Utilisateur.findAll({
    where,
    attributes: ["id", "role", "email", "nom", "prenom"],
    transaction: t,
  });
};

exports.bulkCreateNotifications = async (rows, t = null) => {
  if (!rows.length) return 0;
  await Notification.bulkCreate(rows, { transaction: t });
  return rows.length;
};

exports.listAdmin = async (filters = {}, pagination = {}, t = null) => {
  const where = {};
  if (filters.type) where.type = filters.type;
  if (filters.titre) where.titre = { [Op.like]: `%${filters.titre}%` };

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Notification.findAndCountAll({
    where,
    include: [
      {
        association: "utilisateur",
        attributes: ["id", "nom", "prenom", "email", "role"],
      },
    ],
    order: [["created_at", "DESC"]],
    offset,
    limit,
    transaction: t,
  });
  return { rows, count, page, limit };
};
