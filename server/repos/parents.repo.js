"use strict";

const { Utilisateur, Enfant, InscriptionEnfant, Groupe, AnneeScolaire } = require("../models");
const { Op, literal } = require("sequelize");

function buildContactConditions(hasContact) {
  if (!hasContact || hasContact === "any") return [];

  const hasEmail = {
    [Op.and]: [{ email: { [Op.ne]: null } }, { email: { [Op.ne]: "" } }],
  };
  const hasPhone = {
    [Op.and]: [
      { telephone: { [Op.ne]: null } },
      { telephone: { [Op.ne]: "" } },
    ],
  };

  if (hasContact === "email") return [hasEmail];
  if (hasContact === "phone") return [hasPhone];
  if (hasContact === "both") return [hasEmail, hasPhone];
  if (hasContact === "missing") {
    return [
      {
        [Op.or]: [
          { email: null },
          literal("email = ''"),
        ],
      },
      {
        [Op.or]: [
          { telephone: null },
          literal("telephone = ''"),
        ],
      },
    ];
  }
  return [];
}

exports.findAll = async (filters = {}, pagination = {}, t = null) => {
  const where = { role: "PARENT" };
  if (filters.status === "active") where.is_active = true;
  if (filters.status === "archived") where.is_active = false;
  if (filters.search) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${filters.search}%` } },
      { prenom: { [Op.like]: `%${filters.search}%` } },
      { email: { [Op.like]: `%${filters.search}%` } },
      { telephone: { [Op.like]: `%${filters.search}%` } },
    ];
  }

  const contactConditions = buildContactConditions(filters.hasContact);
  if (contactConditions.length) {
    where[Op.and] = (where[Op.and] || []).concat(contactConditions);
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Utilisateur.findAndCountAll({
    where,
    order: [["updated_at", "DESC"]],
    limit,
    offset,
    transaction: t,
    distinct: true,
    include: [
      {
        model: Enfant,
        as: "enfants",
        attributes: ["id"],
      },
    ],
    attributes: { exclude: ["mot_de_passe"] },
  });

  return { rows, count, page, limit };
};

exports.findById = (id, t = null) =>
  Utilisateur.findOne({
    where: { id, role: "PARENT" },
    attributes: { exclude: ["mot_de_passe"] },
    include: [
      {
        model: Enfant,
        as: "enfants",
        attributes: ["id", "nom", "prenom", "date_naissance"],
        include: [
          {
            model: InscriptionEnfant,
            as: "inscriptions",
            where: { est_active: true },
            required: false,
            include: [
              { model: Groupe, as: "groupe", attributes: ["id", "nom"] },
              {
                model: AnneeScolaire,
                as: "annee",
                attributes: ["id", "libelle", "annee_scolaire", "est_active"],
              },
            ],
          },
        ],
      },
    ],
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
    include: [
      {
        model: InscriptionEnfant,
        as: "inscriptions",
        where: { est_active: true },
        required: false,
        include: [
          { model: Groupe, as: "groupe", attributes: ["id", "nom"] },
          {
            model: AnneeScolaire,
            as: "annee",
            attributes: ["id", "libelle", "annee_scolaire", "est_active"],
          },
        ],
      },
    ],
  });

  return { rows, count, page, limit };
};

exports.linkChild = (parentId, enfantId, t = null) =>
  Enfant.update(
    { parent_user_id: parentId },
    { where: { id: enfantId }, transaction: t }
  );

exports.unlinkChild = (parentId, enfantId, t = null) =>
  Enfant.update(
    { parent_user_id: null },
    { where: { id: enfantId, parent_user_id: parentId }, transaction: t }
  );
