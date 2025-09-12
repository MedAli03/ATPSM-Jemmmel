// services/notifier.service.js
"use strict";

const {
  sequelize,
  Utilisateur,
  Notification,
  InscriptionEnfant,
  AffectationEducateur,
  Enfant,
} = require("../models");
const { Op } = require("sequelize");

// Insert en masse
async function saveNotifications(rows, t) {
  if (!rows || !rows.length) return 0;
  const now = new Date();
  const toInsert = rows.map((r) => ({
    utilisateur_id: r.utilisateur_id,
    type: r.type,
    titre: r.titre,
    corps: r.corps,
    lu_le: null,
    created_at: now,
    updated_at: now,
  }));
  await Notification.bulkCreate(toInsert, { transaction: t });
  return toInsert.length;
}

exports.toUsers = async (userIds, { type, titre, corps }, t = null) => {
  if (!userIds || !userIds.length) return 0;
  const rows = userIds.map((id) => ({
    utilisateur_id: id,
    type,
    titre,
    corps,
  }));
  return saveNotifications(rows, t);
};

exports.toRoles = async (target, payload, t = null) => {
  const where = { is_active: true };
  if (target !== "ALL") where.role = target;
  const users = await Utilisateur.findAll({
    where,
    attributes: ["id"],
    transaction: t,
  });
  return exports.toUsers(
    users.map((u) => u.id),
    payload,
    t
  );
};

exports.toParentsOfChild = async (enfantId, payload, t = null) => {
  const enfant = await Enfant.findByPk(enfantId, { transaction: t });
  if (!enfant?.parent_user_id) return 0;
  return exports.toUsers([enfant.parent_user_id], payload, t);
};

exports.toEducateurOfGroupYear = async (
  groupeId,
  anneeId,
  payload,
  t = null
) => {
  const aff = await AffectationEducateur.findOne({
    where: { groupe_id: groupeId, annee_id: anneeId },
    attributes: ["educateur_id"],
    transaction: t,
  });
  if (!aff) return 0;
  return exports.toUsers([aff.educateur_id], payload, t);
};

exports.toParentsInGroupYear = async (groupeId, anneeId, payload, t = null) => {
  const inscriptions = await InscriptionEnfant.findAll({
    where: { groupe_id: groupeId, annee_id: anneeId },
    attributes: ["enfant_id"],
    transaction: t,
  });
  if (!inscriptions.length) return 0;

  const enfants = await Enfant.findAll({
    where: { id: { [Op.in]: inscriptions.map((i) => i.enfant_id) } },
    attributes: ["parent_user_id"],
    transaction: t,
  });
  const parentIds = [
    ...new Set(enfants.map((e) => e.parent_user_id).filter(Boolean)),
  ];
  if (!parentIds.length) return 0;
  return exports.toUsers(parentIds, payload, t);
};
