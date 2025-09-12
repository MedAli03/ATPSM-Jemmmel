"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/observation_initiale.controller");

const {
  idParamSchema,
  listQuerySchema,
  createObservationSchema,
  updateObservationSchema,
} = require("../validations/observation_initiale.schema");

router.use(auth);

/**
 * @swagger
 * tags:
 *   - name: Observations
 *     description: Observations initiales (educateur → enfant)
 */

// LISTE (filtre & pagination)
router.get(
  "/",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  validate(listQuerySchema, "query"),
  ctrl.list
);

// GET BY ID
router.get(
  "/:id",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  validate(idParamSchema, "params"),
  ctrl.get
);

// CREATE (educateur/directeur/president)
router.post(
  "/",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  validate(createObservationSchema, "body"),
  ctrl.create
);

// UPDATE (owner or directeur/president)
router.put(
  "/:id",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  validate(idParamSchema, "params"),
  validate(updateObservationSchema, "body"),
  ctrl.update
);

// DELETE (owner or directeur/president)
router.delete(
  "/:id",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  validate(idParamSchema, "params"),
  ctrl.remove
);

module.exports = router;
