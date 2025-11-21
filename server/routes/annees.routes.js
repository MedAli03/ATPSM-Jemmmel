"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");

const ctrl = require("../controllers/annees.controller");
const {
  idParamSchema,
  listQuerySchema,
  createAnneeSchema,
  updateAnneeSchema,
} = require("../validations/annees.schema");

router.use(auth);

// LISTE
router.get(
  "/",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  validate(listQuerySchema, "query"),
  ctrl.list
);

// ACTIVE
router.get(
  "/active",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  ctrl.getActive
);

// GET BY ID
router.get(
  "/:id",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  validate(idParamSchema, "params"),
  ctrl.get
);

// CREATE
router.post(
  "/",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(createAnneeSchema, "body"),
  ctrl.create
);

// UPDATE
router.put(
  "/:id",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(idParamSchema, "params"),
  validate(updateAnneeSchema, "body"),
  ctrl.update
);

// ACTIVATE
router.post(
  "/:id/activate",
  requireRole("PRESIDENT"),
  validate(idParamSchema, "params"),
  ctrl.activate
);

// ARCHIVE
router.post(
  "/:id/archive",
  requireRole("PRESIDENT"),
  validate(idParamSchema, "params"),
  ctrl.archive
);

// DELETE
router.delete(
  "/:id",
  requireRole("PRESIDENT"),
  validate(idParamSchema, "params"),
  ctrl.remove
);

module.exports = router;
