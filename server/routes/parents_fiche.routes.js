"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const ctrl = require("../controllers/parents_fiche.controller");

// Toutes ces routes nécessitent un token
router.use(auth);

// GET fiche parents
// GET /enfants/:enfantId/parents-fiche
router.get(
  "/enfants/:enfantId/parents-fiche",
  requireRole("PRESIDENT", "DIRECTEUR"),
  ctrl.get
);

// UPSERT fiche parents
// PUT /enfants/:enfantId/parents-fiche
router.put(
  "/enfants/:enfantId/parents-fiche",
  requireRole("PRESIDENT", "DIRECTEUR"),
  ctrl.upsert
);

module.exports = router;
