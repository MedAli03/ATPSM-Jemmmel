"use strict";

const { ChatbotMessage, sequelize } = require("../models");
const { buildEducatorChatContext } = require("../services/chatbot_context.service");
const { askChatbot } = require("../services/llm.service");

const parsePositiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

exports.getChatbotMessages = async (req, res, next) => {
  try {
    const educateurId = req.user?.id;
    const enfantId = parsePositiveInt(req.params.enfantId);
    const anneeId = parsePositiveInt(req.query.anneeId);

    if (!enfantId || !anneeId) {
      return res
        .status(400)
        .json({ message: "Paramètres enfantId ou anneeId invalides" });
    }

    // Validate access; context content is not needed here
    await buildEducatorChatContext({ enfantId, educateurId, anneeId });

    const messages = await ChatbotMessage.findAll({
      where: {
        enfant_id: enfantId,
        educateur_id: educateurId,
        annee_id: anneeId,
      },
      order: [
        ["created_at", "ASC"],
        ["id", "ASC"],
      ],
    });

    res.json({ ok: true, data: messages });
  } catch (err) {
    next(err);
  }
};

exports.postChatbotMessage = async (req, res, next) => {
  const educateurId = req.user?.id;
  const enfantId = parsePositiveInt(req.params.enfantId);
  const anneeId = parsePositiveInt(req.body?.anneeId);
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!enfantId || !anneeId || !message) {
    return res.status(400).json({ message: "Paramètres manquants ou invalides" });
  }

  let context;
  try {
    context = await buildEducatorChatContext({ enfantId, educateurId, anneeId });
  } catch (err) {
    return next(err);
  }

  const fullPrompt = [
    "Tu es un assistant pédagogique qui aide l'éducateur à préparer et suivre l'accompagnement.",
    "Utilise le contexte fourni sans inventer de nouvelles informations.",
    "Si une information est absente du contexte, réponds de manière concise en le signalant.",
    "\n\nContexte:\n" + context.fullContext,
    "\n\nQuestion de l'éducateur:\n" + message,
  ].join(" ");

  try {
    const result = await sequelize.transaction(async (t) => {
      const userMessage = await ChatbotMessage.create(
        {
          enfant_id: enfantId,
          educateur_id: educateurId,
          annee_id: anneeId,
          role: "user",
          message,
        },
        { transaction: t }
      );

      let assistantText;
      try {
        assistantText = await askChatbot(fullPrompt);
      } catch (err) {
        if (!err.status) err.status = 503;
        throw err;
      }

      const assistantMessage = await ChatbotMessage.create(
        {
          enfant_id: enfantId,
          educateur_id: educateurId,
          annee_id: anneeId,
          role: "assistant",
          message: assistantText,
        },
        { transaction: t }
      );

      return { userMessage, assistantMessage };
    });

    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    if (err.status === 503) {
      return res.status(503).json({ message: "Chatbot service unavailable" });
    }
    next(err);
  }
};
