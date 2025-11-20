"use strict";

const svc = require("../services/president_dashboard.service");
const {
  overviewQuerySchema,
  peiStatsQuerySchema,
  weeklyActivitiesQuerySchema,
  evalDistributionQuerySchema,
  latestListQuerySchema,
  groupsSummaryQuerySchema,
  idParamSchema,
  broadcastBodySchema,
} = require("../validations/president_dashboard.schema");

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
      const data = await svc.overview({ ...value, currentUserId: req.user.id });
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async counters(_req, res, next) {
    try {
      // TODO: currently unused by the web dashboard; kept for modular endpoints.
      const data = await svc.counters();
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async usersSummary(_req, res, next) {
    try {
      // TODO: currently unused by the web dashboard; kept for modular endpoints.
      const data = await svc.usersSummary();
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async groupsSummary(req, res, next) {
    try {
      // TODO: currently unused by the web dashboard; kept for modular endpoints.
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

  async unreadCount(req, res, next) {
    try {
      const data = await svc.unreadCountFor(req.user.id);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  // shortcuts
  async activateYear(req, res, next) {
    try {
      const { error } = idParamSchema.validate(req.params);
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.activateYear(req.params.id);
      res.json({ ok: true, data });
    } catch (e) {
      next(e);
    }
  },

  async broadcast(req, res, next) {
    try {
      const { error, value } = broadcastBodySchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const sent = await svc.broadcast(value, req.user);
      res.status(201).json({ ok: true, sent });
    } catch (e) {
      next(e);
    }
  },
};
