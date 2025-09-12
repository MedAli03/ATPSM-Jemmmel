"use strict";

const express = require("express");
const router = express.Router();

const controller = require("../../controllers/dashboard/president.controller");
const { requireRole } = require("../../middlewares/requireRole");

// GET /api/dashboard/president?annee_id=&date_debut=&date_fin=
// router.get("/", requireRole(["PRESIDENT"]), controller.getPresidentDashboard);

module.exports = router;
