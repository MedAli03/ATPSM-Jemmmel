const { ChatbotMessage } = require("../models");

const DEFAULT_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama2";
const DEFAULT_TEMPERATURE = Number(process.env.CHATBOT_TEMPERATURE ?? 0.7);
const DEFAULT_MAX_TOKENS = Number(process.env.CHATBOT_MAX_TOKENS ?? 512);
const DEFAULT_TIMEOUT_MS = Number(process.env.CHATBOT_TIMEOUT_MS ?? 15000);

const SYSTEM_PROMPT =
  "You are an educational assistant chatbot supporting educators working with autistic children. You DO NOT give diagnosis or medical instructions. You provide educational strategies, communication tips, and activity ideas only.";

const cleanBaseUrl = (url) => url.replace(/\/$/, "");

const buildPayload = (userMessage) => ({
  model: DEFAULT_MODEL,
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ],
  stream: false,
  options: {
    temperature: Number.isFinite(DEFAULT_TEMPERATURE)
      ? DEFAULT_TEMPERATURE
      : 0.7,
    num_predict: Number.isFinite(DEFAULT_MAX_TOKENS) ? DEFAULT_MAX_TOKENS : 512,
  },
});

const buildMetadata = (user) => ({
  timestamp: new Date().toISOString(),
  userId: user?.id,
  role: user?.role,
});

const persistHistory = async ({ userId, role, message, reply, model }) => {
  if (!ChatbotMessage || !userId) return null;
  try {
    const row = await ChatbotMessage.create({
      utilisateur_id: userId,
      role: role || null,
      message,
      reply,
      model,
    });
    return row;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[chatbot] failed to persist history", err.message);
    return null;
  }
};

const toServiceUnavailable = (
  message = "Chatbot service temporarily unavailable."
) => {
  const err = new Error(message);
  err.status = 503;
  err.code = "CHATBOT_UNAVAILABLE";
  return err;
};

exports.query = async (message, user = {}) => {
  const safeMessage = typeof message === "string" ? message.trim() : "";
  if (!safeMessage) {
    const e = new Error("Message de la requête manquant");
    e.status = 400;
    throw e;
  }

  const payload = buildPayload(safeMessage);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${cleanBaseUrl(DEFAULT_BASE_URL)}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError")
      throw toServiceUnavailable("Chatbot service temporarily unavailable (timeout).");
    throw toServiceUnavailable();
  }

  clearTimeout(timer);

  if (!response.ok) {
    throw toServiceUnavailable();
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw toServiceUnavailable();
  }

  const reply = data?.message?.content || data?.response || data?.output;
  if (!reply || typeof reply !== "string") {
    throw toServiceUnavailable();
  }

  const metadata = buildMetadata(user);
  const model = data?.model || DEFAULT_MODEL;

  // Metadata-only logging for privacy (no content stored)
  console.info("[chatbot] query", {
    userId: metadata.userId,
    role: metadata.role,
    timestamp: metadata.timestamp,
    messageLength: safeMessage.length,
  });

  const sanitizedReply = reply.trim();

  persistHistory({
    userId: metadata.userId,
    role: metadata.role,
    message: safeMessage,
    reply: sanitizedReply,
    model,
  });

  return { reply: sanitizedReply, model, metadata };
};

exports.getHistoryForUser = async (user) => {
  if (!user?.id) {
    const e = new Error("Utilisateur requis pour l'historique");
    e.status = 401;
    throw e;
  }

  const rows = await ChatbotMessage.findAll({
    where: { utilisateur_id: user.id },
    order: [["created_at", "ASC"]],
    limit: 50,
  });

  if (!rows || rows.length === 0) return [];

  return rows.map((row) => ({
    id: row.id,
    message: row.message,
    reply: row.reply,
    model: row.model,
    createdAt: row.created_at,
  }));
};
