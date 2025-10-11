"use strict";
const Joi = require("joi");

exports.createGroupeSchema = Joi.object({
  annee_id: Joi.number().integer().positive().required(),
  nom: Joi.string().max(120).trim().required(),
  description: Joi.string().allow("", null),
  statut: Joi.string().valid("actif", "archive").default("actif"),
});

exports.updateGroupeSchema = Joi.object({
  nom: Joi.string().max(120).trim().optional(),
  description: Joi.string().allow("", null).optional(),
  statut: Joi.string().valid("actif", "archive").optional(),
}).min(1);

exports.inscrireEnfantsSchema = Joi.object({
  // normalize to enfants[] consistently
  enfants: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

exports.affecterEducateurSchema = Joi.object({
  educateur_id: Joi.number().integer().positive().required(),
});
