"use strict";

const {
  Enfant,
  Utilisateur,
  InscriptionEnfant,
  Groupe,
  AffectationEducateur,
} = require("../models");
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
  const search = typeof filters.q === "string" ? filters.q.trim() : null;
  if (search) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${search}%` } },
      { prenom: { [Op.like]: `%${search}%` } },
    ];
  }
  if (filters.parent_user_id !== undefined) {
    where.parent_user_id = filters.parent_user_id;
  }
  const page = Number.isInteger(pagination.page) && pagination.page > 0 ? pagination.page : 1;
  const limit = Number.isInteger(pagination.limit) && pagination.limit > 0 ? pagination.limit : 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await Enfant.findAndCountAll({
    where,
    include: [
      { model: Utilisateur, as: "parent", attributes: ["id", "nom", "prenom", "email", "telephone"] },
    ],
    order: [
      ["created_at", "DESC"],
      [{ model: InscriptionEnfant, as: "inscriptions" }, "date_inscription", "DESC"],
    ],
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

exports.findByParent = (parentId, { page = 1, limit = 20, annee_id } = {}, t = null) => {
  const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
  const pageSize = Number.isInteger(limit) && limit > 0 ? limit : 20;
  const offset = (currentPage - 1) * pageSize;

  return Enfant.findAndCountAll({
    where: { parent_user_id: parentId },
    order: [
      ["created_at", "DESC"],
      [{ model: InscriptionEnfant, as: "inscriptions" }, "date_inscription", "DESC"],
    ],
    limit: pageSize,
    offset,
    include: [
      {
        model: InscriptionEnfant,
        as: "inscriptions",
        required: false,
        where: {
          est_active: true,
          ...(annee_id ? { annee_id } : {}),
        },
        attributes: ["id", "groupe_id", "annee_id", "date_inscription"],
        include: [
          {
            model: Groupe,
            as: "groupe",
            attributes: ["id", "nom", "annee_id"],
            required: false,
            include: [
              {
                model: AffectationEducateur,
                as: "affectations",
                required: false,
                where: {
                  est_active: true,
                  ...(annee_id ? { annee_id } : {}),
                },
                attributes: ["id", "educateur_id", "annee_id"],
                include: [
                  {
                    model: Utilisateur,
                    as: "educateur",
                    attributes: ["id", "nom", "prenom"],
                    required: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    transaction: t,
    distinct: true,
  }).then(({ rows, count }) => ({
    rows,
    count,
    page: currentPage,
    limit: pageSize,
  }));
};
