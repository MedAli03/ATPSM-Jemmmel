"use strict";

const Joi = require("joi");

const enfantIdParamSchema = Joi.object({
  enfantId: Joi.number().integer().positive().required(),
});

const upsertParentsFicheSchema = Joi.object({
  // Père
  pere_nom: Joi.string().max(100).allow("", null),
  pere_prenom: Joi.string().max(100).allow("", null),
  pere_naissance_date: Joi.date().iso().allow(null),
  pere_naissance_lieu: Joi.string().max(150).allow("", null),
  pere_origine: Joi.string().max(150).allow("", null),
  pere_cin_numero: Joi.string().max(100).allow("", null),
  pere_cin_delivree_a: Joi.string().max(150).allow("", null),
  pere_adresse: Joi.string().max(255).allow("", null),
  pere_profession: Joi.string().max(150).allow("", null),
  pere_couverture_sociale: Joi.string().max(150).allow("", null),
  pere_tel_domicile: Joi.string().max(50).allow("", null),
  pere_tel_travail: Joi.string().max(50).allow("", null),
  pere_tel_portable: Joi.string().max(50).allow("", null),

  // Mère
  mere_nom: Joi.string().max(100).allow("", null),
  mere_prenom: Joi.string().max(100).allow("", null),
  mere_naissance_date: Joi.date().iso().allow(null),
  mere_naissance_lieu: Joi.string().max(150).allow("", null),
  mere_origine: Joi.string().max(150).allow("", null),
  mere_cin_numero: Joi.string().max(100).allow("", null),
  mere_cin_delivree_a: Joi.string().max(150).allow("", null),
  mere_adresse: Joi.string().max(255).allow("", null),
  mere_profession: Joi.string().max(150).allow("", null),
  mere_couverture_sociale: Joi.string().max(150).allow("", null),
  mere_tel_domicile: Joi.string().max(50).allow("", null),
  mere_tel_travail: Joi.string().max(50).allow("", null),
  mere_tel_portable: Joi.string().max(50).allow("", null),
}).min(1); // au moins un champ pour un upsert

module.exports = {
  enfantIdParamSchema,
  upsertParentsFicheSchema,
};
