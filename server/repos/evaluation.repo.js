const { EvaluationProjet, PEI, Utilisateur } = require("../models");

exports.listByPei = async ({ pei_id, page, pageSize }) => {
  const offset = (page - 1) * pageSize;
  const { rows, count } = await EvaluationProjet.findAndCountAll({
    where: { projet_id: pei_id },
    include: [
      {
        model: Utilisateur,
        as: "educateur",
        attributes: ["id", "nom", "prenom"],
      },
    ],
    order: [
      ["date_evaluation", "DESC"],
      ["id", "DESC"],
    ],
    limit: pageSize,
    offset,
  });
  return { rows, count };
};

exports.findById = (id) =>
  EvaluationProjet.findByPk(id, {
    include: [
      {
        model: Utilisateur,
        as: "educateur",
        attributes: ["id", "nom", "prenom"],
      },
    ],
  });

exports.listAllByPei = (pei_id) =>
  EvaluationProjet.findAll({
    where: { projet_id: pei_id },
    include: [
      {
        model: Utilisateur,
        as: "educateur",
        attributes: ["id", "nom", "prenom", "email"],
      },
    ],
    order: [
      ["date_evaluation", "DESC"],
      ["id", "DESC"],
    ],
  });

exports.create = (payload, t) =>
  EvaluationProjet.create(payload, { transaction: t });

exports.getPei = (pei_id, t) => PEI.findByPk(pei_id, { transaction: t });
