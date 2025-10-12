"use strict";

const Joi = require("joi");

const anneeId = Joi.number().integer().positive();

exports.directorStatsQuerySchema = Joi.object({
  annee_id: anneeId.optional(),
});

exports.childrenPerGroupQuerySchema = Joi.object({
  annee_id: anneeId.optional(),
  limit: Joi.number().integer().positive().max(50).default(10),
});

exports.monthlyInscriptionsQuerySchema = Joi.object({
  annee_id: anneeId.optional(),
  months: Joi.number().integer().positive().max(24).default(12),
});

exports.familySituationQuerySchema = Joi.object({
  annee_id: anneeId.optional(),
});

exports.nonInscritsQuerySchema = Joi.object({
  annee_id: anneeId.required(),
  limit: Joi.number().integer().positive().max(50).default(10),
  search: Joi.string().trim().allow(""),
}).prefs({
  presence: "optional",
});

exports.createInscriptionSchema = Joi.object({
  enfant_id: Joi.number().integer().positive().required(),
  groupe_id: Joi.number().integer().positive().required(),
  annee_id: anneeId.required(),
});

