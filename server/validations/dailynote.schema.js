const Joi = require("joi");

exports.createDailyNoteSchema = Joi.object({
  date_note: Joi.date().iso().required(),
  contenu: Joi.string().allow("", null),
  type: Joi.string().max(50).allow("", null),
  pieces_jointes: Joi.string().allow("", null), // URL(s) ou JSON string
  enfant_id: Joi.number().integer().positive().required(), // cohérent avec le PEI
});

exports.updateDailyNoteSchema = Joi.object({
  date_note: Joi.date().iso(),
  contenu: Joi.string().allow("", null),
  type: Joi.string().max(50).allow("", null),
  pieces_jointes: Joi.string().allow("", null),
}).min(1);

exports.listDailyNotesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
});
