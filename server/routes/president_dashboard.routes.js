"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const ctrl = require("../controllers/president_dashboard.controller");

const allowPresidentAndDirector = requireRole("PRESIDENT", "DIRECTEUR");
const presidentOnly = requireRole("PRESIDENT");

// Toutes ces routes nécessitent un token
router.use(auth);

/**
 * READ-ONLY KPIs & lists
 */
router.get("/dashboard/president/overview", allowPresidentAndDirector, ctrl.overview);
router.get("/dashboard/president/counters", allowPresidentAndDirector, ctrl.counters);
router.get(
  "/dashboard/president/users/summary",
  allowPresidentAndDirector,
  ctrl.usersSummary
);
router.get(
  "/dashboard/president/groups/summary",
  allowPresidentAndDirector,
  ctrl.groupsSummary
);

router.get("/dashboard/president/pei-stats", allowPresidentAndDirector, ctrl.peiStats);
router.get(
  "/dashboard/president/activities/weekly",
  allowPresidentAndDirector,
  ctrl.activitiesWeekly
);
router.get(
  "/dashboard/president/evaluations/distribution",
  allowPresidentAndDirector,
  ctrl.evaluationsDistribution
);

router.get(
  "/dashboard/president/actualites/latest",
  allowPresidentAndDirector,
  ctrl.latestActualites
);
router.get(
  "/dashboard/president/events/upcoming",
  allowPresidentAndDirector,
  ctrl.upcomingEvents
);
router.get("/dashboard/president/recent", allowPresidentAndDirector, ctrl.recent);
router.get(
  "/dashboard/president/notifications/unread-count",
  allowPresidentAndDirector,
  ctrl.unreadCount
);

/**
 * SHORTCUTS (mutations)
 */
router.post(
  "/dashboard/president/annees/:id/activate",
  allowPresidentAndDirector,
  ctrl.activateYear
);
router.post(
  "/dashboard/president/notifications/broadcast",
  presidentOnly,
  ctrl.broadcast
);

module.exports = router;
