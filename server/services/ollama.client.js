"use strict";

const DEFAULT_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL_NAME || "llama2";

const normalizeBaseUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) return "http://localhost:11434";
  return url.replace(/\/$/, "");
};

const buildOllamaError = (message, status, cause) => {
  const err = new Error(message);
  if (status) err.status = status;
  if (cause) err.cause = cause;
  return err;
};

/**
 * Send a single prompt to the configured Ollama instance and return the assistant text.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
exports.generateChatCompletion = async (prompt) => {
  const safePrompt = typeof prompt === "string" ? prompt.trim() : "";
  if (!safePrompt) {
    throw buildOllamaError("Prompt manquant pour Ollama", 400);
  }

  const baseUrl = normalizeBaseUrl(DEFAULT_BASE_URL);
  const model = DEFAULT_MODEL;
  const url = `${baseUrl}/api/generate`;

  const body = {
    model,
    prompt: safePrompt,
    stream: false,
  };

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw buildOllamaError("Ollama unreachable", 503, err);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (err) {
    // ignore JSON parse errors for error handling below
  }

  if (!response.ok) {
    const reason = payload?.error || payload?.message || response.statusText;
    throw buildOllamaError(
      `Ollama request failed (${response.status})${reason ? `: ${reason}` : ""}`,
      response.status || 502
    );
  }

  const text = payload?.response ?? payload?.message ?? null;
  if (typeof text !== "string" || !text.length) {
    throw buildOllamaError("Réponse Ollama invalide", 502);
  }

  return text;
};
