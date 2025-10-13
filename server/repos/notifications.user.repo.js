"use strict";

const { Notification } = require("../models");
const { Op } = require("sequelize");
const { pickExistingColumns } = require("../utils/schema-utils");

const BASE_ATTRIBUTES = [
  "id",
  "utilisateur_id",
  "type",
  "titre",
  "corps",
  "lu_le",
  "created_at",
  "updated_at",
];

const OPTIONAL_ATTRIBUTES = ["icon", "action_url", "payload"];

let cachedSelectableAttributes = null;

async function getSelectableAttributes() {
  if (!cachedSelectableAttributes) {
    const optional = await pickExistingColumns(
      "notifications",
      OPTIONAL_ATTRIBUTES
    );
    cachedSelectableAttributes = [...BASE_ATTRIBUTES, ...optional];
  }
  return cachedSelectableAttributes;
}

exports.findByIdForUser = async (id, userId, t = null) =>
  Notification.findOne({
    where: { id, utilisateur_id: userId },
    attributes: await getSelectableAttributes(),
    include: [
      {
        association: "utilisateur",
        attributes: ["id", "nom", "prenom", "email", "role"],
      },
    ],
    transaction: t,
  });

exports.listByUser = async (
  userId,
  filters = {},
  pagination = {},
  t = null
) => {
  const where = { utilisateur_id: userId };
  if (filters.only_unread) where.lu_le = { [Op.is]: null };
  if (filters.type) where.type = filters.type;
  if (filters.q) {
    where[Op.or] = [
      { titre: { [Op.like]: `%${filters.q}%` } },
      { corps: { [Op.like]: `%${filters.q}%` } },
    ];
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const attributes = await getSelectableAttributes();

  const { rows, count } = await Notification.findAndCountAll({
    where,
    attributes,
    order: [
      ["lu_le", "ASC"],
      ["created_at", "DESC"],
    ],
    offset,
    limit,
    transaction: t,
  });

  return { rows: rows.map((row) => row.get({ plain: true })), count, page, limit };
};

exports.countUnread = (userId, t = null) =>
  Notification.count({
    where: { utilisateur_id: userId, lu_le: { [Op.is]: null } },
    transaction: t,
  });

exports.markAsRead = async (id, userId, t = null) => {
  const [n] = await Notification.update(
    { lu_le: new Date() },
    {
      where: { id, utilisateur_id: userId, lu_le: { [Op.is]: null } },
      transaction: t,
    }
  );
  return n; // 1 si mise à jour, 0 sinon
};

exports.markAllAsRead = async (userId, t = null) => {
  const [n] = await Notification.update(
    { lu_le: new Date() },
    {
      where: { utilisateur_id: userId, lu_le: { [Op.is]: null } },
      transaction: t,
    }
  );
  return n;
};

exports.deleteForUser = (id, userId, t = null) =>
  Notification.destroy({
    where: { id, utilisateur_id: userId },
    transaction: t,
  });
