const {
  PEI,
  Enfant,
  Utilisateur,
  EvaluationProjet,
  ActiviteProjet,
  DailyNote,
  HistoriqueProjet,
} = require("../models");

exports.findAndCount = async ({ page, pageSize, where }) => {
  const offset = (page - 1) * pageSize;
  const { rows, count } = await PEI.findAndCountAll({
    where,
    include: [
      { model: Enfant, as: "enfant", attributes: ["id", "nom", "prenom"] },
      {
        model: Utilisateur,
        as: "educateur",
        attributes: ["id", "nom", "prenom", "email"],
      },
    ],
    order: [["date_creation", "DESC"]],
    limit: pageSize,
    offset,
  });
  return { rows, count };
};

exports.findByIdFull = async (id) => {
  const pei = await PEI.findByPk(id, {
    include: [
      { model: Enfant, as: "enfant", attributes: ["id", "nom", "prenom"] },
      {
        model: Utilisateur,
        as: "educateur",
        attributes: ["id", "nom", "prenom", "email"],
      },
      {
        model: EvaluationProjet,
        as: "evaluations",
        attributes: ["id", "score", "date_evaluation", "notes"],
      },
      {
        model: ActiviteProjet,
        as: "activites",
        attributes: ["id", "titre", "date_activite", "type"],
      },
      {
        model: DailyNote,
        as: "notes",
        attributes: ["id", "date_note", "type"],
      },
    ],
  });
  return pei ? pei.get({ plain: true }) : null;
};

exports.findActiveByEnfantYear = ({ enfant_id, annee_id }, t = null) =>
  PEI.findOne({
    where: { enfant_id, annee_id, statut: "VALIDE" },
    transaction: t,
  });

exports.findPendingByEnfantYear = ({ enfant_id, annee_id }, t = null) =>
  PEI.findOne({
    where: { enfant_id, annee_id, statut: "EN_ATTENTE_VALIDATION" },
    transaction: t,
  });

exports.create = (payload, t) => PEI.create(payload, { transaction: t });

exports.updateById = async (id, data, t) => {
  const r = await PEI.findByPk(id, { transaction: t });
  if (!r) return null;
  await r.update(data, { transaction: t });
  return r;
};

exports.addHistory = (payload, t) =>
  HistoriqueProjet.create(payload, { transaction: t });
