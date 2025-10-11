"use strict";

const Joi = require("joi");

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listQuerySchema = Joi.object({
  search: Joi.string().allow("", null).max(200).optional(),
  q: Joi.string().allow("", null).max(200).optional(),
  status: Joi.string().valid("all", "draft", "published", "scheduled").optional(),
  statut: Joi.string().valid("all", "draft", "published", "scheduled").optional(),
  pinned: Joi.boolean().truthy(1).truthy("1").truthy("true").falsy(0).falsy("0").falsy("false").optional(),
  pinnedOnly: Joi.boolean().truthy(1).truthy("1").truthy("true").falsy(0).falsy("0").falsy("false").optional(),
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  date_debut: Joi.date().iso().optional(),
  date_fin: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const tagsSchema = Joi.alternatives()
  .try(
    Joi.array().items(Joi.string().max(50)).default([]),
    Joi.string().allow("", null).custom((value, helpers) => {
      if (!value) return [];
      if (typeof value !== "string") return helpers.error("string.base");
      return value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    })
  )
  .default([]);

const DATA_URI_REGEX = /^data:image\/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+$/;

const mediaUriSchema = (options = {}) => {
  const allowNull = options.allowNull ?? false;
  let schema = Joi.string().trim();
  if (allowNull) {
    schema = schema.allow(null);
  }
  schema = schema.allow("");
  return schema.custom((value, helpers) => {
    if (value === null || value === "") {
      return value;
    }
    if (typeof value !== "string") {
      return helpers.error("string.base");
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return allowNull ? null : "";
    }
    if (DATA_URI_REGEX.test(trimmed)) {
      return trimmed;
    }
    try {
      // Allow absolute and relative URLs
      new URL(trimmed, "http://placeholder.local");
      return trimmed;
    } catch (_err) {
      return helpers.error("string.uri");
    }
  }, "media uri validation");
};

const basePayload = {
  titre: Joi.string().max(200).required(),
  resume: Joi.string().allow("", null).max(500).optional(),
  contenu_html: Joi.string().min(3).required(),
  tags: tagsSchema,
  couverture_url: mediaUriSchema({ allowNull: true }).optional(),
  galerie_urls: Joi.array().items(mediaUriSchema()).default([]),
  epingle: Joi.boolean().optional(),
  statut: Joi.string().valid("draft", "published", "scheduled").default("draft"),
  publie_le: Joi.date().iso().allow(null).optional(),
};

const createActualiteSchema = Joi.object(basePayload);

const updateActualiteSchema = Joi.object({
  ...basePayload,
}).fork(["titre", "contenu_html"], (schema) => schema.optional());

const updateStatusSchema = Joi.object({
  statut: Joi.string().valid("draft", "published", "scheduled").required(),
  publie_le: Joi.when("statut", {
    is: "scheduled",
    then: Joi.date().iso().required(),
    otherwise: Joi.date().iso().allow(null).optional(),
  }),
});

const updatePinSchema = Joi.object({
  epingle: Joi.boolean().truthy(1).truthy("1").truthy("true").falsy(0).falsy("0").falsy("false").required(),
});

module.exports = {
  idParamSchema,
  listQuerySchema,
  createActualiteSchema,
  updateActualiteSchema,
  updateStatusSchema,
  updatePinSchema,
};
