"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");

const ctrl = require("../controllers/stats.controller");
const {
  directorStatsQuerySchema,
  childrenPerGroupQuerySchema,
  monthlyInscriptionsQuerySchema,
  familySituationQuerySchema,
  nonInscritsQuerySchema,
} = require("../validations/stats.schema");

router.use(auth);
router.use(requireRole("DIRECTEUR", "PRESIDENT"));

router.get(
  "/directeur",
  validate(directorStatsQuerySchema, "query"),
  ctrl.getDirectorStats
);

router.get(
  "/enfants-par-groupe",
  validate(childrenPerGroupQuerySchema, "query"),
  ctrl.getChildrenPerGroup
);

router.get(
  "/inscriptions-mensuelles",
  validate(monthlyInscriptionsQuerySchema, "query"),
  ctrl.getMonthlyInscriptions
);

router.get(
  "/situation-familiale",
  validate(familySituationQuerySchema, "query"),
  ctrl.getFamilySituationDistribution
);

router.get(
  "/non-inscrits",
  validate(nonInscritsQuerySchema, "query"),
  ctrl.getNonInscrits
);

module.exports = router;

