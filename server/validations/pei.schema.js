const Joi = require("joi");

exports.createPeiSchema = Joi.object({
  enfant_id: Joi.number().integer().positive().required(),
  educateur_id: Joi.number().integer().positive().required(),
  annee_id: Joi.number().integer().positive().required(),
  date_creation: Joi.date().iso().required(),
  objectifs: Joi.string().allow("", null),
  statut: Joi.string().valid("brouillon", "actif", "clos").default("brouillon"),
  precedent_projet_id: Joi.number().integer().positive().allow(null),
});

exports.updatePeiSchema = Joi.object({
  objectifs: Joi.string().allow("", null),
  statut: Joi.string().valid("brouillon", "actif", "clos"),
}).min(1);

exports.listPeiQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  enfant_id: Joi.number().integer().positive(),
  educateur_id: Joi.number().integer().positive(),
  annee_id: Joi.number().integer().positive(),
  statut: Joi.string().valid("brouillon", "actif", "clos"),
});
