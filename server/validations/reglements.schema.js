"use strict";

const Joi = require("joi");

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listQuerySchema = Joi.object({
  document_id: Joi.number().integer().positive().optional(),
  q: Joi.string().max(100).optional(), // recherche sur version
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const createReglementSchema = Joi.object({
  document_id: Joi.number().integer().positive().required(),
  version: Joi.string().max(30).required(),
  date_effet: Joi.date().iso().required(),
});

const updateReglementSchema = Joi.object({
  version: Joi.string().max(30).optional(),
  date_effet: Joi.date().iso().optional(),
}).min(1);

module.exports = {
  idParamSchema,
  listQuerySchema,
  createReglementSchema,
  updateReglementSchema,
};
