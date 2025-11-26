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

const childIdList = Joi.alternatives().try(
  Joi.array().items(Joi.number().integer().positive()).min(1),
  Joi.number().integer().positive()
);

exports.inscrireEnfantsSchema = Joi.object({
  // Accept both camelCase and snake_case from clients
  enfants: childIdList,
  enfant_ids: childIdList,
  enfantIds: childIdList,
})
  .custom((value, helpers) => {
    const source = value.enfantIds ?? value.enfants ?? value.enfant_ids;
    const normalized = Array.isArray(source) ? source : source != null ? [source] : [];
    if (!normalized.length) {
      return helpers.error("any.required", { label: "enfantIds" });
    }
    // Normalize to a single property consumed by the controller/service
    return { enfantIds: normalized };
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
