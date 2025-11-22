"use strict";

const Joi = require("joi");

// List / pagination
const searchField = Joi.alternatives()
  .try(
    Joi.string(),
    Joi.number(),
    Joi.array().items(Joi.string().allow("", null), Joi.number()).single()
  )
  .allow("", null)
  .optional();

const extractTerm = (input) => {
  if (Array.isArray(input)) {
    for (const entry of input) {
      const picked = extractTerm(entry);
      if (picked) return picked;
    }
    return null;
  }
  if (input === undefined || input === null) {
    return null;
  }
  const str = String(input).trim();
  return str.length ? str : null;
};

const listEnfantsQuerySchema = Joi.object({
  q: searchField,
  search: searchField,
  parent_user_id: Joi.alternatives()
    .try(Joi.number().integer().positive(), Joi.valid(null, "null"))
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
})
  .custom((value) => {
    const normalized = { ...value };
    const normalizedTerm = extractTerm(normalized.q) ?? extractTerm(normalized.search);
    if (normalizedTerm) {
      normalized.q = normalizedTerm;
    } else {
      delete normalized.q;
    }

    delete normalized.search;

    // Normalize parent_user_id: accept "null" or null as a sentinel for
    // "children without parent accounts".
    if (normalized.parent_user_id === "null") {
      normalized.parent_user_id = null;
    }

    return normalized;
  })
  .prefs({ stripUnknown: true, convert: true, allowUnknown: true });

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
