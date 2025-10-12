"use strict";

const Joi = require("joi");

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listQuerySchema = Joi.object({
  date_debut: Joi.date().iso().optional(),
  date_fin: Joi.date().iso().optional(),
  audience: Joi.string().valid("parents", "educateurs", "tous").optional(),
  q: Joi.string().max(200).optional(), // recherche titre/lieu
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const upcomingQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(5),
  annee_id: Joi.number().integer().positive().optional(),
});

const createEvenementSchema = Joi.object({
  document_id: Joi.number().integer().positive().allow(null).optional(),
  titre: Joi.string().max(200).required(),
  description: Joi.string().allow("", null),
  debut: Joi.date().iso().required(),
  fin: Joi.date().iso().required(),
  audience: Joi.string().valid("parents", "educateurs", "tous").default("tous"),
  lieu: Joi.string().max(200).allow("", null),
});

const updateEvenementSchema = Joi.object({
  document_id: Joi.number().integer().positive().allow(null).optional(),
  titre: Joi.string().max(200).optional(),
  description: Joi.string().allow("", null),
  debut: Joi.date().iso().optional(),
  fin: Joi.date().iso().optional(),
  audience: Joi.string().valid("parents", "educateurs", "tous").optional(),
  lieu: Joi.string().max(200).allow("", null),
}).min(1);

module.exports = {
  idParamSchema,
  listQuerySchema,
  upcomingQuerySchema,
  createEvenementSchema,
  updateEvenementSchema,
};
