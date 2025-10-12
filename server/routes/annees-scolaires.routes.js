"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");

const ctrl = require("../controllers/annees.controller");
const { listQuerySchema } = require("../validations/annees.schema");

router.use(auth);

router.get(
  "/",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  validate(listQuerySchema, "query"),
  ctrl.list
);

router.get(
  "/active",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  ctrl.getActive
);

module.exports = router;

