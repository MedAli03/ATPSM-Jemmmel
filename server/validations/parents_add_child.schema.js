"use strict";

const Joi = require("joi");

const parentIdParamSchema = Joi.object({
  parentId: Joi.number().integer().positive().required(),
});

const enfantSchema = Joi.object({
  nom: Joi.string().max(100).required(),
  prenom: Joi.string().max(100).required(),
  date_naissance: Joi.date().iso().required(),
});

const ficheEnfantSchema = Joi.object({
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
}).optional();

const createChildForParentSchema = Joi.object({
  enfant: enfantSchema.required(),
  fiche: ficheEnfantSchema, // optionnelle
});

const linkExistingChildSchema = Joi.object({
  enfant_id: Joi.number().integer().positive().required(),
});

module.exports = {
  parentIdParamSchema,
  createChildForParentSchema,
  linkExistingChildSchema,
};
