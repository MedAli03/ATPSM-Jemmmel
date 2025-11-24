"use strict";

const { Enfant, DailyNote, EvaluationProjet } = require("../models");
const ficheRepo = require("../repos/fiche_enfant.repo");
const peiRepo = require("../repos/pei.repo");
const educatorAccess = require("./educateur_access.service");

const MAX_NOTES = 10;
const MAX_EVALUATIONS = 10;

const normalizeRole = (role) => String(role || "").toUpperCase();

const computeAge = (dateNaissance) => {
  if (!dateNaissance) return null;
  const birth = new Date(dateNaissance);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
};

const buildDisplayName = ({ prenom, nom }) => {
  const initial = nom ? `${nom.charAt(0).toUpperCase()}.` : "";
  return [prenom, initial].filter(Boolean).join(" ");
};

const parseObjectives = (raw) => {
  if (!raw) return [];
  let source = raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      source = parsed;
    } catch (err) {
      const lines = raw
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);
      return lines.map((label, idx) => ({
        id: idx + 1,
        label,
        progress: null,
      }));
    }
  }

  if (Array.isArray(source)) {
    return source.map((item, idx) => ({
      id: item.id || idx + 1,
      label: item.label || item.titre || item.objectif || item.description || "Objectif",
      progress: item.progress || item.progression || item.avancement || null,
    }));
  }

  if (source && Array.isArray(source.objectifs)) {
    return source.objectifs.map((item, idx) => ({
      id: item.id || idx + 1,
      label: item.label || item.titre || item.objectif || item.description || "Objectif",
      progress: item.progress || item.progression || item.avancement || null,
    }));
  }

  return [];
};

async function loadRecentNotes(where) {
  const notes = await DailyNote.findAll({
    where,
    attributes: ["id", "date_note", "contenu", "type"],
    order: [
      ["date_note", "DESC"],
      ["id", "DESC"],
    ],
    limit: MAX_NOTES,
  });
  return notes.map((note) => ({
    id: note.id,
    date: note.date_note,
    summary: note.contenu || "",
    type: note.type || null,
  }));
}

async function loadRecentEvaluations(peiId) {
  const evaluations = await EvaluationProjet.findAll({
    where: { projet_id: peiId },
    attributes: ["id", "date_evaluation", "score", "notes", "grille"],
    order: [
      ["date_evaluation", "DESC"],
      ["id", "DESC"],
    ],
    limit: MAX_EVALUATIONS,
  });
  return evaluations.map((row) => ({
    id: row.id,
    date: row.date_evaluation,
    objectiveLabel:
      (row.grille &&
        (row.grille.objectif || row.grille.objectif_label || row.grille.label)) ||
      null,
    score: row.score,
    comment: row.notes || null,
  }));
}

exports.buildChildContext = async ({ educatorId, role, childId }) => {
  const normalizedRole = normalizeRole(role);
  const safeChildId = Number(childId);
  const safeEducatorId = Number(educatorId);

  const activeYear = await educatorAccess.requireActiveSchoolYear();

  // Align with PEI/notes/evaluations: all roles except PRESIDENT must be
  // explicitly assigned to the child in the active school year.
  if (normalizedRole !== "PRESIDENT") {
    await educatorAccess.assertCanAccessChild(safeEducatorId, safeChildId);
  }

  const enfant = await Enfant.findByPk(safeChildId, {
    attributes: ["id", "nom", "prenom", "date_naissance"],
  });
  if (!enfant) {
    const err = new Error("Enfant introuvable");
    err.status = 404;
    throw err;
  }

  const fiche = await ficheRepo.findByEnfantId(safeChildId);

  const activePei = await peiRepo.findActiveByEnfantYear({
    enfant_id: safeChildId,
    annee_id: activeYear.id,
  });
  let peiContext = null;
  if (activePei) {
    const plain = activePei.get ? activePei.get({ plain: true }) : activePei;
    peiContext = {
      id: plain.id,
      status: plain.statut,
      yearId: activeYear.id,
      yearLabel: activeYear.libelle || null,
      objectives: parseObjectives(plain.objectifs),
    };
  }

  const recentNotes = await loadRecentNotes(
    peiContext ? { projet_id: peiContext.id } : { enfant_id: safeChildId }
  );
  const recentEvaluations = peiContext
    ? await loadRecentEvaluations(peiContext.id)
    : [];

  return {
    child: {
      id: enfant.id,
      displayName: buildDisplayName(enfant),
      age: computeAge(enfant.date_naissance),
      profileSummary: fiche?.troubles_principaux || fiche?.type_handicap || null,
    },
    pei: peiContext,
    recentNotes,
    recentEvaluations,
  };
};
