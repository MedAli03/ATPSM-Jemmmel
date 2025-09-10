const Joi = require("joi");

// Mettre à jour les items (accepter/rejeter/éditer)
exports.updateRecoItemsSchema = Joi.object({
  objectifs: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
        accepte: Joi.boolean().required(),
        texte: Joi.string().allow("", null),
      })
    )
    .default([]),
  activites: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().integer().positive().required(),
        accepte: Joi.boolean().required(),
        description: Joi.string().allow("", null),
        objectifs: Joi.string().allow("", null),
      })
    )
    .default([]),
});
