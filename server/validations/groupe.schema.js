const Joi = require("joi");

exports.createGroupeSchema = Joi.object({
  annee_id: Joi.number().integer().positive().required(),
  nom: Joi.string().max(120).required(),
  description: Joi.string().allow("", null),
  statut: Joi.string().valid("actif", "archive").default("actif"),
});

exports.inscrireEnfantsSchema = Joi.object({
  enfant_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required(),
});

exports.affecterEducateurSchema = Joi.object({
  educateur_id: Joi.number().integer().positive().required(),
});
