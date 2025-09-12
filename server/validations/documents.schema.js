"use strict";

const Joi = require("joi");

const TYPES = ["reglement", "autre"];
const STATUTS = ["brouillon", "publie"];

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listQuerySchema = Joi.object({
  type: Joi.string()
    .valid(...TYPES)
    .optional(),
  statut: Joi.string()
    .valid(...STATUTS)
    .optional(),
  q: Joi.string().max(200).optional(), // recherche sur titre/url
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const createDocumentSchema = Joi.object({
  type: Joi.string()
    .valid(...TYPES)
    .required(),
  titre: Joi.string().max(200).required(),
  url: Joi.string().uri().max(255).required(),
  statut: Joi.string()
    .valid(...STATUTS)
    .default("brouillon"),
  // admin_id vient du JWT -> pas dans le body
});

const updateDocumentSchema = Joi.object({
  type: Joi.string()
    .valid(...TYPES)
    .optional(),
  titre: Joi.string().max(200).optional(),
  url: Joi.string().uri().max(255).optional(),
  statut: Joi.string()
    .valid(...STATUTS)
    .optional(),
}).min(1);

module.exports = {
  idParamSchema,
  listQuerySchema,
  createDocumentSchema,
  updateDocumentSchema,
};
