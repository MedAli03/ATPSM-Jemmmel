const { Utilisateur } = require("../models");

exports.findAll = async ({ page = 1, pageSize = 20, role, q }) => {
  const where = {};
  if (role) where.role = role;
  if (q) {
    where[Symbol.for("or")] = [
      { nom: { [require("sequelize").Op.like]: `%${q}%` } },
      { prenom: { [require("sequelize").Op.like]: `%${q}%` } },
      { email: { [require("sequelize").Op.like]: `%${q}%` } },
    ];
  }
  const offset = (page - 1) * pageSize;
  const { rows, count } = await Utilisateur.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit: pageSize,
    offset,
    attributes: { exclude: ["mot_de_passe"] },
  });
  return { rows, count };
};

exports.findById = (id) =>
  Utilisateur.findByPk(id, { attributes: { exclude: ["mot_de_passe"] } });

exports.create = (payload) => Utilisateur.create(payload);

exports.updateById = async (id, data) => {
  const u = await Utilisateur.findByPk(id);
  if (!u) return null;
  await u.update(data);
  return u.get({ plain: true });
};

exports.deleteById = async (id) => {
  const u = await Utilisateur.findByPk(id);
  if (!u) return 0;
  await u.destroy();
  return 1;
};
