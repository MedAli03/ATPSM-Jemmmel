const Joi = require("joi");

exports.createUserSchema = Joi.object({
  nom: Joi.string().max(100).required(),
  prenom: Joi.string().max(100).required(),
  email: Joi.string().email().max(150).required(),
  mot_de_passe: Joi.string().min(6).max(100).required(),
  telephone: Joi.string().max(50).allow("", null),
  role: Joi.string()
    .valid("PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT")
    .required(),
  is_active: Joi.boolean().default(true),
  avatar_url: Joi.string().uri().allow(null, ""),
});

exports.updateUserSchema = Joi.object({
  nom: Joi.string().max(100),
  prenom: Joi.string().max(100),
  email: Joi.string().email().max(150),
  telephone: Joi.string().max(50).allow("", null),
  role: Joi.string().valid("PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT"),
  is_active: Joi.boolean(),
  avatar_url: Joi.string().uri().allow(null, ""),
}).min(1);
