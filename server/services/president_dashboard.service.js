"use strict";

const {
  sequelize,
  Sequelize,
  Utilisateur,
  Enfant,
  Groupe,
  AnneeScolaire,
  PEI,
  ActiviteProjet,
  EvaluationProjet,
  Actualite,
  Evenement,
  Notification,
} = require("../models");

const notifier = require("./notifier.service");
const anneesService = require("./annees.service");
const { Op } = Sequelize;

function startDateWeeksAgo(weeks) {
  const d = new Date();
  d.setDate(d.getDate() - weeks * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function counters() {
  const [nbEnfants, nbEducateurs, nbParents, nbGroupesActifs, anneeActive] =
    await Promise.all([
      Enfant.count(),
      Utilisateur.count({ where: { role: "EDUCATEUR", is_active: true } }),
      Utilisateur.count({ where: { role: "PARENT", is_active: true } }),
      Groupe.count({ where: { statut: "actif" } }),
      AnneeScolaire.findOne({
        where: { est_active: true },
        attributes: ["id", "libelle"],
      }),
    ]);
  return {
    nbEnfants,
    nbEducateurs,
    nbParents,
    nbGroupesActifs,
    anneeActive,
  };
}

async function usersSummary() {
  const roles = ["PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT"];
  const rows = await Promise.all(
    roles.map(async (role) => ({
      role,
      total: await Utilisateur.count({ where: { role, is_active: true } }),
    }))
  );
  return rows;
}

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

async function peiStats({ anneeId }) {
  const where = {};
  if (anneeId) where.annee_id = anneeId;

  // counts by statut
  const rows = await PEI.findAll({
    where,
    attributes: [
      "statut",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["statut"],
    raw: true,
  });

  // normalize
  const map = { brouillon: 0, actif: 0, clos: 0 };
  for (const r of rows) map[r.statut] = Number(r.count) || 0;

  return map;
}

async function activitiesWeekly({ anneeId, weeks = 8 }) {
  const since = startDateWeeksAgo(weeks);
  // If you want to filter by annee, we need to join via PEI -> annee_id; here we just do time window
  const rows = await ActiviteProjet.findAll({
    attributes: [
      [sequelize.fn("YEARWEEK", sequelize.col("date_activite"), 3), "isoWeek"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    where: {
      date_activite: { [Op.gte]: since },
    },
    group: ["isoWeek"],
    order: [[sequelize.literal("isoWeek"), "ASC"]],
    raw: true,
  });

  // Return as [{ isoWeek: 202536, count: 12 }, ...]
  return rows.map((r) => ({
    isoWeek: Number(r.isoWeek),
    count: Number(r.count),
  }));
}

async function evaluationsDistribution({ anneeId, bins = 10 }) {
  // Fetch raw scores; if anneeId filter required, join PEI
  const include = anneeId
    ? [
        {
          model: PEI,
          as: "projet",
          attributes: [],
          where: { annee_id: anneeId },
        },
      ]
    : [];
  const evals = await EvaluationProjet.findAll({
    attributes: ["score"],
    include,
    raw: true,
  });

  const scores = evals
    .map((e) => Number(e.score))
    .filter((n) => Number.isFinite(n));
  if (!scores.length) {
    return {
      bins,
      histogram: Array.from({ length: bins }, (_, i) => ({
        bin: i,
        from: 0,
        to: 0,
        count: 0,
      })),
    };
  }

  const min = 0,
    max = 100; // convention
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

async function latestActualites({ limit = 8 }) {
  const rows = await Actualite.findAll({
    order: [["publie_le", "DESC"]],
    limit,
  });
  return rows;
}

async function upcomingEvents({ limit = 8 }) {
  const now = new Date();
  const rows = await Evenement.findAll({
    where: { debut: { [Op.gte]: now } },
    order: [["debut", "ASC"]],
    limit,
  });
  return rows;
}

async function recent({ limit = 8 }) {
  const [enfants, peis, activites, evaluations, actualites] = await Promise.all(
    [
      Enfant.findAll({ order: [["created_at", "DESC"]], limit }),
      PEI.findAll({ order: [["date_creation", "DESC"]], limit }),
      ActiviteProjet.findAll({ order: [["date_activite", "DESC"]], limit }),
      EvaluationProjet.findAll({ order: [["date_evaluation", "DESC"]], limit }),
      Actualite.findAll({ order: [["publie_le", "DESC"]], limit }),
    ]
  );
  return { enfants, peis, activites, evaluations, actualites };
}

async function unreadCountFor(userId) {
  const n = await Notification.count({
    where: { utilisateur_id: userId, lu_le: null },
  });
  return { unread: n };
}

async function overview({ anneeId, weeks, bins, limit, currentUserId }) {
  const [cnt, pei, weekly, dist, latest, upcoming, unread] = await Promise.all([
    counters(),
    peiStats({ anneeId }),
    activitiesWeekly({ anneeId, weeks }),
    evaluationsDistribution({ anneeId, bins }),
    latestActualites({ limit }),
    upcomingEvents({ limit }),
    unreadCountFor(currentUserId),
  ]);

  return {
    counters: cnt,
    peiStats: pei,
    activitiesWeekly: weekly,
    evalDistribution: dist,
    latestActualites: latest,
    upcomingEvents: upcoming,
    notifications: unread,
  };
}

// Shortcuts (mutations)
async function activateYear(id) {
  return anneesService.activate(id);
}

async function broadcast({ role, type, titre, corps }, currentUser) {
  // decorate title with sender?
  const payload = { type, titre, corps };
  if (role === "ALL") return notifier.notifyBroadcastToAll(payload);
  return notifier.notifyBroadcastToRole(role, payload);
}

module.exports = {
  // read
  counters,
  usersSummary,
  groupsSummary,
  peiStats,
  activitiesWeekly,
  evaluationsDistribution,
  latestActualites,
  upcomingEvents,
  recent,
  unreadCountFor,
  overview,
  // write shortcuts
  activateYear,
  broadcast,
};
