"use strict";

const Joi = require("joi");

// Query: common filters/pagination for dashboard
const commonQuery = {
  anneeId: Joi.number().integer().positive().optional(),
};

const overviewQuerySchema = Joi.object({
  ...commonQuery,
  weeks: Joi.number().integer().min(1).max(26).default(8),
  bins: Joi.number().integer().min(3).max(20).default(10),
  limit: Joi.number().integer().min(1).max(50).default(8),
});

const peiStatsQuerySchema = Joi.object(commonQuery);

const weeklyActivitiesQuerySchema = Joi.object({
  ...commonQuery,
  weeks: Joi.number().integer().min(1).max(26).default(8),
});

const evalDistributionQuerySchema = Joi.object({
  ...commonQuery,
  bins: Joi.number().integer().min(3).max(20).default(10),
});

const latestListQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(8),
});

const groupsSummaryQuerySchema = Joi.object(commonQuery);

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

// Broadcast body
const broadcastBodySchema = Joi.object({
  role: Joi.string().valid("ALL", "PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT").default("ALL"),
  type: Joi.string().max(50).required(),
  titre: Joi.string().max(200).required(),
  corps: Joi.string().max(2000).required(),
});

module.exports = {
  overviewQuerySchema,
  peiStatsQuerySchema,
  weeklyActivitiesQuerySchema,
  evalDistributionQuerySchema,
  latestListQuerySchema,
  groupsSummaryQuerySchema,
  idParamSchema,
  broadcastBodySchema,
};
