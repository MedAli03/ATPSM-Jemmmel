const { ChatbotMessage } = require("../models");
const educatorAccess = require("./educateur_access.service");
const { buildChildContext } = require("./chatbot.context");
const { chat: ollamaChat } = require("../utils/ollamaClient");

const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama2";
const MAX_HISTORY = 50;
const DEFAULT_LANGUAGE = "ar-fr-mix";

const normalizeRole = (role) => String(role || "").toUpperCase();

const ensureMessage = (message) => {
  const trimmed = typeof message === "string" ? message.trim() : "";
  if (!trimmed) {
    const err = new Error("Message de la requête manquant");
    err.status = 400;
    throw err;
  }
  return trimmed;
};

const ensureUser = (user) => {
  if (!user?.id) {
    const err = new Error("Utilisateur requis pour le chatbot");
    err.status = 401;
    throw err;
  }
  return user;
};

const ensureChildId = (childId) => {
  const numeric = Number(childId);
  if (!Number.isInteger(numeric) || numeric <= 0) {
    const err = new Error("Identifiant d'enfant invalide");
    err.status = 400;
    throw err;
  }
  return numeric;
};

const buildSystemPrompt = () =>
  [
    "Vous êtes un assistant pour les éducateurs accompagnant des enfants autistes dans une association en Tunisie.",
    "Vous n'êtes pas médecin et ne donnez jamais de conseils médicaux ou de médication.",
    "Vous proposez uniquement des stratégies éducatives, des idées d'activités et des formulations professionnelles pour les notes ou messages.",
    "Les parents ne vous parlent pas directement : vous aidez seulement l'éducateur.",
    "Si la question touche au diagnostic médical ou à un traitement, indiquez qu'un médecin ou un spécialiste doit décider.",
    "Répondez dans un mélange de français simple et d'arabe (ar-fr-mix), sauf si l'éducateur demande explicitement une autre langue.",
  ].join(" ");

const summarizeContext = (context) => {
  if (!context) return "Contexte enfant non disponible.";

  const sections = [];
  if (context.child) {
    sections.push(
      `Enfant: ${context.child.displayName || "(sans nom)"}, âge: ${
        context.child.age ?? "?"
      }. Profil: ${context.child.profileSummary || "non spécifié"}.`
    );
  }

  if (context.pei) {
    const objectives = (context.pei.objectives || [])
      .slice(0, 5)
      .map((obj) => `- ${obj.label}${obj.progress ? ` (progression: ${obj.progress})` : ""}`)
      .join("\n");
    sections.push(
      [
        `PEI actif (${context.pei.yearLabel || context.pei.yearId || "année"}) – statut: ${
          context.pei.status || "?"
        }`,
        objectives ? `Objectifs principaux:\n${objectives}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  if (context.recentNotes?.length) {
    const notes = context.recentNotes
      .slice(0, 5)
      .map((note) => `- ${note.date}: ${note.summary?.slice(0, 140) || "note"}`)
      .join("\n");
    sections.push(`Notes récentes:\n${notes}`);
  }

  if (context.recentEvaluations?.length) {
    const evals = context.recentEvaluations
      .slice(0, 5)
      .map(
        (ev) =>
          `- ${ev.date}: ${ev.objectiveLabel || "objectif"} – score: ${
            ev.score ?? "?"
          }${ev.comment ? ` (${ev.comment.slice(0, 80)})` : ""}`
      )
      .join("\n");
    sections.push(`Évaluations récentes:\n${evals}`);
  }

  return sections.filter(Boolean).join("\n\n") || "Contexte enfant non disponible.";
};

exports.submitMessage = async ({ user, childId, message, preferredLanguage = DEFAULT_LANGUAGE }) => {
  const safeUser = ensureUser(user);
  const safeChildId = ensureChildId(childId);
  const safeMessage = ensureMessage(message);

  const normalizedRole = normalizeRole(safeUser.role);
  const context = await buildChildContext({
    educatorId: safeUser.id,
    role: normalizedRole,
    childId: safeChildId,
  });

  const systemPrompt = buildSystemPrompt();
  const userPrompt = [
    "Résumé du contexte enfant:",
    summarizeContext(context),
    "Question de l'éducateur:",
    safeMessage,
    preferredLanguage ? `Langue souhaitée: ${preferredLanguage}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const { text: answer, model } = await ollamaChat({
    systemPrompt,
    userPrompt,
    model: DEFAULT_MODEL,
  });

  console.info("[chatbot] requête ollama exécutée", {
    userId: safeUser.id,
    childId: safeChildId,
    peiId: context?.pei?.id || null,
    notes: context?.recentNotes?.length || 0,
    evaluations: context?.recentEvaluations?.length || 0,
    model,
  });

  const row = await ChatbotMessage.create({
    educator_id: safeUser.id,
    child_id: safeChildId,
    question: safeMessage,
    answer,
  });

  return {
    id: row.id,
    childId: row.child_id,
    educatorId: row.educator_id,
    question: row.question,
    answer: row.answer,
    model: model || DEFAULT_MODEL,
    preferredLanguage,
    createdAt: row.created_at || row.createdAt,
  };
};

exports.getHistoryForChild = async ({ user, childId }) => {
  const safeUser = ensureUser(user);
  const safeChildId = ensureChildId(childId);

  const normalizedRole = normalizeRole(safeUser.role);
  if (normalizedRole === "EDUCATEUR") {
    await educatorAccess.assertCanAccessChild(safeUser.id, safeChildId);
  }

  const rows = await ChatbotMessage.findAll({
    where: { educator_id: safeUser.id, child_id: safeChildId },
    order: [["created_at", "ASC"]],
    limit: MAX_HISTORY,
  });

  if (!rows || rows.length === 0) return [];

  return rows.map((row) => ({
    id: row.id,
    childId: row.child_id,
    educatorId: row.educator_id,
    question: row.question,
    answer: row.answer,
    createdAt: row.created_at,
  }));
};
