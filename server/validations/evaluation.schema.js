const Joi = require("joi");

exports.createEvaluationSchema = Joi.object({
  date_evaluation: Joi.date().iso().required(),
  score: Joi.number().integer().min(0).max(100).required(),
  grille: Joi.any(), // JSON libre (object/array)
  notes: Joi.string().allow("", null),
});

exports.listEvaluationsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});
