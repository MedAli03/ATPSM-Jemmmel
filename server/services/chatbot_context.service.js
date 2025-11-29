"use strict";

const {
  Enfant,
  FicheEnfant,
  ObservationInitiale,
  InscriptionEnfant,
  Groupe,
  AffectationEducateur,
  PEI,
  DailyNote,
  ActiviteProjet,
  EvaluationProjet,
} = require("../models");
const { resolveSchoolYear } = require("./educateur_access.service");

const RECENT_LIMIT = 5;

const buildError = (message, status) => {
  const err = new Error(message);
  if (status) err.status = status;
  return err;
};

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};

const trimText = (value, max = 180) => {
  if (!value || typeof value !== "string") return "";
  const clean = value.trim();
  if (!clean) return "";
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
};

async function assertEducatorHasAccessToChild(educateurId, enfantId, anneeId, transaction = null) {
  const year = await resolveSchoolYear(anneeId, transaction);

  const inscription = await InscriptionEnfant.findOne({
    where: {
      enfant_id: Number(enfantId),
      annee_id: year.id,
      est_active: true,
    },
    include: [
      {
        model: Groupe,
        as: "groupe",
        required: true,
        include: [
          {
            model: AffectationEducateur,
            as: "affectations",
            attributes: ["id"],
            required: true,
            where: {
              educateur_id: Number(educateurId),
              annee_id: year.id,
              est_active: true,
            },
          },
        ],
      },
    ],
    transaction,
  });

  if (!inscription) {
    throw buildError("Accès refusé à cet enfant pour cette année", 403);
  }

  return { year, inscription, groupe: inscription.groupe };
}

function buildEnfantSummary(enfant, fiche, lastObservation) {
  const nomComplet = `${enfant?.prenom || ""} ${enfant?.nom || ""}`.trim();
  const naissance = enfant?.date_naissance ? formatDate(enfant.date_naissance) : null;
  const diag = trimText(fiche?.diagnostic_medical || fiche?.troubles_principaux);
  const obs = trimText(lastObservation?.contenu);

  const lines = [];
  lines.push(`Enfant: ${nomComplet || "(inconnu)"}${naissance ? `, né(e) le ${naissance}` : ""}.`);
  if (diag) lines.push(`Profil / diagnostic: ${diag}.`);
  if (obs) lines.push(`Observation initiale: ${obs}.`);

  return lines.join("\n");
}

function buildGroupeSummary(groupe, yearLabel) {
  if (!groupe) return null;
  const parts = [`Groupe actuel: ${groupe.nom || "(non nommé)"}`];
  if (yearLabel) parts.push(`Année scolaire: ${yearLabel}`);
  return parts.join(" - ");
}

function buildPeiSummary(pei) {
  if (!pei) return null;
  const parts = [
    `PEI (statut: ${pei.statut || "n/c"})`,
  ];
  if (pei.date_creation) parts.push(`créé le ${formatDate(pei.date_creation)}`);
  if (pei.date_validation) parts.push(`validé le ${formatDate(pei.date_validation)}`);
  const objectifs = trimText(pei.objectifs);
  if (objectifs) parts.push(`Objectifs principaux: ${objectifs}`);
  return parts.join(". ");
}

function buildListSummary(title, entries) {
  if (!entries?.length) return null;
  const mapped = entries
    .map((item) => {
      const date = formatDate(item.date_note || item.date_activite || item.date_evaluation || item.created_at);
      const label = item.type || item.titre || item.score || "";
      const desc = trimText(item.contenu || item.description || item.notes || "");
      const pieces = [date || "(date inconnue)"];
      if (label) pieces.push(String(label));
      if (desc) pieces.push(desc);
      return `- ${pieces.join(" : ")}`;
    })
    .join("\n");
  return `${title}:\n${mapped}`;
}

async function loadRecentNotes(enfantId, peiId, transaction = null) {
  return DailyNote.findAll({
    where: {
      enfant_id: Number(enfantId),
      ...(peiId ? { projet_id: peiId } : {}),
    },
    order: [
      ["date_note", "DESC"],
      ["id", "DESC"],
    ],
    limit: RECENT_LIMIT,
    transaction,
  });
}

async function loadRecentActivities(enfantId, peiId, transaction = null) {
  if (!peiId) return [];
  return ActiviteProjet.findAll({
    where: { enfant_id: Number(enfantId), projet_id: peiId },
    order: [
      ["date_activite", "DESC"],
      ["id", "DESC"],
    ],
    limit: RECENT_LIMIT,
    transaction,
  });
}

async function loadRecentEvaluations(peiId, transaction = null) {
  if (!peiId) return [];
  return EvaluationProjet.findAll({
    where: { projet_id: peiId },
    order: [
      ["date_evaluation", "DESC"],
      ["id", "DESC"],
    ],
    limit: RECENT_LIMIT,
    transaction,
  });
}

async function findActivePei(enfantId, anneeId, transaction = null) {
  return PEI.findOne({
    where: { enfant_id: Number(enfantId), annee_id: Number(anneeId) },
    order: [
      ["est_actif", "DESC"],
      ["date_creation", "DESC"],
      ["id", "DESC"],
    ],
    transaction,
  });
}

exports.buildEducatorChatContext = async ({ enfantId, educateurId, anneeId }) => {
  if (!enfantId || !educateurId) {
    throw buildError("Paramètres enfantId ou educateurId manquants", 400);
  }

  const enfant = await Enfant.findByPk(Number(enfantId), {
    include: [
      {
        model: FicheEnfant,
        as: "fiche",
        required: false,
      },
      {
        model: ObservationInitiale,
        as: "observations_initiales",
        required: false,
        separate: true,
        limit: 1,
        order: [
          ["date_observation", "DESC"],
          ["id", "DESC"],
        ],
      },
    ],
  });

  if (!enfant) {
    throw buildError("Enfant introuvable", 404);
  }

  const { year, groupe } = await assertEducatorHasAccessToChild(
    educateurId,
    enfantId,
    anneeId
  );

  const pei = await findActivePei(enfant.id, year.id);
  const notes = await loadRecentNotes(enfant.id, pei?.id);
  const activities = await loadRecentActivities(enfant.id, pei?.id);
  const evaluations = await loadRecentEvaluations(pei?.id);

  const lastObservation = enfant.observations_initiales?.[0] || null;
  const enfantSummary = buildEnfantSummary(enfant, enfant.fiche, lastObservation);
  const groupeSummary = buildGroupeSummary(groupe, year.libelle);
  const peiSummary = buildPeiSummary(pei);
  const notesSummary = buildListSummary("Dernières observations (notes)", notes);
  const activitiesSummary = buildListSummary("Dernières activités", activities);
  const evaluationsSummary = buildListSummary("Dernières évaluations", evaluations);

  const sections = [
    enfantSummary,
    groupeSummary,
    peiSummary,
    notesSummary,
    evaluationsSummary,
    activitiesSummary,
  ].filter(Boolean);

  return {
    enfantSummary,
    groupeSummary,
    peiSummary,
    notesSummary,
    evaluationsSummary,
    activitiesSummary,
    anneeId: year.id,
    fullContext: sections.join("\n\n"),
  };
};
exports.assertEducatorHasAccessToChild = assertEducatorHasAccessToChild;
