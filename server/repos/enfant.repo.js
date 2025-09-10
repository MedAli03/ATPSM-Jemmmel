const { Enfant, FicheEnfant, ParentsFiche, Utilisateur } = require("../models");

exports.findAll = async ({ page = 1, pageSize = 20 } = {}) => {
  const offset = (page - 1) * pageSize;
  const { rows, count } = await Enfant.findAndCountAll({
    include: [
      { model: FicheEnfant, as: "fiche" },
      { model: ParentsFiche, as: "parents" },
      {
        model: Utilisateur,
        as: "parent",
        attributes: ["id", "nom", "prenom", "email"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: pageSize,
    offset,
  });
  return { rows, count };
};

exports.create = (payload) => Enfant.create(payload);

exports.findById = (id) =>
  Enfant.findByPk(id, {
    include: [
      { model: FicheEnfant, as: "fiche" },
      { model: ParentsFiche, as: "parents" },
      {
        model: Utilisateur,
        as: "parent",
        attributes: ["id", "nom", "prenom", "email"],
      },
    ],
  });

exports.updateById = async (id, data) => {
  const enfant = await Enfant.findByPk(id);
  if (!enfant) return null;
  await enfant.update(data);
  return enfant;
};

exports.deleteById = async (id) => {
  const enfant = await Enfant.findByPk(id);
  if (!enfant) return 0;
  await enfant.destroy();
  return 1;
};
