const { Utilisateur, UtilisateurSession } = require("../models");

const PROFILE_ATTRIBUTES = [
  "id",
  "nom",
  "prenom",
  "email",
  "telephone",
  "username",
  "adresse",
  "role",
  "avatar_url",
  "last_login",
  "created_at",
  "updated_at",
];

exports.findProfileById = async (id) => {
  const user = await Utilisateur.findByPk(id, {
    attributes: PROFILE_ATTRIBUTES,
    raw: true,
  });
  return user || null;
};

exports.updateProfileById = async (id, payload) => {
  const user = await Utilisateur.findByPk(id);
  if (!user) return null;
  await user.update(payload);
  return user.get({ plain: true });
};

exports.updatePasswordById = async (id, motDePasse) => {
  const user = await Utilisateur.findByPk(id);
  if (!user) return null;
  await user.update({ mot_de_passe: motDePasse });
  return true;
};

exports.updateAvatarById = async (id, avatarUrl) => {
  const user = await Utilisateur.findByPk(id);
  if (!user) return null;
  await user.update({ avatar_url: avatarUrl });
  return user.get({ plain: true });
};

exports.findUserWithPasswordById = (id) => Utilisateur.findByPk(id);

exports.createSession = (payload) => UtilisateurSession.create(payload);

exports.findSessions = (utilisateurId, limit = 10) =>
  UtilisateurSession.findAll({
    where: { utilisateur_id: utilisateurId },
    order: [["created_at", "DESC"]],
    limit,
    raw: true,
  });
