"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const ctrl = require("../controllers/directeur_dashboard.controller");

// Toutes ces routes nécessitent un token & rôle DIRECTEUR (et on autorise PRESIDENT en lecture si tu veux)
router.use(auth);
router.use(requireRole("DIRECTEUR", "PRESIDENT"));

// Overview (cards + charts + lists)
router.get("/dashboard/directeur/overview", ctrl.overview);

// Counters et résumés
router.get("/dashboard/directeur/counters", ctrl.counters);
router.get("/dashboard/directeur/groups/summary", ctrl.groupsSummary);

// Graphs
router.get("/dashboard/directeur/pei-stats", ctrl.peiStats);
router.get("/dashboard/directeur/activities/weekly", ctrl.activitiesWeekly);
router.get(
  "/dashboard/directeur/evaluations/distribution",
  ctrl.evaluationsDistribution
);

// Lists
router.get("/dashboard/directeur/actualites/latest", ctrl.latestActualites);
router.get("/dashboard/directeur/events/upcoming", ctrl.upcomingEvents);
router.get("/dashboard/directeur/recent", ctrl.recent);

module.exports = router;
