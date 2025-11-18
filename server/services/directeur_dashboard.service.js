"use strict";

const {
  sequelize,
  Sequelize,
  Utilisateur,
  Enfant,
  Groupe,
  AnneeScolaire,
  InscriptionEnfant,
  AffectationEducateur,
  PEI,
  ActiviteProjet,
  EvaluationProjet,
  Actualite,
  Evenement,
} = require("../models");

const { Op } = Sequelize;

function startDateWeeksAgo(weeks) {
  const d = new Date();
  d.setDate(d.getDate() - weeks * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calcule le périmètre (enfantIds, educateurIds) selon anneeId/groupeId/educateurId
 * - enfantIds: à partir d'InscriptionEnfant (filtré année/groupe)
 * - educateurIds: à partir d'AffectationEducateur (filtré année/groupe) ou param direct educateurId
 */
async function computeScope({ anneeId, groupeId, educateurId }) {
  // enfants
  let enfantIds = null; // null = pas de filtre enfant
  if (anneeId || groupeId) {
    const whereIns = {};
    if (anneeId) whereIns.annee_id = anneeId;
    if (groupeId) whereIns.groupe_id = groupeId;
    const ins = await InscriptionEnfant.findAll({
      where: whereIns,
      attributes: ["enfant_id"],
      raw: true,
    });
    enfantIds = [...new Set(ins.map((i) => i.enfant_id))];
  }

  // educateurs
  let educateurIds = null; // null = pas de filtre educateur
  if (educateurId) {
    educateurIds = [Number(educateurId)];
  } else if (anneeId || groupeId) {
    const whereAff = {};
    if (anneeId) whereAff.annee_id = anneeId;
    if (groupeId) whereAff.groupe_id = groupeId;
    const aff = await AffectationEducateur.findAll({
      where: whereAff,
      attributes: ["educateur_id"],
      raw: true,
    });
    educateurIds = [...new Set(aff.map((a) => a.educateur_id))];
  }

  return { enfantIds, educateurIds };
}

/**
 * Compteurs globaux dans le périmètre (année/groupe/éducateur)
 */
async function counters({ anneeId, groupeId, educateurId }) {
  const { enfantIds, educateurIds } = await computeScope({
    anneeId,
    groupeId,
    educateurId,
  });

  // enfants
  let nbEnfants;
  if (enfantIds && enfantIds.length === 0) nbEnfants = 0;
  else if (enfantIds)
    nbEnfants = await Enfant.count({ where: { id: { [Op.in]: enfantIds } } });
  else nbEnfants = await Enfant.count();

  // educateurs
  let nbEducateurs;
  if (educateurIds && educateurIds.length === 0) nbEducateurs = 0;
  else if (educateurIds) nbEducateurs = educateurIds.length;
  else
    nbEducateurs = await Utilisateur.count({
      where: { role: "EDUCATEUR", is_active: true },
    });

  // parents (distinct sur les enfants du périmètre)
  let nbParents = 0;
  if (nbEnfants > 0) {
    const whereEnf = {};
    if (enfantIds) whereEnf.id = { [Op.in]: enfantIds };
    const parents = await Enfant.findAll({
      where: whereEnf,
      attributes: [
        [
          sequelize.fn("DISTINCT", sequelize.col("parent_user_id")),
          "parent_user_id",
        ],
      ],
      raw: true,
    });
    const ids = parents.map((p) => p.parent_user_id).filter(Boolean);
    nbParents = new Set(ids).size;
  }

  // groupes actifs (dans l'année si fournie)
  const whereGroup = { statut: "actif" };
  if (anneeId) whereGroup.annee_id = anneeId;
  const nbGroupesActifs = await Groupe.count({ where: whereGroup });

  // année active (info utile UI)
  const anneeActive = await AnneeScolaire.findOne({
    where: { est_active: true },
    attributes: ["id", "libelle"],
  });

  return { nbEnfants, nbEducateurs, nbParents, nbGroupesActifs, anneeActive };
}

const PEI_STATS_DEFAULT = {
  EN_ATTENTE_VALIDATION: 0,
  VALIDE: 0,
  CLOTURE: 0,
  REFUSE: 0,
};

/**
 * Répartition PEI par statut (en attente / validé / clôturé / refusé) dans le périmètre
 */
async function peiStats({ anneeId, groupeId, educateurId }) {
  const { enfantIds, educateurIds } = await computeScope({
    anneeId,
    groupeId,
    educateurId,
  });
  const where = {};
  if (anneeId) where.annee_id = anneeId;
  if (enfantIds) {
    if (enfantIds.length === 0) return { ...PEI_STATS_DEFAULT };
    where.enfant_id = { [Op.in]: enfantIds };
  }
  if (educateurIds) {
    if (educateurIds.length === 0) return { ...PEI_STATS_DEFAULT };
    where.educateur_id = { [Op.in]: educateurIds };
  }

  const rows = await PEI.findAll({
    where,
    attributes: [
      "statut",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["statut"],
    raw: true,
  });

  const map = { ...PEI_STATS_DEFAULT };
  for (const r of rows) {
    if (map[r.statut] === undefined) continue;
    map[r.statut] = Number(r.count) || 0;
  }
  return map;
}

/**
 * Activités par semaine (ISO week) sur N semaines dans le périmètre
 */
async function activitiesWeekly({ anneeId, groupeId, educateurId, weeks = 8 }) {
  const { enfantIds, educateurIds } = await computeScope({
    anneeId,
    groupeId,
    educateurId,
  });
  const since = startDateWeeksAgo(weeks);

  const where = { date_activite: { [Op.gte]: since } };
  if (enfantIds) {
    if (enfantIds.length === 0) return [];
    where.enfant_id = { [Op.in]: enfantIds };
  }
  if (educateurIds) {
    if (educateurIds.length === 0) return [];
    where.educateur_id = { [Op.in]: educateurIds };
  }

  const rows = await ActiviteProjet.findAll({
    attributes: [
      [sequelize.fn("YEARWEEK", sequelize.col("date_activite"), 3), "isoWeek"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    where,
    group: ["isoWeek"],
    order: [[sequelize.literal("isoWeek"), "ASC"]],
    raw: true,
  });

  return rows.map((r) => ({
    isoWeek: Number(r.isoWeek),
    count: Number(r.count),
  }));
}

/**
 * Distribution des scores d'évaluations (0..100) dans le périmètre
 */
async function evaluationsDistribution({
  anneeId,
  groupeId,
  educateurId,
  bins = 10,
}) {
  const { enfantIds, educateurIds } = await computeScope({
    anneeId,
    groupeId,
    educateurId,
  });

  // include PEI pour filtrer annee / enfant / educateur
  const include = [
    {
      model: PEI,
      as: "projet",
      attributes: [],
      where: {},
    },
  ];

  if (anneeId) include[0].where.annee_id = anneeId;
  if (enfantIds) {
    if (enfantIds.length === 0)
      return {
        bins,
        histogram: Array.from({ length: bins }, (_, i) => ({
          bin: i,
          from: 0,
          to: 0,
          count: 0,
        })),
      };
    include[0].where.enfant_id = { [Op.in]: enfantIds };
  }
  if (educateurIds) {
    if (educateurIds.length === 0)
      return {
        bins,
        histogram: Array.from({ length: bins }, (_, i) => ({
          bin: i,
          from: 0,
          to: 0,
          count: 0,
        })),
      };
    include[0].where.educateur_id = { [Op.in]: educateurIds };
  }

  const evals = await EvaluationProjet.findAll({
    attributes: ["score"],
    include,
    raw: true,
  });

  const scores = evals.map((e) => Number(e.score)).filter(Number.isFinite);
  const min = 0,
    max = 100;
  const size = (max - min) / bins;
  const histogram = Array.from({ length: bins }, (_, i) => ({
    bin: i,
    from: Math.round(min + i * size),
    to: Math.round(min + (i + 1) * size),
    count: 0,
  }));

  for (const s of scores) {
    let idx = Math.floor((s - min) / size);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    histogram[idx].count++;
  }
  return { bins, histogram };
}

/**
 * Résumé des groupes (actifs/archivés) dans l'année
 */
async function groupsSummary({ anneeId }) {
  const where = {};
  if (anneeId) where.annee_id = anneeId;
  const [actifs, archives, total] = await Promise.all([
    Groupe.count({ where: { ...where, statut: "actif" } }),
    Groupe.count({ where: { ...where, statut: "archive" } }),
    Groupe.count({ where }),
  ]);
  return { total, actifs, archives };
}

/**
 * Derniers contenus (filtrés léger via périmètre enfants/éducateurs quand pertinent)
 */
async function latestActualites({ limit = 8 }) {
  return Actualite.findAll({ order: [["publie_le", "DESC"]], limit });
}
async function upcomingEvents({ limit = 8 }) {
  const now = new Date();
  return Evenement.findAll({
    where: { debut: { [Op.gte]: now } },
    order: [["debut", "ASC"]],
    limit,
  });
}

/**
 * Flux récents dans le périmètre
 */
async function recent({ anneeId, groupeId, educateurId, limit = 8 }) {
  const { enfantIds, educateurIds } = await computeScope({
    anneeId,
    groupeId,
    educateurId,
  });

  // enfants
  const whereChildren = {};
  if (enfantIds) {
    if (enfantIds.length === 0)
      return { enfants: [], peis: [], activites: [], evaluations: [] };
    whereChildren.id = { [Op.in]: enfantIds };
  }

  // pei
  const wherePei = {};
  if (anneeId) wherePei.annee_id = anneeId;
  if (enfantIds) wherePei.enfant_id = { [Op.in]: enfantIds };
  if (educateurIds) wherePei.educateur_id = { [Op.in]: educateurIds };

  // activites
  const whereAct = {};
  if (enfantIds) whereAct.enfant_id = { [Op.in]: enfantIds };
  if (educateurIds) whereAct.educateur_id = { [Op.in]: educateurIds };

  // evaluations (via include projet)
  const includeEval = [
    {
      model: PEI,
      as: "projet",
      attributes: [],
      where: { ...wherePei },
    },
  ];

  const [enfants, peis, activites, evaluations] = await Promise.all([
    Enfant.findAll({
      where: whereChildren,
      order: [["created_at", "DESC"]],
      limit,
    }),
    PEI.findAll({ where: wherePei, order: [["date_creation", "DESC"]], limit }),
    ActiviteProjet.findAll({
      where: whereAct,
      order: [["date_activite", "DESC"]],
      limit,
    }),
    EvaluationProjet.findAll({
      include: includeEval,
      order: [["date_evaluation", "DESC"]],
      limit,
      raw: true,
    }),
  ]);

  return { enfants, peis, activites, evaluations };
}

/**
 * Overview agrégée (cards + graphs + lists) dans le périmètre
 */
async function overview(filters) {
  const { anneeId, groupeId, educateurId, weeks, bins, limit } = filters;
  const [cnt, pei, weekly, dist, latest, upcoming, rec] = await Promise.all([
    counters({ anneeId, groupeId, educateurId }),
    peiStats({ anneeId, groupeId, educateurId }),
    activitiesWeekly({ anneeId, groupeId, educateurId, weeks }),
    evaluationsDistribution({ anneeId, groupeId, educateurId, bins }),
    latestActualites({ limit }),
    upcomingEvents({ limit }),
    recent({ anneeId, groupeId, educateurId, limit }),
  ]);

  return {
    counters: cnt,
    peiStats: pei,
    activitiesWeekly: weekly,
    evalDistribution: dist,
    latestActualites: latest,
    upcomingEvents: upcoming,
    recent: rec,
  };
}

module.exports = {
  computeScope,
  counters,
  peiStats,
  activitiesWeekly,
  evaluationsDistribution,
  groupsSummary,
  latestActualites,
  upcomingEvents,
  recent,
  overview,
};
