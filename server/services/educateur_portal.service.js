"use strict";

const { AffectationEducateur, Groupe } = require("../models");
const educatorAccess = require("./educateur_access.service");
const enfantService = require("./enfant.service");
const peiRepo = require("../repos/pei.repo");
const peiService = require("./pei.service");
const dailynoteService = require("./dailynote.service");
const evaluationService = require("./evaluation.service");
const activiteService = require("./activite.service");
const observationService = require("./observation_initiale.service");

async function listMyGroups(educateurId) {
  const activeYear = await educatorAccess.requireActiveSchoolYear();
  const affectations = await AffectationEducateur.findAll({
    where: {
      educateur_id: Number(educateurId),
      annee_id: activeYear.id,
      est_active: true,
    },
    include: [
      {
        model: Groupe,
        as: "groupe",
      },
    ],
    order: [[{ model: Groupe, as: "groupe" }, "nom", "ASC"]],
  });

  return affectations
    .map((aff) => aff.groupe?.get?.({ plain: true }))
    .filter(Boolean)
    .map((g) => ({ ...g, annee_id: g.annee_id ?? activeYear.id }));
}

async function listMyChildren(query, currentUser) {
  const { search, page, limit, groupeId } = query;
  return educatorAccess.listChildrenForEducateurCurrentYear(
    currentUser.id,
    { search, page, limit, groupeId }
  );
}

async function getChild(enfantId, currentUser) {
  return enfantService.get(enfantId, currentUser);
}

async function getActivePeiForChild(enfantId, currentUser) {
  const { anneeId } = await educatorAccess.assertCanAccessChild(
    currentUser.id,
    enfantId
  );
  const pei = await peiRepo.findActiveByEnfantYear({
    enfant_id: enfantId,
    annee_id: anneeId,
  });
  if (!pei) {
    const err = new Error("Aucun PEI actif pour cet enfant");
    err.status = 404;
    throw err;
  }
  return pei.get ? pei.get({ plain: true }) : pei;
}

async function createPeiForChild(enfantId, payload, currentUser) {
  const activeYear = await educatorAccess.requireActiveSchoolYear();
  await educatorAccess.assertCanAccessChild(currentUser.id, enfantId);
  const dto = {
    enfant_id: Number(enfantId),
    educateur_id: currentUser.id,
    annee_id: activeYear.id,
    date_creation: payload.date_creation || new Date().toISOString(),
    objectifs: payload.objectifs ?? null,
    precedent_projet_id: payload.precedent_projet_id || null,
  };
  return peiService.create(dto, currentUser);
}

async function updatePei(peiId, payload, currentUser) {
  if (currentUser?.role === "EDUCATEUR") {
    await educatorAccess.assertCanAccessPei(currentUser.id, peiId);
  }
  return peiService.update(peiId, payload, currentUser);
}

async function listPeiActivities(peiId, query, currentUser) {
  return activiteService.listByPei(peiId, query, currentUser);
}

async function createPeiActivity(peiId, body, currentUser) {
  return activiteService.create(peiId, body, currentUser);
}

async function listDailyNotesForChild(enfantId, query, currentUser) {
  const pei = await getActivePeiForChild(enfantId, currentUser);
  return dailynoteService.listByPei(pei.id, query, currentUser);
}

async function createDailyNoteForChild(enfantId, body, currentUser) {
  const explicitPeiId = body.peiId || body.pei_id || body.projet_id;
  const pei = explicitPeiId
    ? await peiService.get(explicitPeiId, currentUser)
    : await getActivePeiForChild(enfantId, currentUser);
  if (!pei) {
    const err = new Error("PEI introuvable pour cette note");
    err.status = 404;
    throw err;
  }
  await educatorAccess.assertCanAccessChild(currentUser.id, enfantId);
  const payload = { ...body, enfant_id: Number(enfantId) };
  return dailynoteService.create(pei.id || pei.pei_id || pei, payload, currentUser);
}

async function listEvaluations(peiId, query, currentUser) {
  return evaluationService.listByPei(peiId, query, currentUser);
}

async function createEvaluation(peiId, body, currentUser) {
  return evaluationService.create(peiId, body, currentUser);
}

async function listObservations(enfantId, query, currentUser) {
  const filters = { ...query, enfant_id: Number(enfantId) };
  return observationService.list(filters, currentUser);
}

async function createObservation(enfantId, body, currentUser) {
  const payload = { ...body, enfant_id: Number(enfantId) };
  return observationService.create(payload, currentUser);
}

async function updateObservation(obsId, body, currentUser) {
  return observationService.update(obsId, body, currentUser);
}

module.exports = {
  listMyGroups,
  listMyChildren,
  getChild,
  getActivePeiForChild,
  createPeiForChild,
  updatePei,
  listPeiActivities,
  createPeiActivity,
  listDailyNotesForChild,
  createDailyNoteForChild,
  listEvaluations,
  createEvaluation,
  listObservations,
  createObservation,
  updateObservation,
};
