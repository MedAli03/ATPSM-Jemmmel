"use strict";

const {
  sequelize,
  Sequelize,
  Enfant,
  Groupe,
  InscriptionEnfant,
  Utilisateur,
  FicheEnfant,
} = require("../models");

const { Op } = Sequelize;

async function getActiveChildIds(anneeId) {
  const where = { est_active: true };
  if (anneeId) where.annee_id = anneeId;
  const rows = await InscriptionEnfant.findAll({
    attributes: [[sequelize.fn("DISTINCT", sequelize.col("enfant_id")), "enfant_id"]],
    where,
    raw: true,
  });
  return rows.map((row) => row.enfant_id);
}

async function getChildIdsForYear(anneeId) {
  if (!anneeId) return [];
  const rows = await InscriptionEnfant.findAll({
    attributes: [[sequelize.fn("DISTINCT", sequelize.col("enfant_id")), "enfant_id"]],
    where: { annee_id: anneeId },
    raw: true,
  });
  return rows.map((row) => row.enfant_id);
}

exports.getDirectorStats = async ({ annee_id: anneeId }) => {
  const [
    totalChildren,
    totalEducators,
    activeGroups,
    archivedGroups,
    activeChildIds,
    pending,
    yearChildIds,
  ] =
    await Promise.all([
      anneeId
        ? InscriptionEnfant.count({
            where: { annee_id: anneeId, est_active: true },
            distinct: true,
            col: "enfant_id",
          })
        : Enfant.count(),
      Utilisateur.count({ where: { role: "EDUCATEUR", is_active: true } }),
      Groupe.count({ where: { statut: "actif", ...(anneeId ? { annee_id: anneeId } : {}) } }),
      Groupe.count({ where: { statut: "archive", ...(anneeId ? { annee_id: anneeId } : {}) } }),
      getActiveChildIds(anneeId),
      InscriptionEnfant.count({
        where: { est_active: false, ...(anneeId ? { annee_id: anneeId } : {}) },
      }),
      anneeId ? getChildIdsForYear(anneeId) : Promise.resolve([]),
    ]);

  let childrenWithoutGroup = 0;
  if (anneeId) {
    if (yearChildIds.length === 0) {
      childrenWithoutGroup = 0;
    } else {
      const activeSet = new Set(activeChildIds);
      childrenWithoutGroup = yearChildIds.filter((id) => !activeSet.has(id)).length;
    }
  } else {
    if (activeChildIds.length > 0) {
      childrenWithoutGroup = await Enfant.count({
        where: { id: { [Op.notIn]: activeChildIds } },
      });
    } else {
      childrenWithoutGroup = await Enfant.count();
    }
  }

  return {
    enfants_total: Number(totalChildren) || 0,
    groupes_actifs: Number(activeGroups) || 0,
    groupes_archive: Number(archivedGroups) || 0,
    educateurs_total: Number(totalEducators) || 0,
    enfants_sans_groupe: Number(childrenWithoutGroup) || 0,
    inscriptions_en_attente: Number(pending) || 0,
  };
};

exports.getChildrenPerGroup = async ({ annee_id: anneeId, limit = 10 }) => {
  const where = { est_active: true };
  if (anneeId) where.annee_id = anneeId;

  const rows = await InscriptionEnfant.findAll({
    attributes: [
      "groupe_id",
      [sequelize.fn("COUNT", sequelize.col("enfant_id")), "enfants_total"],
    ],
    where,
    include: [
      {
        model: Groupe,
        as: "groupe",
        attributes: ["id", "nom"],
        required: true,
      },
    ],
    group: ["groupe_id", "groupe.id", "groupe.nom"],
    order: [[sequelize.literal("enfants_total"), "DESC"]],
    limit,
    raw: true,
    nest: true,
  });

  return rows.map((row) => ({
    groupe_id: row.groupe_id,
    groupe_nom: row.groupe?.nom || "",
    enfants_total: Number(row.enfants_total) || 0,
  }));
};

exports.getMonthlyInscriptions = async ({ annee_id: anneeId, months = 12 }) => {
  const limit = Math.min(Math.max(months, 1), 24);
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (limit - 1), 1);

  const where = {
    date_inscription: { [Op.gte]: start },
  };
  if (anneeId) where.annee_id = anneeId;

  const rows = await InscriptionEnfant.findAll({
    attributes: [
      [sequelize.fn("DATE_FORMAT", sequelize.col("date_inscription"), "%Y-%m-01"), "month"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    where,
    group: [sequelize.fn("DATE_FORMAT", sequelize.col("date_inscription"), "%Y-%m-01")],
    order: [[sequelize.fn("DATE_FORMAT", sequelize.col("date_inscription"), "%Y-%m-01"), "ASC"]],
    raw: true,
  });

  const map = new Map(rows.map((row) => [row.month, Number(row.count) || 0]));
  const results = [];
  for (let i = 0; i < limit; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = d.toISOString().slice(0, 7) + "-01";
    results.push({
      mois: key.slice(0, 7),
      total: map.get(key) || 0,
    });
  }
  return results;
};

exports.getFamilySituationDistribution = async ({ annee_id: anneeId }) => {
  const childIds = await getActiveChildIds(anneeId);
  const where = { situation_familiale: { [Op.ne]: null } };
  if (anneeId) {
    if (childIds.length === 0) {
      return [];
    }
    where.enfant_id = { [Op.in]: childIds };
  }

  const rows = await FicheEnfant.findAll({
    attributes: [
      "situation_familiale",
      [sequelize.fn("COUNT", sequelize.col("enfant_id")), "count"],
    ],
    where,
    group: ["situation_familiale"],
    raw: true,
  });

  return rows.map((row) => ({
    situation: row.situation_familiale,
    total: Number(row.count) || 0,
  }));
};

exports.getNonInscrits = async ({ annee_id: anneeId, limit = 10, search }) => {
  const [activeIds, yearIds] = await Promise.all([
    getActiveChildIds(anneeId),
    getChildIdsForYear(anneeId),
  ]);
  const where = {};
  if (yearIds.length) {
    where.id = { [Op.in]: yearIds };
  }
  if (activeIds.length) {
    if (!where.id) where.id = {};
    where.id[Op.notIn] = activeIds;
  }
  if (search) {
    where[Op.or] = [
      { nom: { [Op.like]: `%${search}%` } },
      { prenom: { [Op.like]: `%${search}%` } },
    ];
  }

  const enfants = await Enfant.findAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
  });

  return enfants.map((e) => ({
    id: e.id,
    nom: e.nom,
    prenom: e.prenom,
  }));
};

exports.createInscription = async ({ enfant_id, groupe_id, annee_id }) => {
  return sequelize.transaction(async (t) => {
    const [enfant, groupe] = await Promise.all([
      Enfant.findByPk(enfant_id, { transaction: t }),
      Groupe.findByPk(groupe_id, { transaction: t }),
    ]);

    if (!enfant) {
      const err = new Error("Enfant introuvable");
      err.status = 404;
      throw err;
    }

    if (!groupe) {
      const err = new Error("Groupe introuvable");
      err.status = 404;
      throw err;
    }

    if (Number(groupe.annee_id) !== Number(annee_id)) {
      const err = new Error("Le groupe n'appartient pas à cette année scolaire");
      err.status = 422;
      throw err;
    }

    const existing = await InscriptionEnfant.findOne({
      where: { enfant_id, annee_id, est_active: true },
      transaction: t,
    });
    if (existing) {
      const err = new Error("L'enfant est déjà inscrit pour cette année");
      err.status = 409;
      throw err;
    }

    const inscription = await InscriptionEnfant.create(
      {
        enfant_id,
        groupe_id,
        annee_id,
        date_inscription: new Date(),
        est_active: true,
      },
      { transaction: t }
    );

    return { id: inscription.id };
  });
};

