const Joi = require("joi");

exports.createEnfantSchema = Joi.object({
  nom: Joi.string().max(100).required(),
  prenom: Joi.string().max(100).required(),
  date_naissance: Joi.date().iso().required(),
  parent_user_id: Joi.number().integer().positive().required(),
});

exports.updateEnfantSchema = Joi.object({
  nom: Joi.string().max(100),
  prenom: Joi.string().max(100),
  date_naissance: Joi.date().iso(),
  parent_user_id: Joi.number().integer().positive(),
}).min(1);
