const Joi = require("joi");

exports.chatbotQuerySchema = Joi.object({
  message: Joi.string().trim().min(1).required(),
});
