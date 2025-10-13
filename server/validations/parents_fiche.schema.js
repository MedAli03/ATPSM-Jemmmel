"use strict";

const Joi = require("joi");

const enfantIdParamSchema = Joi.object({
  enfantId: Joi.number().integer().positive().required(),
});

const phoneRegex = /^[0-9+()\-\s]{7,20}$/;

const CONTACT_FIELDS = [
  "pere_tel_portable",
  "pere_tel_travail",
  "pere_tel_domicile",
  "pere_email",
  "mere_tel_portable",
  "mere_tel_travail",
  "mere_tel_domicile",
  "mere_email",
];

const phoneField = Joi.string()
  .trim()
  .pattern(phoneRegex)
  .max(50)
  .allow("", null)
  .messages({
    "string.pattern.base": "رقم هاتف غير صالح",
  });

const makeRequiredPhoneField = (missingMessage) =>
  Joi.string()
    .trim()
    .pattern(phoneRegex)
    .max(50)
    .required()
    .messages({
      "string.empty": missingMessage,
      "any.required": missingMessage,
      "string.pattern.base": "رقم هاتف غير صالح",
    });

const emailField = Joi.string().trim().email().max(150).allow("", null);

const normalizeEmptyToNull = (value) => {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  return value;
};

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
  pere_tel_domicile: phoneField,
  pere_tel_travail: phoneField,
  pere_tel_portable: makeRequiredPhoneField("هاتف الأب (جوال) مطلوب"),
  pere_email: emailField,

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
  mere_tel_domicile: phoneField,
  mere_tel_travail: phoneField,
  mere_tel_portable: makeRequiredPhoneField("هاتف الأم (جوال) مطلوب"),
  mere_email: emailField,
})
  .custom((value, helpers) => {
    const normalized = {};
    for (const [key, raw] of Object.entries(value)) {
      normalized[key] = normalizeEmptyToNull(raw);
    }

    for (const field of CONTACT_FIELDS) {
      if (!(field in normalized)) {
        normalized[field] = null;
      }
    }

    const hasContact = CONTACT_FIELDS.some((field) => {
      const v = normalized[field];
      if (typeof v === "string") {
        return v.trim().length > 0;
      }
      return Boolean(v);
    });

    if (!hasContact) {
      return helpers.error("any.custom", {
        message: "يجب توفير وسيلة اتصال واحدة على الأقل (هاتف أو بريد) لأحد الوالدين",
      });
    }

    return normalized;
  })
  .min(1)
  .messages({
    "any.custom":
      "يجب توفير وسيلة اتصال واحدة على الأقل (هاتف أو بريد) لأحد الوالدين",
  })
  .prefs({ stripUnknown: true, convert: true }); // au moins un champ pour un upsert

module.exports = {
  enfantIdParamSchema,
  upsertParentsFicheSchema,
};
