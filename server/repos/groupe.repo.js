"use strict";

const {
  Sequelize,
  Groupe,
  InscriptionEnfant,
  AffectationEducateur,
  Enfant,
} = require("../models");
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

/* ===== Inscriptions ===== */
exports.listInscriptions = ({ groupe_id, annee_id, page = 1, limit = 50 }, t = null) =>
  InscriptionEnfant.findAll({
    where: { groupe_id, annee_id },
    attributes: [
      "id",
      "groupe_id",
      "annee_id",
      "enfant_id",
      "date_inscription",
      "created_at",
      "updated_at",
    ],
    include: [
      {
        model: Enfant,
        as: "enfant",
        attributes: ["id", "nom", "prenom", "date_naissance"],
        required: false,
      },
    ],
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

exports.removeAffectationById = (groupe_id, affectation_id, t = null) =>
  AffectationEducateur.destroy({
    where: { id: affectation_id, groupe_id },
    transaction: t,
  });

/* ===== Guards for delete ===== */
exports.hasUsages = async (groupe_id, annee_id, t = null) => {
  const whereInscriptions = { groupe_id };
  const whereAffectations = { groupe_id };
  if (annee_id) {
    whereInscriptions.annee_id = annee_id;
    whereAffectations.annee_id = annee_id;
  }

  const [insc, aff] = await Promise.all([
    InscriptionEnfant.count({ where: whereInscriptions, transaction: t }),
    AffectationEducateur.count({ where: whereAffectations, transaction: t }),
  ]);
  return { inscriptions: insc, affectations: aff };
};

exports.countEnfantsByGroup = async (
  { annee_id, groupe_ids } = {},
  t = null
) => {
  const where = {};
  if (annee_id) where.annee_id = annee_id;
  if (Array.isArray(groupe_ids) && groupe_ids.length) {
    where.groupe_id = { [Op.in]: groupe_ids };
  }

  const rows = await InscriptionEnfant.findAll({
    where,
    attributes: [
      "groupe_id",
      [Sequelize.fn("COUNT", Sequelize.col("InscriptionEnfant.id")), "nb"],
    ],
    group: ["groupe_id"],
    raw: true,
    transaction: t,
  });

  return Object.fromEntries(rows.map((r) => [r.groupe_id, Number(r.nb) || 0]));
};
