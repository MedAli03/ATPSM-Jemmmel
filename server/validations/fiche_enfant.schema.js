"use strict";

const Joi = require("joi");

const enfantIdParamSchema = Joi.object({
  enfantId: Joi.number().integer().positive().required(),
});

const upsertFicheSchema = Joi.object({
  lieu_naissance: Joi.string().max(150).allow("", null),
  diagnostic_medical: Joi.string().allow("", null),
  nb_freres: Joi.number().integer().min(0).allow(null),
  nb_soeurs: Joi.number().integer().min(0).allow(null),
  rang_enfant: Joi.number().integer().min(1).allow(null),
  situation_familiale: Joi.string()
    .valid("deux_parents", "pere_seul", "mere_seule", "autre")
    .allow(null),
  diag_auteur_nom: Joi.string().max(150).allow("", null),
  diag_auteur_description: Joi.string().allow("", null),
  carte_invalidite_numero: Joi.string().max(100).allow("", null),
  carte_invalidite_couleur: Joi.string().max(50).allow("", null),
  type_handicap: Joi.string().max(150).allow("", null),
  troubles_principaux: Joi.string().allow("", null),
}).min(1); // require at least one field to update

module.exports = {
  enfantIdParamSchema,
  upsertFicheSchema,
};
