"use strict";

const Joi = require("joi");

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listQuerySchema = Joi.object({
  q: Joi.string().max(200).optional(), // recherche titre/contenu
  date_debut: Joi.date().iso().optional(), // filtre publie_le >=
  date_fin: Joi.date().iso().optional(), // filtre publie_le <=
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const createActualiteSchema = Joi.object({
  titre: Joi.string().max(200).required(),
  contenu: Joi.string().min(3).required(),
  publie_le: Joi.date().iso(),
});

const updateActualiteSchema = Joi.object({
  titre: Joi.string().max(200).optional(),
  contenu: Joi.string().min(3).optional(),
  publie_le: Joi.date().iso().optional(),
}).min(1);

module.exports = {
  idParamSchema,
  listQuerySchema,
  createActualiteSchema,
  updateActualiteSchema,
};
