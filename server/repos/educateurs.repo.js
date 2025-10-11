"use strict";

const {
  Utilisateur,
  AffectationEducateur,
  Groupe,
  AnneeScolaire,
} = require("../models");
const { Op } = require("sequelize");

function buildWhere({ search, status }) {
  const where = { role: "EDUCATEUR" };
  if (status === "active") where.is_active = true;
  if (status === "archived") where.is_active = false;
  if (search) {
    const term = `%${search}%`;
    where[Op.or] = [
      { nom: { [Op.like]: term } },
      { prenom: { [Op.like]: term } },
      { email: { [Op.like]: term } },
      { telephone: { [Op.like]: term } },
    ];
  }
  return where;
}

function buildAffectationInclude({ anneeId }) {
  const where = { est_active: true };
  if (anneeId) where.annee_id = anneeId;
  return {
    model: AffectationEducateur,
    as: "affectations",
    required: false,
    where,
    include: [
      { model: Groupe, as: "groupe", attributes: ["id", "nom"] },
      {
        model: AnneeScolaire,
        as: "annee",
        attributes: ["id", "libelle", "annee_scolaire", "est_active"],
      },
    ],
  };
}

exports.findAll = async (filters, pagination = {}) => {
  const where = buildWhere(filters);
  const include = [buildAffectationInclude({ anneeId: filters.anneeId })];

  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const offset = (page - 1) * limit;

  const result = await Utilisateur.findAndCountAll({
    where,
    include,
    distinct: true,
    limit,
    offset,
    order: [["updated_at", "DESC"]],
    attributes: { exclude: ["mot_de_passe"] },
  });

  return { rows: result.rows, count: result.count, page, limit };
};

exports.findById = async (id, filters = {}) => {
  return Utilisateur.findOne({
    where: { id, role: "EDUCATEUR" },
    include: [buildAffectationInclude({ anneeId: filters.anneeId })],
    attributes: { exclude: ["mot_de_passe"] },
  });
};

exports.create = (attrs, t = null) =>
  Utilisateur.create(attrs, { transaction: t });

exports.updateById = async (id, attrs, t = null) => {
  const [n] = await Utilisateur.update(attrs, {
    where: { id, role: "EDUCATEUR" },
    transaction: t,
  });
  if (!n) return null;
  return Utilisateur.findOne({
    where: { id, role: "EDUCATEUR" },
    include: [buildAffectationInclude({ anneeId: null })],
    attributes: { exclude: ["mot_de_passe"] },
    transaction: t,
  });
};

exports.toggleActive = async (id, active, t = null) => {
  const [n] = await Utilisateur.update(
    { is_active: active },
    { where: { id, role: "EDUCATEUR" }, transaction: t }
  );
  if (!n) return null;
  return Utilisateur.findOne({
    where: { id, role: "EDUCATEUR" },
    include: [buildAffectationInclude({ anneeId: null })],
    attributes: { exclude: ["mot_de_passe"] },
    transaction: t,
  });
};

exports.findByEmail = (email, t = null) =>
  Utilisateur.findOne({ where: { email }, transaction: t });
