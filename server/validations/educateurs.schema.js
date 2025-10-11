"use strict";

const Joi = require("joi");

const listEducateursQuerySchema = Joi.object({
  search: Joi.string().trim().allow("", null).default(null),
  status: Joi.string().valid("all", "active", "archived").default("all"),
  annee_id: Joi.number().integer().positive().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const baseSchema = {
  prenom: Joi.string().trim().max(100),
  nom: Joi.string().trim().max(100),
  telephone: Joi.string().trim().max(50).allow("", null),
  email: Joi.string().trim().email().max(150),
  mot_de_passe: Joi.string().trim().min(6).max(100),
  is_active: Joi.boolean().optional(),
  avatar_url: Joi.string().uri().allow(null, ""),
};

const createEducateurSchema = Joi.object({
  ...baseSchema,
  prenom: baseSchema.prenom.required(),
  nom: baseSchema.nom.required(),
  email: baseSchema.email.required(),
  mot_de_passe: baseSchema.mot_de_passe.required(),
}).options({ stripUnknown: true });

const updateEducateurSchema = Joi.object(baseSchema)
  .min(1)
  .options({ stripUnknown: true });

module.exports = {
  listEducateursQuerySchema,
  idParamSchema,
  createEducateurSchema,
  updateEducateurSchema,
};
