const {
  Groupe,
  InscriptionEnfant,
  AffectationEducateur,
  Enfant,
  Utilisateur,
} = require("../models");
const { Op } = require("sequelize");

exports.createGroupe = (payload) => Groupe.create(payload);

exports.listByYear = async (annee_id) => {
  const groupes = await Groupe.findAll({
    where: { annee_id },
    order: [["created_at", "DESC"]],
  });
  return groupes;
};

exports.countEnfantsByGroup = async (annee_id) => {
  const rows = await InscriptionEnfant.findAll({
    where: { annee_id },
    attributes: [
      "groupe_id",
      [require("sequelize").fn("COUNT", require("sequelize").col("id")), "nb"],
    ],
    group: ["groupe_id"],
    raw: true,
  });
  return Object.fromEntries(rows.map((r) => [r.groupe_id, Number(r.nb)]));
};

exports.getAffectationByYear = (groupe_id, annee_id) =>
  AffectationEducateur.findOne({ where: { groupe_id, annee_id } });

exports.createAffectation = (payload, t) =>
  AffectationEducateur.create(payload, { transaction: t });

exports.clearAffectation = (groupe_id, annee_id, t) =>
  AffectationEducateur.destroy({
    where: { groupe_id, annee_id },
    transaction: t,
  });

exports.addInscriptions = (bulk, t) =>
  InscriptionEnfant.bulkCreate(bulk, {
    transaction: t,
    ignoreDuplicates: true,
  });

exports.getEnfantsAlreadyAssigned = (enfant_ids, annee_id) =>
  InscriptionEnfant.findAll({
    where: { enfant_id: { [Op.in]: enfant_ids }, annee_id },
    raw: true,
  });

exports.findEducateurAssignment = (educateur_id, annee_id) =>
  AffectationEducateur.findOne({ where: { educateur_id, annee_id } });
