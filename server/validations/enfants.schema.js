"use strict";

const Joi = require("joi");

// List / pagination
const listEnfantsQuerySchema = Joi.object({
  q: Joi.string().max(120).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Create / update
const createEnfantSchema = Joi.object({
  nom: Joi.string().max(100).required(),
  prenom: Joi.string().max(100).required(),
  date_naissance: Joi.date().iso().required(),
  parent_user_id: Joi.number().integer().positive().allow(null),

});

const updateEnfantSchema = Joi.object({
  nom: Joi.string().max(100).optional(),
  prenom: Joi.string().max(100).optional(),
  date_naissance: Joi.date().iso().optional(),
});

// Params
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// Linking
const linkParentSchema = Joi.object({
  parent_user_id: Joi.number().integer().positive().required(),
});

// Helper endpoint: create parent account from parents_fiche
const createParentAccountSchema = Joi.object({
  email: Joi.string().email().max(150).required(),
  mot_de_passe: Joi.string().min(8).max(100).required(),
});

const enfantIdParamSchema = Joi.object({
  enfantId: Joi.number().integer().positive().required(),
});

module.exports = {
  listEnfantsQuerySchema,
  createEnfantSchema,
  updateEnfantSchema,
  idParamSchema,
  linkParentSchema,
  createParentAccountSchema,
  enfantIdParamSchema,
};
