"use strict";

const express = require("express");
const router = express.Router();

const controller = require("../../controllers/dashboard/directeur.controller");
const { requireRole } = require("../../middlewares/requireRole");

// GET /api/dashboard/directeur?annee_id=&groupe_id=&educateur_id=&date_debut=&date_fin=
// router.get("/", requireRole(["DIRECTEUR"]), controller.getDirecteurDashboard);

module.exports = router;
