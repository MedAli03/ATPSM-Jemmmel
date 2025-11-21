"use strict";

const Joi = require("joi");

const libelleRegex = /^\d{4}-\d{4}$/; // ex: 2025-2026
const statutEnum = Joi.string().valid("PLANIFIEE", "ACTIVE", "ARCHIVEE");

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listQuerySchema = Joi.object({
  libelle: Joi.string().min(4).max(20).optional(),
  statut: statutEnum.optional(),
});

const createAnneeSchema = Joi.object({
  libelle: Joi.string().pattern(libelleRegex).required().messages({
    "string.pattern.base": "libelle doit être au format YYYY-YYYY",
    "string.empty": "libelle est requis",
  }),
  date_debut: Joi.date().iso().required(),
  date_fin: Joi.date().iso().required(),
  est_active: Joi.boolean().optional(), // ignoré à la création (activation via endpoint dédié)
}).custom((value, helpers) => {
  if (new Date(value.date_debut) >= new Date(value.date_fin)) {
    return helpers.error("any.invalid", {
      message: "date_debut doit être < date_fin",
    });
  }
  return value;
});

const updateAnneeSchema = Joi.object({
  libelle: Joi.string()
    .pattern(libelleRegex)
    .optional()
    .messages({
      "string.pattern.base": "libelle doit être au format YYYY-YYYY",
    }),
  date_debut: Joi.date().iso().optional(),
  date_fin: Joi.date().iso().optional(),
  est_active: Joi.boolean().optional(), // pas d’activation via PUT
}).custom((value, helpers) => {
  if (value.date_debut && value.date_fin) {
    if (new Date(value.date_debut) >= new Date(value.date_fin)) {
      return helpers.error("any.invalid", {
        message: "date_debut doit être < date_fin",
      });
    }
  }
  return value;
});

module.exports = {
  idParamSchema,
  listQuerySchema,
  createAnneeSchema,
  updateAnneeSchema,
};
