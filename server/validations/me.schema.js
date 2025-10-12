const Joi = require("joi");

const trimmed = (max) => Joi.string().trim().max(max);

exports.updateProfileSchema = Joi.object({
  nom: trimmed(100).required(),
  prenom: trimmed(100).required(),
  email: Joi.string().trim().email().allow(null, "").empty(""),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+()\-\s]{7,20}$/)
    .allow(null, "")
    .empty(""),
  adresse: trimmed(250).allow(null, "").empty(""),
});

exports.updatePasswordSchema = Joi.object({
  current_password: Joi.string().min(6).required(),
  new_password: Joi.string()
    .min(8)
    .invalid(Joi.ref("current_password"))
    .required()
    .messages({
      "any.invalid": "يجب اختيار كلمة سر مختلفة",
    }),
});

exports.listSessionsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10),
});
