"use strict";

const { Op } = require("sequelize");
const {
  Enfant,
  Utilisateur,
  InscriptionEnfant,
  Groupe,
  AffectationEducateur,
  PEI,
} = require("../models");
const anneesRepo = require("../repos/annees.repo");

async function requireActiveSchoolYear(transaction = null) {
  const active = await anneesRepo.findActive(transaction);
  if (!active) {
    const err = new Error("Aucune année scolaire active");
    err.status = 409;
    throw err;
  }
  return active;
}

async function resolveSchoolYear(requestedAnneeId, transaction = null) {
  if (requestedAnneeId) {
    const year = await anneesRepo.findById(Number(requestedAnneeId), transaction);
    if (!year) {
      const err = new Error("Année scolaire introuvable");
      err.status = 404;
      throw err;
    }
    return year;
  }
  return requireActiveSchoolYear(transaction);
}

function buildChildSearchFilter(search) {
  if (!search || typeof search !== "string") return null;
  const term = search.trim();
  if (!term) return null;
  return {
    [Op.or]: [
      { prenom: { [Op.like]: `%${term}%` } },
      { nom: { [Op.like]: `%${term}%` } },
    ],
  };
}

async function listChildrenForEducateurCurrentYear(
  educateurId,
  { search = null, page = 1, limit = 20 } = {},
  transaction = null
) {
  const activeYear = await requireActiveSchoolYear(transaction);
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
  const offset = (currentPage - 1) * pageSize;
  const enfantWhere = buildChildSearchFilter(search) || {};

  const { rows, count } = await Enfant.findAndCountAll({
    where: enfantWhere,
    include: [
      {
        model: Utilisateur,
        as: "parent",
        attributes: ["id", "nom", "prenom", "email", "telephone"],
        required: false,
      },
      {
        model: InscriptionEnfant,
        as: "inscriptions",
        attributes: ["id", "groupe_id", "annee_id"],
        required: true,
        where: { est_active: true, annee_id: activeYear.id },
        include: [
          {
            model: Groupe,
            as: "groupe",
            attributes: ["id", "nom"],
            required: true,
            include: [
              {
                model: AffectationEducateur,
                as: "affectations",
                attributes: [],
                required: true,
                where: {
                  educateur_id: Number(educateurId),
                  est_active: true,
                  annee_id: activeYear.id,
                },
              },
            ],
          },
        ],
      },
    ],
    order: [
      ["prenom", "ASC"],
      ["nom", "ASC"],
    ],
    offset,
    limit: pageSize,
    distinct: true,
    transaction,
  });

  return { rows, count, page: currentPage, limit: pageSize };
}

async function listAccessibleChildIds(educateurId, transaction = null) {
  const activeYear = await requireActiveSchoolYear(transaction);
  const rows = await InscriptionEnfant.findAll({
    attributes: ["enfant_id"],
    where: { annee_id: activeYear.id, est_active: true },
    include: [
      {
        model: Groupe,
        as: "groupe",
        attributes: [],
        required: true,
        include: [
          {
            model: AffectationEducateur,
            as: "affectations",
            attributes: [],
            required: true,
            where: {
              educateur_id: Number(educateurId),
              est_active: true,
              annee_id: activeYear.id,
            },
          },
        ],
      },
    ],
    transaction,
  });
  const enfantIds = [...new Set(rows.map((row) => row.enfant_id))];
  return { enfantIds, anneeId: activeYear.id };
}

async function assertCanAccessChild(educateurId, enfantId, transaction = null) {
  const activeYear = await requireActiveSchoolYear(transaction);
  const count = await InscriptionEnfant.count({
    where: {
      enfant_id: Number(enfantId),
      annee_id: activeYear.id,
      est_active: true,
    },
    include: [
      {
        model: Groupe,
        as: "groupe",
        required: true,
        attributes: [],
        include: [
          {
            model: AffectationEducateur,
            as: "affectations",
            attributes: [],
            required: true,
            where: {
              educateur_id: Number(educateurId),
              annee_id: activeYear.id,
              est_active: true,
            },
          },
        ],
      },
    ],
    transaction,
  });
  if (!count) {
    const err = new Error("Accès refusé à cet enfant");
    err.status = 403;
    throw err;
  }
  return { anneeId: activeYear.id };
}

async function assertAssignmentForYear(
  educateurId,
  groupeId,
  requestedAnneeId,
  transaction = null
) {
  const targetYear = await resolveSchoolYear(requestedAnneeId, transaction);
  const affectation = await AffectationEducateur.findOne({
    where: {
      educateur_id: Number(educateurId),
      groupe_id: Number(groupeId),
      annee_id: targetYear.id,
      est_active: true,
    },
    transaction,
  });
  if (!affectation) {
    const err = new Error(
      "Vous n'êtes pas affecté à ce groupe pour l'année demandée"
    );
    err.status = 403;
    throw err;
  }
  return { anneeId: targetYear.id };
}

async function assertCanAccessPei(educateurId, peiId, transaction = null) {
  const pei = await PEI.findByPk(peiId, {
    attributes: ["id", "enfant_id", "annee_id"],
    transaction,
  });
  if (!pei) {
    const err = new Error("PEI introuvable");
    err.status = 404;
    throw err;
  }
  await assertCanAccessChild(educateurId, pei.enfant_id, transaction);
  return pei;
}

module.exports = {
  requireActiveSchoolYear,
  resolveSchoolYear,
  listChildrenForEducateurCurrentYear,
  listAccessibleChildIds,
  assertCanAccessChild,
  assertAssignmentForYear,
  assertCanAccessPei,
};
