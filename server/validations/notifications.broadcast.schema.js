"use strict";
const Joi = require("joi");

const ROLES = ["PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT"];

const broadcastSchema = Joi.object({
  target: Joi.string()
    .valid("ALL", ...ROLES)
    .required(),
  type: Joi.string().max(50).required(),
  titre: Joi.string().max(200).required(),
  corps: Joi.string().min(3).required(),
});

module.exports = { broadcastSchema };
