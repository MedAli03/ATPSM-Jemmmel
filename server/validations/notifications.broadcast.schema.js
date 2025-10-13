"use strict";
const Joi = require("joi");

const ROLES = ["PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT"];

const broadcastSchema = Joi.object({
  target: Joi.string()
    .valid("ALL", ...ROLES)
    .required(),
  type: Joi.string().max(50).required(),
  titre: Joi.string().max(150).required(),
  corps: Joi.string().allow("", null).max(500).optional(),
  icon: Joi.string().max(50).allow(null, "").optional(),
  action_url: Joi.string().uri().allow(null, "").optional(),
  data: Joi.object().unknown(true).optional(),
});

module.exports = { broadcastSchema };
