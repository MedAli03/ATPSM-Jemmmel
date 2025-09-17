"use strict";

const svc = require("../services/directeur_dashboard.service");
const {
  overviewQuerySchema,
  peiStatsQuerySchema,
  weeklyActivitiesQuerySchema,
  evalDistributionQuerySchema,
  latestListQuerySchema,
  groupsSummaryQuerySchema,
} = require("../validations/directeur_dashboard.schema");

module.exports = {
  async overview(req, res, next) {
    try {
      const { error, value } = overviewQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.overview(value);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async counters(req, res, next) {
    try {
      const { error, value } = peiStatsQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.counters(value);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async peiStats(req, res, next) {
    try {
      const { error, value } = peiStatsQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.peiStats(value);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async activitiesWeekly(req, res, next) {
    try {
      const { error, value } = weeklyActivitiesQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.activitiesWeekly(value);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async evaluationsDistribution(req, res, next) {
    try {
      const { error, value } = evalDistributionQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.evaluationsDistribution(value);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async groupsSummary(req, res, next) {
    try {
      const { error, value } = groupsSummaryQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.groupsSummary(value);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async latestActualites(req, res, next) {
    try {
      const { error, value } = latestListQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.latestActualites(value);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async upcomingEvents(req, res, next) {
    try {
      const { error, value } = latestListQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.upcomingEvents(value);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async recent(req, res, next) {
    try {
      const { error, value } = latestListQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.recent(value);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },
};
