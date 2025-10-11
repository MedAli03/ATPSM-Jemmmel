"use strict";

const { Sequelize, Groupe, InscriptionEnfant, AffectationEducateur, Utilisateur, Enfant } = require("../models");
const { Op } = Sequelize;

exports.create = (payload, t = null) => Groupe.create(payload, { transaction: t });

exports.findById = (id, t = null) => Groupe.findByPk(id, { transaction: t });

exports.list = async ({ anneeId, search, statut, page = 1, limit = 10 }, t = null) => {
  const where = {};
  if (anneeId) where.annee_id = anneeId;
  if (statut) where.statut = statut;
  if (search) where.nom = { [Op.like]: `%${search}%` };

  const rows = await Groupe.findAll({
    where,
    order: [["created_at", "DESC"]],
    offset: (Number(page) - 1) * Number(limit),
    limit: Number(limit),
    transaction: t,
  });
  return rows;
};

exports.updateById = async (id, attrs, t = null) => {
  const [nb] = await Groupe.update(attrs, { where: { id }, transaction: t });
  return nb;
};

exports.deleteById = (id, t = null) => Groupe.destroy({ where: { id }, transaction: t });

exports.listByYear = (annee_id, t = null) =>
  Groupe.findAll({ where: { annee_id }, order: [["created_at", "DESC"]], transaction: t });

exports.countEnfantsByGroup = async (annee_id, t = null) => {
  const rows = await InscriptionEnfant.findAll({
    where: { annee_id },
    attributes: ["groupe_id", [Sequelize.fn("COUNT", Sequelize.col("id")), "nb"]],
    group: ["groupe_id"],
    raw: true,
    transaction: t,
  });
  return Object.fromEntries(rows.map((r) => [r.groupe_id, Number(r.nb)]));
};

/* ===== Inscriptions ===== */
exports.listInscriptions = ({ groupe_id, annee_id, page = 1, limit = 50 }, t = null) =>
  InscriptionEnfant.findAll({
    where: { groupe_id, annee_id },
    order: [["date_inscription", "DESC"]],
    offset: (Number(page) - 1) * Number(limit),
    limit: Number(limit),
    transaction: t,
  });

exports.getEnfantsAlreadyAssigned = (enfant_ids, annee_id, t = null) =>
  InscriptionEnfant.findAll({
    where: { enfant_id: { [Op.in]: enfant_ids }, annee_id },
    raw: true,
    transaction: t,
  });

exports.addInscriptions = (rows, t = null) =>
  InscriptionEnfant.bulkCreate(rows, { transaction: t, ignoreDuplicates: true });

exports.removeInscription = (id, t = null) =>
  InscriptionEnfant.destroy({ where: { id }, transaction: t });

/* ===== Affectation ===== */
exports.getAffectationByYear = (groupe_id, annee_id, t = null) =>
  AffectationEducateur.findOne({ where: { groupe_id, annee_id }, transaction: t });

exports.findEducateurAssignment = (educateur_id, annee_id, t = null) =>
  AffectationEducateur.findOne({ where: { educateur_id, annee_id }, transaction: t });

exports.createAffectation = (payload, t = null) =>
  AffectationEducateur.create(payload, { transaction: t });

exports.clearAffectation = (groupe_id, annee_id, t = null) =>
  AffectationEducateur.destroy({ where: { groupe_id, annee_id }, transaction: t });

/* ===== Guards for delete ===== */
exports.hasUsages = async (groupe_id, annee_id, t = null) => {
  const [insc, aff] = await Promise.all([
    InscriptionEnfant.count({ where: { groupe_id, annee_id }, transaction: t }),
    AffectationEducateur.count({ where: { groupe_id, annee_id }, transaction: t }),
  ]);
  return { inscriptions: insc, affectations: aff };
};
