"use strict";

const { ObservationInitiale, Enfant, Utilisateur } = require("../models");
const { Op } = require("sequelize");

exports.create = (payload, t = null) =>
  ObservationInitiale.create(payload, { transaction: t });

exports.findById = (id, t = null) =>
  ObservationInitiale.findByPk(id, {
    include: [
      { model: Enfant, as: "enfant" },
      {
        model: Utilisateur,
        as: "educateur",
        attributes: ["id", "nom", "prenom", "email"],
      },
    ],
    transaction: t,
  });

exports.updateById = async (id, attrs, t = null) => {
  const [nb] = await ObservationInitiale.update(attrs, {
    where: { id },
    transaction: t,
  });
  return nb;
};

exports.deleteById = (id, t = null) =>
  ObservationInitiale.destroy({ where: { id }, transaction: t });

exports.list = async (filters = {}, pagination = {}, t = null) => {
  const where = {};
  const { enfant_id, enfant_ids, educateur_id, date_debut, date_fin } = filters;

  if (Array.isArray(enfant_ids) && enfant_ids.length > 0) {
    where.enfant_id = { [Op.in]: enfant_ids };
  } else if (enfant_id) {
    where.enfant_id = enfant_id;
  }
  if (educateur_id) where.educateur_id = educateur_id;
  if (date_debut || date_fin) {
    where.date_observation = {};
    if (date_debut) where.date_observation[Op.gte] = date_debut;
    if (date_fin) where.date_observation[Op.lte] = date_fin;
  }

  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await ObservationInitiale.findAndCountAll({
    where,
    include: [
      { model: Enfant, as: "enfant" },
      {
        model: Utilisateur,
        as: "educateur",
        attributes: ["id", "nom", "prenom", "email"],
      },
    ],
    order: [["date_observation", "DESC"]],
    offset,
    limit,
    transaction: t,
  });

  return { rows, count, page, limit };
};
