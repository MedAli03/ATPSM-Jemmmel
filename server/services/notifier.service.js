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

const realtime = require("../realtime");
const mapper = require("../utils/notification-mapper");

const { Op } = Sequelize;

// -------------------------------
// Low-level helpers
// -------------------------------

async function bulkSave(rows, t) {
  if (!rows || rows.length === 0) return 0;
  const created = [];
  for (const row of rows) {
    const instance = await Notification.create(
      {
        utilisateur_id: row.utilisateur_id,
        type: (row.type || "info").toLowerCase(),
        titre: row.titre || "إشعار جديد",
        corps: row.corps || null,
        icon: row.icon ?? null,
        action_url: row.action_url ?? null,
        payload: row.data ?? row.payload ?? null,
        lu_le: null,
      },
      { transaction: t }
    );
    created.push(instance.get({ plain: true }));
  }

  created.forEach((row) => {
    const dto = mapper.toDTO(row);
    if (!dto) return;
    realtime.emitNotification(dto.user_id, mapper.forClient(dto));
    realtime.adjustUnread(dto.user_id, 1);
  });

  return created.length;
}

async function toUsers(
  userIds,
  { type, titre, corps, icon = null, action_url = null, data = null },
  t
) {
  if (!userIds || userIds.length === 0) return 0;
  const rows = userIds.map((id) => ({
    utilisateur_id: id,
    type,
    titre,
    corps,
    icon,
    action_url,
    data,
  }));
  return bulkSave(rows, t);
}

async function toRoles(target, payload, t) {
  const where = { is_active: true };
  if (target !== "ALL") where.role = target;
  const users = await Utilisateur.findAll({
    where,
    attributes: ["id"],
    transaction: t,
  });
  return toUsers(users.map((u) => u.id), payload, t);
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
  return toRoles(
    "ALL",
    {
      type: "actualite",
      titre: `Nouvelle actualité : ${actualite.titre}`,
      corps: short(actualite.contenu),
      icon: "megaphone",
      action_url: actualite?.id ? `/dashboard/news/${actualite.id}` : null,
      data: { actualite_id: actualite?.id ?? null },
    },
    t
  );
}

async function notifyOnNewsUpdated(actualite, t = null) {
  return toRoles(
    "ALL",
    {
      type: "actualite",
      titre: `Mise à jour : ${actualite.titre}`,
      corps: short(actualite.contenu),
      icon: "megaphone",
      action_url: actualite?.id ? `/dashboard/news/${actualite.id}` : null,
      data: { actualite_id: actualite?.id ?? null },
    },
    t
  );
}

// -------------------------------
// 2) Événements (Events)
// -------------------------------

async function notifyOnEventCreated(evt, t = null) {
  // You can route by audience if needed
  const payload = {
    type: "evenement",
    titre: `Nouvel événement : ${evt.titre}`,
    corps: short(`${evt.description || ""} • Débute: ${new Date(evt.debut).toLocaleString()}`),
    icon: "calendar",
    action_url: evt?.id ? `/dashboard/events/${evt.id}` : null,
    data: { evenement_id: evt?.id ?? null },
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
    type: "evenement",
    titre: `Événement mis à jour : ${evt.titre}`,
    corps: short(`${evt.description || ""} • Débute: ${new Date(evt.debut).toLocaleString()}`),
    icon: "calendar",
    action_url: evt?.id ? `/dashboard/events/${evt.id}` : null,
    data: { evenement_id: evt?.id ?? null },
  };
  if (evt.audience === "parents") return toRoles("PARENT", payload, t);
  if (evt.audience === "educateurs") return toRoles("EDUCATEUR", payload, t);
  return toRoles("ALL", payload, t);
}

async function notifyOnEventDeleted(evt, t = null) {
  const payload = {
    type: "evenement",
    titre: `Événement annulé : ${evt.titre}`,
    corps: short(evt.description || "Cet événement a été annulé."),
    icon: "calendar",
    action_url: evt?.id ? `/dashboard/events/${evt.id}` : null,
    data: { evenement_id: evt?.id ?? null },
  };
  if (evt.audience === "parents") return toRoles("PARENT", payload, t);
  if (evt.audience === "educateurs") return toRoles("EDUCATEUR", payload, t);
  return toRoles("ALL", payload, t);
}

// -------------------------------
// 3) Documents / Règlements
// -------------------------------

async function notifyOnDocumentPublished(doc, t = null) {
  return toRoles(
    "ALL",
    {
      type: "document",
      titre: `Document publié : ${doc.titre}`,
      corps: short(`Disponible: ${doc.url}`),
      icon: "document",
      action_url: doc?.id ? `/dashboard/documents/${doc.id}` : null,
      data: { document_id: doc?.id ?? null },
    },
    t
  );
}

async function notifyOnReglementUpdated(reglement, t = null) {
  // broadcast to parents + educators
  const payload = {
    type: "reglement",
    titre: `Règlement mis à jour (${reglement.version})`,
    corps: short(`Date d'effet: ${reglement.date_effet}`),
    icon: "shield",
    action_url: reglement?.id ? `/dashboard/reglements/${reglement.id}` : null,
    data: { reglement_id: reglement?.id ?? null },
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
    type: "inscription",
    titre: "Inscription confirmée",
    corps: `Votre enfant a été inscrit au groupe #${groupe_id} pour l’année #${annee_id}.`,
    icon: "users",
    data: { enfant_id, groupe_id, annee_id },
  }, t);
}

async function notifyOnEducatorAssignedToGroup({ educateur_id, groupe_id, annee_id }, t = null) {
  return toUsers([educateur_id], {
    type: "affectation",
    titre: "Nouvelle affectation",
    corps: `Vous avez été affecté au groupe #${groupe_id} pour l’année #${annee_id}.`,
    icon: "user-check",
    data: { educateur_id, groupe_id, annee_id },
  }, t);
}

// -------------------------------
// 5) PEI (Projet Éducatif Individuel)
// -------------------------------

async function notifyOnPeiAwaitingValidation(pei, t = null) {
  const enfant = await Enfant.findByPk(pei.enfant_id, {
    attributes: ["prenom", "nom"],
    transaction: t,
  });
  const fullName = [enfant?.prenom, enfant?.nom].filter(Boolean).join(" ").trim();
  const childLabel = fullName || `#${pei.enfant_id}`;
  const payload = {
    type: "PEI_EN_ATTENTE_VALIDATION",
    titre: "مشروع تربوي في انتظار المصادقة",
    corps: `مشروع تربوي جديد في انتظار المصادقة للطفل ${childLabel}.`,
    icon: "clipboard-check",
    data: { enfant_id: pei.enfant_id, pei_id: pei.id, educateur_id: pei.educateur_id },
  };
  const [directeurs = 0, presidents = 0] = await Promise.all([
    toRoles("DIRECTEUR", payload, t),
    toRoles("PRESIDENT", payload, t),
  ]);
  return directeurs + presidents;
}

async function notifyOnPEICreated(pei, t = null) {
  // parent + éducateur
  const parentIds = await parentOfChild(pei.enfant_id, t);
  const eduIds = pei.educateur_id ? [pei.educateur_id] : [];
  const a = parentIds.length
    ? await toUsers(parentIds, {
        type: "pei",
        titre: "Nouveau PEI créé",
        corps: "Un nouveau projet éducatif a été créé pour votre enfant.",
        icon: "sparkles",
        data: { enfant_id: pei.enfant_id, pei_id: pei.id },
      }, t)
    : 0;
  const b = eduIds.length
    ? await toUsers(eduIds, {
        type: "pei",
        titre: "PEI créé",
        corps: `Un PEI vient d’être créé pour l’enfant #${pei.enfant_id}.`,
        icon: "sparkles",
        data: { enfant_id: pei.enfant_id, pei_id: pei.id },
      }, t)
    : 0;
  return a + b;
}

async function notifyOnPEIUpdated(pei, t = null) {
  // parent
  const parentIds = await parentOfChild(pei.enfant_id, t);
  if (!parentIds.length) return 0;
  return toUsers(parentIds, {
    type: "pei",
    titre: "PEI mis à jour",
    corps: "Le projet éducatif de votre enfant a été mis à jour.",
    icon: "sparkles",
    data: { enfant_id: pei.enfant_id, pei_id: pei.id },
  }, t);
}

async function notifyOnPEIClosed(pei, t = null) {
  const parentIds = await parentOfChild(pei.enfant_id, t);
  if (!parentIds.length) return 0;
  return toUsers(parentIds, {
    type: "pei",
    titre: "PEI clôturé",
    corps: "Le projet éducatif de votre enfant a été clôturé.",
    icon: "sparkles",
    data: { enfant_id: pei.enfant_id, pei_id: pei.id },
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
    type: "evaluation",
    titre: "Nouvelle évaluation",
    corps: "Une nouvelle évaluation a été ajoutée au PEI de votre enfant.",
    icon: "chart",
    data: { enfant_id: enfantId, evaluation_id: evaluation.id },
  }, t);
}

// -------------------------------
// 7) Daily Notes / Activités
// -------------------------------

async function notifyOnDailyNoteAdded(note, t = null) {
  const parentIds = await parentOfChild(note.enfant_id, t);
  if (!parentIds.length) return 0;
  return toUsers(parentIds, {
    type: "note",
    titre: "Nouvelle note quotidienne",
    corps: short(note.contenu || "Une nouvelle note a été ajoutée."),
    icon: "book",
    data: { enfant_id: note.enfant_id, note_id: note.id },
  }, t);
}

async function notifyOnActivityAdded(activity, t = null) {
  const parentIds = await parentOfChild(activity.enfant_id, t);
  if (!parentIds.length) return 0;
  return toUsers(parentIds, {
    type: "activite",
    titre: `Nouvelle activité : ${activity.titre || "Activité"}`,
    corps: short(activity.description || "Une nouvelle activité a été ajoutée."),
    icon: "star",
    data: { enfant_id: activity.enfant_id, activite_id: activity.id },
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
    type: "message",
    titre: "Nouveau message",
    corps: short(texte || "Vous avez reçu un nouveau message."),
    icon: "message",
    data: { thread_id, expediteur_id, message_preview: texte },
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
  notifyOnPeiAwaitingValidation,
  notifyOnPEICreated,
  notifyOnPEIUpdated,
  notifyOnPEIClosed,

  // 6. évaluations
  notifyOnEvaluationAdded,

  // 7. notes / activités
  notifyOnDailyNoteAdded,
  notifyOnActivityAdded,

  // 8. messagerie
  notifyOnNewMessage,

  // 9. broadcast explicite
  notifyBroadcastToRole,
  notifyBroadcastToAll,
};
