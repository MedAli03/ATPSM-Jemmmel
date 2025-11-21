const { ActiviteProjet, PEI, Utilisateur, Enfant } = require("../models");

exports.listByPei = async ({ pei_id, page, pageSize }) => {
  const offset = (page - 1) * pageSize;
  const { rows, count } = await ActiviteProjet.findAndCountAll({
    where: { projet_id: pei_id },
    include: [
      {
        model: Utilisateur,
        as: "educateur",
        attributes: ["id", "nom", "prenom"],
      },
      { model: Enfant, as: "enfant", attributes: ["id", "nom", "prenom"] },
    ],
    order: [
      ["date_activite", "DESC"],
      ["id", "DESC"],
    ],
    limit: pageSize,
    offset,
  });
  return { rows, count };
};

exports.findById = (id) =>
  ActiviteProjet.findByPk(id, {
    include: [
      {
        model: Utilisateur,
        as: "educateur",
        attributes: ["id", "nom", "prenom"],
      },
      { model: Enfant, as: "enfant", attributes: ["id", "nom", "prenom"] },
    ],
  });

exports.listAllByPei = (pei_id) =>
  ActiviteProjet.findAll({
    where: { projet_id: pei_id },
    include: [
      {
        model: Utilisateur,
        as: "educateur",
        attributes: ["id", "nom", "prenom", "email"],
      },
      { model: Enfant, as: "enfant", attributes: ["id", "nom", "prenom"] },
    ],
    order: [
      ["date_activite", "DESC"],
      ["id", "DESC"],
    ],
  });

exports.create = (payload, t) =>
  ActiviteProjet.create(payload, { transaction: t });

exports.updateById = async (id, data, t) => {
  const x = await ActiviteProjet.findByPk(id, { transaction: t });
  if (!x) return null;
  await x.update(data, { transaction: t });
  return x;
};

exports.deleteById = async (id, t) => {
  const x = await ActiviteProjet.findByPk(id, { transaction: t });
  if (!x) return 0;
  await x.destroy({ transaction: t });
  return 1;
};

exports.getPei = (pei_id, t) => PEI.findByPk(pei_id, { transaction: t });
