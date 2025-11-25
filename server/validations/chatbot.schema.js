const Joi = require("joi");

exports.chatbotQuerySchema = Joi.object({
  childId: Joi.number().integer().positive().required(),
  message: Joi.string().trim().min(1).required(),
  preferredLanguage: Joi.string().trim().default("ar-fr-mix"),
});

exports.chatbotHistorySchema = Joi.object({
  childId: Joi.number().integer().positive().required(),
});
