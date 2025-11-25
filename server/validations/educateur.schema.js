const Joi = require("joi");

exports.paginationQuerySchema = Joi.object({
  search: Joi.string().trim().allow("", null),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  groupeId: Joi.number().integer().positive(),
});

exports.childIdParamSchema = Joi.object({
  enfantId: Joi.number().integer().positive().required(),
});

exports.peiIdParamSchema = Joi.object({
  peiId: Joi.number().integer().positive().required(),
});

exports.observationIdParamSchema = Joi.object({
  obsId: Joi.number().integer().positive().required(),
});
