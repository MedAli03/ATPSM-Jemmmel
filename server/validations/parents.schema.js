"use strict";

const Joi = require("joi");

// Query: ?q=&is_active=&page=&limit=
const listParentsQuerySchema = Joi.object({
  q: Joi.string().max(150).allow("", null),
  is_active: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Path param
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// Create
const createParentSchema = Joi.object({
  nom: Joi.string().max(100).required(),
  prenom: Joi.string().max(100).required(),
  email: Joi.string().email().max(150).required(),
  mot_de_passe: Joi.string().min(8).max(100).required(),
  telephone: Joi.string().max(50).allow("", null),
  is_active: Joi.boolean().default(true),
  avatar_url: Joi.string().uri().max(255).allow("", null),
});

// Update (sans mot_de_passe, utiliser change-password)
const updateParentSchema = Joi.object({
  nom: Joi.string().max(100).optional(),
  prenom: Joi.string().max(100).optional(),
  email: Joi.string().email().max(150).optional(),
  telephone: Joi.string().max(50).allow("", null),
  is_active: Joi.boolean().optional(),
  avatar_url: Joi.string().uri().max(255).allow("", null),
});

// Change password
const changePasswordSchema = Joi.object({
  mot_de_passe: Joi.string().min(8).max(100).required(),
});

module.exports = {
  listParentsQuerySchema,
  idParamSchema,
  createParentSchema,
  updateParentSchema,
  changePasswordSchema,
};
