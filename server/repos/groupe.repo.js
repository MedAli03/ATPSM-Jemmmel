"use strict";

const {
  Sequelize,
  Groupe,
  InscriptionEnfant,
  AffectationEducateur,
  Enfant,
  Utilisateur,
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
exports.listInscriptions = async (
  { groupe_id, annee_id, page = 1, limit = 50 },
  t = null
) =>
  InscriptionEnfant.findAndCountAll({
    where: { groupe_id, annee_id, est_active: true },
    attributes: [
      "id",
      "groupe_id",
      "annee_id",
      "enfant_id",
      "date_inscription",
      "date_sortie",
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
    distinct: true,
  });

exports.findActiveInscription = (enfant_id, annee_id, t = null) =>
  InscriptionEnfant.findOne({
    where: { enfant_id, annee_id, est_active: true },
    include: [
      {
        model: Groupe,
        as: "groupe",
        attributes: ["id", "nom"],
      },
    ],
    transaction: t,
  });

exports.createInscription = (payload, t = null) =>
  InscriptionEnfant.create(payload, { transaction: t });

exports.closeInscriptionById = (id, closedAt, t = null) =>
  InscriptionEnfant.update(
    { est_active: false, date_sortie: closedAt },
    { where: { id }, transaction: t }
  );

const buildNameSearchFilters = (search, alias = "Enfant") => {
  if (!search || typeof search !== "string") return null;
  const term = `%${search.trim()}%`;
  if (!term || term === "%%") return null;
  const prefix = alias ? `${alias}.` : "";
  return {
    [Op.or]: [
      Sequelize.where(Sequelize.col(`${prefix}prenom`), { [Op.like]: term }),
      Sequelize.where(Sequelize.col(`${prefix}nom`), { [Op.like]: term }),
      Sequelize.where(
        Sequelize.fn(
          "CONCAT",
          Sequelize.col(`${prefix}prenom`),
          " ",
          Sequelize.col(`${prefix}nom`)
        ),
        { [Op.like]: term }
      ),
    ],
  };
};

const listAvailableChildren = async (
  { annee_id, search, page = 1, limit = 10 },
  t = null
) => {
  const offset = (Number(page) - 1) * Number(limit);

  const assignedRows = await InscriptionEnfant.findAll({
    attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("enfant_id")), "enfant_id"]],
    where: { annee_id, est_active: true },
    raw: true,
    transaction: t,
  });
  const assignedIds = assignedRows.map((row) => row.enfant_id);

  const conditions = [];
  const searchFilters = buildNameSearchFilters(search, "Enfant");
  if (searchFilters) conditions.push(searchFilters);
  if (assignedIds.length > 0)
    conditions.push({ id: { [Op.notIn]: assignedIds } });

  const where =
    conditions.length > 1
      ? { [Op.and]: conditions }
      : conditions[0] || {};

  const { rows, count } = await Enfant.findAndCountAll({
    attributes: ["id", "nom", "prenom", "date_naissance"],
    where,
    offset,
    limit: Number(limit),
    order: [["prenom", "ASC"], ["nom", "ASC"]],
    transaction: t,
    distinct: true,
  });

  const items = rows.map((row) => {
    const plain = row.get({ plain: true });
    return {
      id: plain.id,
      nom: plain.nom,
      prenom: plain.prenom,
      date_naissance: plain.date_naissance,
      inscription_actuelle: null,
    };
  });

  return { items, total: count };
};

const listAssignedChildren = async (
  { annee_id, search, page = 1, limit = 10, exclude_groupe_id },
  t = null
) => {
  const offset = (Number(page) - 1) * Number(limit);

  const enfantWhere = buildNameSearchFilters(search, "enfant");

  const { rows, count } = await InscriptionEnfant.findAndCountAll({
    where: {
      annee_id,
      est_active: true,
      ...(exclude_groupe_id
        ? { groupe_id: { [Op.ne]: exclude_groupe_id } }
        : {}),
    },
    include: [
      {
        model: Enfant,
        as: "enfant",
        attributes: ["id", "nom", "prenom", "date_naissance"],
        required: true,
        ...(enfantWhere ? { where: enfantWhere } : {}),
      },
      {
        model: Groupe,
        as: "groupe",
        attributes: ["id", "nom"],
        required: false,
      },
    ],
    offset,
    limit: Number(limit),
    order: [
      [{ model: Enfant, as: "enfant" }, "prenom", "ASC"],
      [{ model: Enfant, as: "enfant" }, "nom", "ASC"],
    ],
    transaction: t,
    distinct: true,
  });

  const items = rows.map((row) => {
    const plain = row.get({ plain: true });
    const enfant = plain.enfant || {};
    return {
      id: enfant.id,
      nom: enfant.nom,
      prenom: enfant.prenom,
      date_naissance: enfant.date_naissance,
      inscription_actuelle: {
        groupe_id: plain.groupe_id,
        groupe_nom: plain.groupe?.nom ?? null,
        inscription_id: plain.id,
        date_inscription: plain.date_inscription,
      },
    };
  });

  return { items, total: count };
};

exports.listChildrenCandidates = async (
  { annee_id, search, page = 1, limit = 10, scope = "available", exclude_groupe_id },
  t = null
) => {
  if (scope === "assigned") {
    return listAssignedChildren({ annee_id, search, page, limit, exclude_groupe_id }, t);
  }
  return listAvailableChildren({ annee_id, search, page, limit }, t);
};

/* ===== Affectation ===== */
exports.getAffectationByYear = (groupe_id, annee_id, t = null) =>
  AffectationEducateur.findOne({
    where: { groupe_id, annee_id, est_active: true },
    include: [
      {
        model: Utilisateur,
        as: "educateur",
        attributes: ["id", "nom", "prenom", "email"],
      },
    ],
    transaction: t,
  });

exports.findEducateurAssignment = (educateur_id, annee_id, t = null) =>
  AffectationEducateur.findOne({
    where: { educateur_id, annee_id, est_active: true },
    include: [
      {
        model: Groupe,
        as: "groupe",
        attributes: ["id", "nom"],
      },
    ],
    transaction: t,
  });

exports.createAffectation = (payload, t = null) =>
  AffectationEducateur.create(payload, { transaction: t });

exports.closeAffectationById = (id, closedAt, t = null) =>
  AffectationEducateur.update(
    { est_active: false, date_fin_affectation: closedAt },
    { where: { id }, transaction: t }
  );

exports.listEducateurCandidates = async (
  { annee_id, search, page = 1, limit = 10 },
  t = null
) => {
  const offset = (Number(page) - 1) * Number(limit);
  const where = { role: "EDUCATEUR", is_active: true };

  if (search) {
    const term = `%${search}%`;
    where[Op.or] = [
      { prenom: { [Op.like]: term } },
      { nom: { [Op.like]: term } },
      { email: { [Op.like]: term } },
    ];
  }

  const existsLiteral = Sequelize.literal(`NOT EXISTS (
    SELECT 1 FROM affectations_educateurs ae
    WHERE ae.educateur_id = Utilisateur.id
      AND ae.annee_id = ${annee_id}
      AND ae.est_active = 1
  )`);

  where[Op.and] = [...(where[Op.and] || []), existsLiteral];

  return Utilisateur.findAndCountAll({
    where,
    offset,
    limit: Number(limit),
    order: [["prenom", "ASC"], ["nom", "ASC"]],
    transaction: t,
  });
};

exports.removeAffectationById = (groupe_id, affectation_id, t = null) =>
  AffectationEducateur.update(
    { est_active: false, date_fin_affectation: new Date() },
    { where: { id: affectation_id, groupe_id, est_active: true }, transaction: t }
  );

/* ===== Guards for delete ===== */
exports.hasUsages = async (groupe_id, options = {}, t = null) => {
  const opts =
    typeof options === "number" ? { annee_id: options } : options || {};

  const { annee_id = null, activeOnly = false } = opts;

  const whereInscriptions = { groupe_id };
  const whereAffectations = { groupe_id };

  if (activeOnly) {
    whereInscriptions.est_active = true;
    whereAffectations.est_active = true;
  }

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
