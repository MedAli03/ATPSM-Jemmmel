"use strict";
const Joi = require("joi");

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  only_unread: Joi.boolean().default(false),
  type: Joi.string().max(50).optional(),
  q: Joi.string().max(200).optional(),
});

module.exports = { idParamSchema, listQuerySchema };
