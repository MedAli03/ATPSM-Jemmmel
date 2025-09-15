// services/notifier.js
"use strict";

/**
 * Centralized notifier (audience resolution + bulk insert).
 * Usage examples (inside your services, within a transaction `t`):
 *
 *   const notifier = require("./notifier");
 *   await notifier.notifyOnNewsPublished(actualite, t);
 *   await notifier.notifyOnChildAssignedToGroup({ enfant_id, groupe_id, annee_id }, t);
 */

const {
  sequelize,
  Sequelize,
  Utilisateur,
  Notification,
  Enfant,
  Groupe,
  InscriptionEnfant,
  AffectationEducateur,
  PEI,
  EvaluationProjet,
  ActiviteProjet,
  DailyNote,
  Thread,
  Message,
} = require("../models");

const { Op } = Sequelize;

// -------------------------------
// Low-level helpers
// -------------------------------

async function bulkSave(rows, t) {
  if (!rows || rows.length === 0) return 0;
  const now = new Date();
  const payload = rows.map((r) => ({
    utilisateur_id: r.utilisateur_id,
    type: r.type,
    titre: r.titre,
    corps: r.corps,
    lu_le: null,
    created_at: now,
    updated_at: now,
  }));
  await Notification.bulkCreate(payload, { transaction: t });
  return payload.length;
}

async function toUsers(userIds, { type, titre, corps }, t) {
  if (!userIds || userIds.length === 0) return 0;
  const rows = userIds.map((id) => ({
    utilisateur_id: id,
    type,
    titre,
    corps,
  }));
  return bulkSave(rows, t);
}

async function toRoles(target, { type, titre, corps }, t) {
  const where = { is_active: true };
  if (target !== "ALL") where.role = target;
  const users = await Utilisateur.findAll({
    where,
    attributes: ["id"],
    transaction: t,
  });
  return toUsers(users.map((u) => u.id), { type, titre, corps }, t);
}

async function parentOfChild(enfantId, t) {
  const e = await Enfant.findByPk(enfantId, { transaction: t, attributes: ["parent_user_id"] });
  return e?.parent_user_id ? [e.parent_user_id] : [];
}

async function educateurOfGroupYear(groupeId, anneeId, t) {
  const aff = await AffectationEducateur.findOne({
    where: { groupe_id: groupeId, annee_id: anneeId },
    attributes: ["educateur_id"],
    transaction: t,
  });
  return aff ? [aff.educateur_id] : [];
}

async function parentsInGroupYear(groupeId, anneeId, t) {
  const inscriptions = await InscriptionEnfant.findAll({
    where: { groupe_id: groupeId, annee_id: anneeId },
    attributes: ["enfant_id"],
    transaction: t,
  });
  if (!inscriptions.length) return [];
  const enfants = await Enfant.findAll({
    where: { id: { [Op.in]: inscriptions.map((i) => i.enfant_id) } },
    attributes: ["parent_user_id"],
    transaction: t,
  });
  const parentIds = enfants.map((e) => e.parent_user_id).filter(Boolean);
  return [...new Set(parentIds)];
}

// Utility: trim body to keep notifications short
function short(text, n = 180) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n) + "…" : text;
}

// -------------------------------
// 1) Actualités (News / Announcements)
// -------------------------------

async function notifyOnNewsPublished(actualite, t = null) {
  // audience: ALL internal roles (you can narrow to "EDUCATEUR"|"DIRECTEUR")
  return toRoles("ALL", {
    type: "ACTUALITE",
    titre: `Nouvelle actualité : ${actualite.titre}`,
    corps: short(actualite.contenu),
  }, t);
}

async function notifyOnNewsUpdated(actualite, t = null) {
  return toRoles("ALL", {
    type: "ACTUALITE",
    titre: `Mise à jour : ${actualite.titre}`,
    corps: short(actualite.contenu),
  }, t);
}

// -------------------------------
// 2) Événements (Events)
// -------------------------------

async function notifyOnEventCreated(evt, t = null) {
  // You can route by audience if needed
  const payload = {
    type: "EVENEMENT",
    titre: `Nouvel événement : ${evt.titre}`,
    corps: short(`${evt.description || ""} • Débute: ${new Date(evt.debut).toLocaleString()}`),
  };
  if (evt.audience === "parents") {
    // notify only parents (optionally per group; here we broadcast to all parents)
    return toRoles("PARENT", payload, t);
  }
  if (evt.audience === "educateurs") {
    return toRoles("EDUCATEUR", payload, t);
  }
  return toRoles("ALL", payload, t);
}

async function notifyOnEventUpdated(evt, t = null) {
  const payload = {
    type: "EVENEMENT",
    titre: `Événement mis à jour : ${evt.titre}`,
    corps: short(`${evt.description || ""} • Débute: ${new Date(evt.debut).toLocaleString()}`),
  };
  if (evt.audience === "parents") return toRoles("PARENT", payload, t);
  if (evt.audience === "educateurs") return toRoles("EDUCATEUR", payload, t);
  return toRoles("ALL", payload, t);
}

async function notifyOnEventDeleted(evt, t = null) {
  const payload = {
    type: "EVENEMENT",
    titre: `Événement annulé : ${evt.titre}`,
    corps: short(evt.description || "Cet événement a été annulé."),
  };
  if (evt.audience === "parents") return toRoles("PARENT", payload, t);
  if (evt.audience === "educateurs") return toRoles("EDUCATEUR", payload, t);
  return toRoles("ALL", payload, t);
}

// -------------------------------
// 3) Documents / Règlements
// -------------------------------

async function notifyOnDocumentPublished(doc, t = null) {
  return toRoles("ALL", {
    type: "DOCUMENT",
    titre: `Document publié : ${doc.titre}`,
    corps: short(`Disponible: ${doc.url}`),
  }, t);
}

async function notifyOnReglementUpdated(reglement, t = null) {
  // broadcast to parents + educators
  const payload = {
    type: "REGLEMENT",
    titre: `Règlement mis à jour (${reglement.version})`,
    corps: short(`Date d'effet: ${reglement.date_effet}`),
  };
  const a = await toRoles("PARENT", payload, t);
  const b = await toRoles("EDUCATEUR", payload, t);
  return a + b;
}

// -------------------------------
// 4) Groupes (inscriptions & affectations)
// -------------------------------

async function notifyOnChildAssignedToGroup({ enfant_id, groupe_id, annee_id }, t = null) {
  const parentIds = await parentOfChild(enfant_id, t);
  if (!parentIds.length) return 0;
  return toUsers(parentIds, {
    type: "INSCRIPTION",
    titre: "Inscription confirmée",
    corps: `Votre enfant a été inscrit au groupe #${groupe_id} pour l’année #${annee_id}.`,
  }, t);
}

async function notifyOnEducatorAssignedToGroup({ educateur_id, groupe_id, annee_id }, t = null) {
  return toUsers([educateur_id], {
    type: "AFFECTATION",
    titre: "Nouvelle affectation",
    corps: `Vous avez été affecté au groupe #${groupe_id} pour l’année #${annee_id}.`,
  }, t);
}

// -------------------------------
// 5) PEI (Projet Éducatif Individuel)
// -------------------------------

async function notifyOnPEICreated(pei, t = null) {
  // parent + éducateur
  const parentIds = await parentOfChild(pei.enfant_id, t);
  const eduIds = pei.educateur_id ? [pei.educateur_id] : [];
  const a = parentIds.length
    ? await toUsers(parentIds, {
        type: "PEI",
        titre: "Nouveau PEI créé",
        corps: "Un nouveau projet éducatif a été créé pour votre enfant.",
      }, t)
    : 0;
  const b = eduIds.length
    ? await toUsers(eduIds, {
        type: "PEI",
        titre: "PEI créé",
        corps: `Un PEI vient d’être créé pour l’enfant #${pei.enfant_id}.`,
      }, t)
    : 0;
  return a + b;
}

async function notifyOnPEIUpdated(pei, t = null) {
  // parent
  const parentIds = await parentOfChild(pei.enfant_id, t);
  if (!parentIds.length) return 0;
  return toUsers(parentIds, {
    type: "PEI",
    titre: "PEI mis à jour",
    corps: "Le projet éducatif de votre enfant a été mis à jour.",
  }, t);
}

async function notifyOnPEIClosed(pei, t = null) {
  const parentIds = await parentOfChild(pei.enfant_id, t);
  if (!parentIds.length) return 0;
  return toUsers(parentIds, {
    type: "PEI",
    titre: "PEI clôturé",
    corps: "Le projet éducatif de votre enfant a été clôturé.",
  }, t);
}

// -------------------------------
// 6) Évaluations
// -------------------------------

async function notifyOnEvaluationAdded(evaluation, t = null) {
  // parent
  // evaluation: { projet_id, date_evaluation, ... } → need enfant_id via PEI or provided by caller
  let enfantId = evaluation.enfant_id;
  if (!enfantId && evaluation.projet_id) {
    const pei = await PEI.findByPk(evaluation.projet_id, { attributes: ["enfant_id"], transaction: t });
    enfantId = pei?.enfant_id;
  }
  const parentIds = enfantId ? await parentOfChild(enfantId, t) : [];
  if (!parentIds.length) return 0;
  return toUsers(parentIds, {
    type: "EVALUATION",
    titre: "Nouvelle évaluation",
    corps: "Une nouvelle évaluation a été ajoutée au PEI de votre enfant.",
  }, t);
}

// -------------------------------
// 7) Recommandations IA
// -------------------------------

async function notifyOnRecommendationsReady({ enfant_id, educateur_id }, t = null) {
  // Educateur uniquement (règle : jamais parent pour les RAW recommendations)
  if (!educateur_id) return 0;
  return toUsers([educateur_id], {
    type: "RECO_AI",
    titre: "Recommandations IA disponibles",
    corps: `De nouvelles recommandations IA sont prêtes pour l’enfant #${enfant_id}.`,
  }, t);
}

async function notifyOnRecommendationsApplied({ enfant_id }, t = null) {
  // Parent (après arbitrage et application)
  const parentIds = await parentOfChild(enfant_id, t);
  if (!parentIds.length) return 0;
  return toUsers(parentIds, {
    type: "PEI",
    titre: "Mise à jour du PEI",
    corps: "Des recommandations validées ont été ajoutées au PEI de votre enfant.",
  }, t);
}

// -------------------------------
// 8) Daily Notes / Activités
// -------------------------------

async function notifyOnDailyNoteAdded(note, t = null) {
  const parentIds = await parentOfChild(note.enfant_id, t);
  if (!parentIds.length) return 0;
  return toUsers(parentIds, {
    type: "NOTE",
    titre: "Nouvelle note quotidienne",
    corps: short(note.contenu || "Une nouvelle note a été ajoutée."),
  }, t);
}

async function notifyOnActivityAdded(activity, t = null) {
  const parentIds = await parentOfChild(activity.enfant_id, t);
  if (!parentIds.length) return 0;
  return toUsers(parentIds, {
    type: "ACTIVITE",
    titre: `Nouvelle activité : ${activity.titre || "Activité"}`,
    corps: short(activity.description || "Une nouvelle activité a été ajoutée."),
  }, t);
}

// -------------------------------
// 9) Messagerie interne
// -------------------------------

async function notifyOnNewMessage({ thread_id, expediteur_id, texte }, t = null) {
  // notify all participants of the thread except sender
  const msgs = await Message.findAll({
    where: { thread_id },
    attributes: ["expediteur_id"],
    transaction: t,
  });
  const participants = [...new Set(msgs.map((m) => m.expediteur_id))].filter((id) => id && id !== expediteur_id);
  if (!participants.length) return 0;

  return toUsers(participants, {
    type: "MESSAGE",
    titre: "Nouveau message",
    corps: short(texte || "Vous avez reçu un nouveau message."),
  }, t);
}

// -------------------------------
// 10) Broadcast helpers (explicit)
// -------------------------------

async function notifyBroadcastToRole(role, payload, t = null) {
  return toRoles(role, payload, t);
}

async function notifyBroadcastToAll(payload, t = null) {
  return toRoles("ALL", payload, t);
}

// -------------------------------

module.exports = {
  // low-level audience helpers (exported in case you need them elsewhere)
  toUsers,
  toRoles,
  parentOfChild,
  educateurOfGroupYear,
  parentsInGroupYear,

  // 1. actualités
  notifyOnNewsPublished,
  notifyOnNewsUpdated,

  // 2. événements
  notifyOnEventCreated,
  notifyOnEventUpdated,
  notifyOnEventDeleted,

  // 3. documents / règlements
  notifyOnDocumentPublished,
  notifyOnReglementUpdated,

  // 4. groupes
  notifyOnChildAssignedToGroup,
  notifyOnEducatorAssignedToGroup,

  // 5. PEI
  notifyOnPEICreated,
  notifyOnPEIUpdated,
  notifyOnPEIClosed,

  // 6. évaluations
  notifyOnEvaluationAdded,

  // 7. recommandations IA
  notifyOnRecommendationsReady,
  notifyOnRecommendationsApplied,

  // 8. notes / activités
  notifyOnDailyNoteAdded,
  notifyOnActivityAdded,

  // 9. messagerie
  notifyOnNewMessage,

  // 10. broadcast explicite
  notifyBroadcastToRole,
  notifyBroadcastToAll,
};
