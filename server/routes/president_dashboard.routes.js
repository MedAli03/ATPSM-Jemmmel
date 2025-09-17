"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const ctrl = require("../controllers/president_dashboard.controller");

// Toutes ces routes nécessitent un token & PRESIDENT
router.use(auth);
router.use(requireRole("PRESIDENT", "DIRECTEUR")); // <= on autorise aussi le DIRECTEUR en lecture

/**
 * READ-ONLY KPIs & lists
 */
router.get("/dashboard/president/overview", ctrl.overview);
router.get("/dashboard/president/counters", ctrl.counters);
router.get("/dashboard/president/users/summary", ctrl.usersSummary);
router.get("/dashboard/president/groups/summary", ctrl.groupsSummary);

router.get("/dashboard/president/pei-stats", ctrl.peiStats);
router.get("/dashboard/president/activities/weekly", ctrl.activitiesWeekly);
router.get(
  "/dashboard/president/evaluations/distribution",
  ctrl.evaluationsDistribution
);

router.get("/dashboard/president/actualites/latest", ctrl.latestActualites);
router.get("/dashboard/president/events/upcoming", ctrl.upcomingEvents);
router.get("/dashboard/president/recent", ctrl.recent);
router.get("/dashboard/president/notifications/unread-count", ctrl.unreadCount);

/**
 * SHORTCUTS (mutations)
 */
router.post("/dashboard/president/annees/:id/activate", ctrl.activateYear);
router.post("/dashboard/president/notifications/broadcast", ctrl.broadcast);

module.exports = router;
