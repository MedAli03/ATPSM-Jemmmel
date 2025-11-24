"use strict";

const DEFAULT_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama2";
const DEFAULT_TEMPERATURE = Number(process.env.CHATBOT_TEMPERATURE || 0.7);
const DEFAULT_MAX_TOKENS = Number(process.env.CHATBOT_MAX_TOKENS || 512);
const REQUEST_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 20000);

const buildPayload = ({ systemPrompt, userPrompt, model }) => ({
  model: model || DEFAULT_MODEL,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
  stream: false,
  options: {
    temperature: DEFAULT_TEMPERATURE,
    num_predict: DEFAULT_MAX_TOKENS,
  },
});

async function chat({ systemPrompt, userPrompt, model }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${DEFAULT_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload({ systemPrompt, userPrompt, model })),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = new Error("Chatbot service temporarily unavailable");
      err.status = 503;
      throw err;
    }

    const data = await response.json();
    const text = data?.message?.content || data?.response || data?.message;

    if (!text) {
      const err = new Error("Réponse du chatbot invalide");
      err.status = 502;
      throw err;
    }

    return { text, model: data?.model || DEFAULT_MODEL, raw: data };
  } catch (error) {
    if (error.name === "AbortError") {
      const err = new Error("Chatbot service timeout");
      err.status = 503;
      throw err;
    }
    if (error.status) throw error;
    const err = new Error("Chatbot service temporarily unavailable");
    err.status = 503;
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  chat,
};
