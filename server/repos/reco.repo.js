// src/repos/reco.repo.js
const {
  RecoAI,
  RecoAIObjectif,
  RecoAIActivite,
  EvaluationProjet,
  PEI,
  Enfant,
  Utilisateur,
  ActiviteProjet,
} = require("../models");

/**
 * Keep includes in one place so aliases stay consistent with your associations:
 * RecoAI.belongsTo(Enfant,          { as: 'enfant',    foreignKey: 'enfant_id' });
 * RecoAI.belongsTo(Utilisateur,     { as: 'educateur', foreignKey: 'educateur_id' });
 * RecoAI.belongsTo(EvaluationProjet,{ as: 'evaluation',foreignKey: 'evaluation_id' });
 * RecoAI.belongsTo(PEI,             { as: 'source',    foreignKey: 'projet_source_id' });
 * RecoAI.belongsTo(PEI,             { as: 'cible',     foreignKey: 'projet_cible_id' });
 * RecoAI.hasMany(RecoAIObjectif,    { as: 'objectifs', foreignKey: 'recommendation_id' });
 * RecoAI.hasMany(RecoAIActivite,    { as: 'activites', foreignKey: 'recommendation_id' });
 */
function includeFull() {
  return [
    { model: Enfant, as: "enfant", attributes: ["id", "nom", "prenom"] },
    {
      model: Utilisateur,
      as: "educateur",
      attributes: ["id", "nom", "prenom", "email"],
    },
    {
      model: EvaluationProjet,
      as: "evaluation",
      attributes: ["id", "projet_id", "score", "date_evaluation"],
    },
    {
      model: PEI,
      as: "source",
      attributes: ["id", "enfant_id", "annee_id", "statut"],
    },
    {
      model: PEI,
      as: "cible",
      attributes: ["id", "enfant_id", "annee_id", "statut"],
    },
    {
      model: RecoAIObjectif,
      as: "objectifs",
      attributes: ["id", "texte", "accepte", "applique_le"],
    },
    {
      model: RecoAIActivite,
      as: "activites",
      attributes: [
        "id",
        "description",
        "objectifs",
        "accepte",
        "created_activite_id",
        "applique_le",
      ],
    },
  ];
}

/* ---------- READS ---------- */

exports.findByIdFull = (id, t = null) =>
  RecoAI.findByPk(id, {
    include: includeFull(),
    transaction: t,
  });

exports.findById = (id, t = null) => RecoAI.findByPk(id, { transaction: t });

exports.getEvaluation = (evaluation_id, t = null) =>
  EvaluationProjet.findByPk(evaluation_id, { transaction: t });

exports.getPei = (pei_id, t = null) => PEI.findByPk(pei_id, { transaction: t });

/* ---------- CREATE / BULK ---------- */

exports.createReco = (payload, t = null) =>
  RecoAI.create(payload, { transaction: t });

exports.bulkCreateObjectifs = (rows, t = null) =>
  RecoAIObjectif.bulkCreate(rows, { transaction: t });

exports.bulkCreateActivites = (rows, t = null) =>
  RecoAIActivite.bulkCreate(rows, { transaction: t });

exports.createActiviteProjet = (payload, t = null) =>
  ActiviteProjet.create(payload, { transaction: t });

/* ---------- UPDATE ---------- */

exports.updateObjectif = (id, data, t = null) =>
  RecoAIObjectif.update(data, { where: { id }, transaction: t });

exports.updateActivite = (id, data, t = null) =>
  RecoAIActivite.update(data, { where: { id }, transaction: t });

exports.linkCreatedActivite = (itemId, created_activite_id, t = null) =>
  RecoAIActivite.update(
    { created_activite_id },
    { where: { id: itemId }, transaction: t }
  );

exports.updateReco = (id, data, t = null) =>
  RecoAI.update(data, { where: { id }, transaction: t });

/* ---------- OPTIONAL UTILS ---------- */

exports.reloadFull = (instance, t = null) =>
  instance.reload({ include: includeFull(), transaction: t });
