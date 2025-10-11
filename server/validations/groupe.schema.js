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
  // Allow both { enfants: [] } and { enfant_ids: [] } from client
  enfants: Joi.array().items(Joi.number().integer().positive()).min(1),
  enfant_ids: Joi.array().items(Joi.number().integer().positive()).min(1),
})
  .custom((value, helpers) => {
    const source = value.enfants ?? value.enfant_ids;
    if (!source || source.length === 0) {
      return helpers.error("any.required", { label: "enfants" });
    }
    return { enfants: source };
  })
  .messages({
    "any.required": "Veuillez fournir au moins un enfant.",
  });

exports.affecterEducateurSchema = Joi.object({
  educateur_id: Joi.number().integer().positive().required(),
});

exports.listCandidatsEnfantsQuerySchema = Joi.object({
  search: Joi.string().trim().max(120).allow("", null),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  scope: Joi.string().valid("available", "assigned").default("available"),
  excludeGroupeId: Joi.number().integer().positive().optional(),
}).prefs({ stripUnknown: true });

exports.listCandidatsEducateursQuerySchema = Joi.object({
  search: Joi.string().trim().max(120).allow("", null),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
}).prefs({ stripUnknown: true });
