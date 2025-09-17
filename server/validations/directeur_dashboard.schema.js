"use strict";

const Joi = require("joi");

const baseFilters = {
  anneeId: Joi.number().integer().positive().optional(),
  groupeId: Joi.number().integer().positive().optional(),
  educateurId: Joi.number().integer().positive().optional(),
};

const overviewQuerySchema = Joi.object({
  ...baseFilters,
  weeks: Joi.number().integer().min(1).max(26).default(8),
  bins: Joi.number().integer().min(3).max(20).default(10),
  limit: Joi.number().integer().min(1).max(50).default(8),
});

const peiStatsQuerySchema = Joi.object(baseFilters);

const weeklyActivitiesQuerySchema = Joi.object({
  ...baseFilters,
  weeks: Joi.number().integer().min(1).max(26).default(8),
});

const evalDistributionQuerySchema = Joi.object({
  ...baseFilters,
  bins: Joi.number().integer().min(3).max(20).default(10),
});

const latestListQuerySchema = Joi.object({
  ...baseFilters,
  limit: Joi.number().integer().min(1).max(50).default(8),
});

const groupsSummaryQuerySchema = Joi.object({
  anneeId: Joi.number().integer().positive().optional(),
});

module.exports = {
  overviewQuerySchema,
  peiStatsQuerySchema,
  weeklyActivitiesQuerySchema,
  evalDistributionQuerySchema,
  latestListQuerySchema,
  groupsSummaryQuerySchema,
};
