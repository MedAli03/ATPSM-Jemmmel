// Placeholder chatbot service (Ollama integration to be added later)
exports.query = async (message) => {
  const safeMessage = typeof message === "string" ? message.trim() : "";
  if (!safeMessage) {
    const e = new Error("Message de la requête manquant");
    e.status = 400;
    throw e;
  }

  return "Chatbot response placeholder (Ollama integration later).";
};
