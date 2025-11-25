const { ChatbotMessage } = require("../models");
const educatorAccess = require("./educateur_access.service");
const { buildChildContext } = require("./chatbot.context");
const { chat: ollamaChat } = require("../utils/ollamaClient");
const { buildSystemPrompt, buildUserPrompt } = require("./chatbot.prompts");

const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama2";
const MAX_HISTORY = 50;
const DEFAULT_LANGUAGE = "ar-fr-mix";

const normalizeRole = (role) => String(role || "").toUpperCase();
const requiresChildAccessCheck = (role) => normalizeRole(role) !== "PRESIDENT";

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

exports.submitMessage = async ({ user, childId, message, preferredLanguage = DEFAULT_LANGUAGE }) => {
  const safeUser = ensureUser(user);
  const safeChildId = ensureChildId(childId);
  const safeMessage = ensureMessage(message);

  const normalizedRole = normalizeRole(safeUser.role);
  if (requiresChildAccessCheck(normalizedRole)) {
    await educatorAccess.assertCanAccessChild(safeUser.id, safeChildId);
  }
  const context = await buildChildContext({
    educatorId: safeUser.id,
    role: normalizedRole,
    childId: safeChildId,
  });

  const systemPrompt = buildSystemPrompt(preferredLanguage);
  const userPrompt = buildUserPrompt({
    context,
    message: safeMessage,
    preferredLanguage,
  });

  let answer;
  let model;
  try {
    const result = await ollamaChat({
      systemPrompt,
      userPrompt,
      model: DEFAULT_MODEL,
    });
    answer = result.text;
    model = result.model;
  } catch (err) {
    const error = err || new Error("Erreur du service chatbot");
    error.status = error.status || 500;
    error.message = error.message || "Impossible de générer une réponse pour le moment";
    throw error;
  }

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
    createdAt: row.created_at || row.createdAt,
  };
};

exports.getHistoryForChild = async ({ user, childId }) => {
  const safeUser = ensureUser(user);
  const safeChildId = ensureChildId(childId);

  const normalizedRole = normalizeRole(safeUser.role);
  if (requiresChildAccessCheck(normalizedRole)) {
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
