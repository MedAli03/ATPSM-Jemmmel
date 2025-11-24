const { ChatbotMessage } = require("../models");
const educatorAccess = require("./educateur_access.service");

const PLACEHOLDER_MODEL = process.env.OLLAMA_MODEL || "llama2";
const MAX_HISTORY = 50;

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

exports.submitMessage = async ({ user, childId, message, preferredLanguage = "ar-fr-mix" }) => {
  const safeUser = ensureUser(user);
  const safeChildId = ensureChildId(childId);
  const safeMessage = ensureMessage(message);

  const normalizedRole = normalizeRole(safeUser.role);
  if (normalizedRole === "EDUCATEUR") {
    await educatorAccess.assertCanAccessChild(safeUser.id, safeChildId);
  }

  const answer = `Réponse de test (placeholder) pour le message: ${safeMessage}.`;

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
    model: PLACEHOLDER_MODEL,
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
