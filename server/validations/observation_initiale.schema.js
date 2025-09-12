"use strict";

const Joi = require("joi");

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listQuerySchema = Joi.object({
  enfant_id: Joi.number().integer().positive().optional(),
  educateur_id: Joi.number().integer().positive().optional(),
  date_debut: Joi.date().iso().optional(),
  date_fin: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const createObservationSchema = Joi.object({
  enfant_id: Joi.number().integer().positive().required(),
  // educateur_id is taken from JWT (req.user.id) to prevent spoofing
  date_observation: Joi.date().iso().required(),
  contenu: Joi.string().min(3).required(),
});

const updateObservationSchema = Joi.object({
  date_observation: Joi.date().iso().optional(),
  contenu: Joi.string().min(3).optional(),
});

module.exports = {
  idParamSchema,
  listQuerySchema,
  createObservationSchema,
  updateObservationSchema,
};
