const Joi = require("joi");

exports.createActiviteSchema = Joi.object({
  titre: Joi.string().max(150).required(),
  description: Joi.string().allow("", null),
  objectifs: Joi.string().allow("", null),
  type: Joi.string().valid("atelier", "jeu", "autre").default("autre"),
  date_activite: Joi.date().iso().required(),
  enfant_id: Joi.number().integer().positive().required(), // cohérent avec le PEI
});

exports.updateActiviteSchema = Joi.object({
  titre: Joi.string().max(150),
  description: Joi.string().allow("", null),
  objectifs: Joi.string().allow("", null),
  type: Joi.string().valid("atelier", "jeu", "autre"),
  date_activite: Joi.date().iso(),
}).min(1);

exports.listActivitesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});
