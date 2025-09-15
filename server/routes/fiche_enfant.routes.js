"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const ctrl = require("../controllers/fiche_enfant.controller");

// All fiche_enfant routes require auth
router.use(auth);

// GET fiche enfant
// GET /enfants/:enfantId/fiche
router.get(
  "/enfants/:enfantId/fiche",
  requireRole("PRESIDENT", "DIRECTEUR"),
  ctrl.get
);

// UPSERT fiche enfant
// PUT /enfants/:enfantId/fiche
router.put(
  "/enfants/:enfantId/fiche",
  requireRole("PRESIDENT", "DIRECTEUR"),
  ctrl.upsert
);

module.exports = router;
