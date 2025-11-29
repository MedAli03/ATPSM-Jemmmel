"use strict";

const { generateChatCompletion } = require("./ollama.client");

/**
 * High-level wrapper for chatbot calls. Controllers can catch errors and map them to HTTP.
 * @param {string} fullPrompt
 * @returns {Promise<string>}
 */
exports.askChatbot = async (fullPrompt) => {
  try {
    return await generateChatCompletion(fullPrompt);
  } catch (err) {
    // Bubble up with a consistent status if not provided
    if (!err.status) {
      err.status = 503;
    }
    throw err;
  }
};
