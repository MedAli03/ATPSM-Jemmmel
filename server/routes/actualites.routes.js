"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");

const ctrl = require("../controllers/actualites.controller");
const {
  idParamSchema,
  listQuerySchema,
  createActualiteSchema,
  updateActualiteSchema,
} = require("../validations/actualites.schema");

router.use(auth);

/**
 * @swagger
 * tags:
 *   - name: Actualites
 *     description: Annonces / Actualités (Président)
 */

// LISTE
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

// CREATE (Président)
router.post(
  "/",
  requireRole("PRESIDENT"),
  validate(createActualiteSchema, "body"),
  ctrl.create
);

// UPDATE (Président)
router.put(
  "/:id",
  requireRole("PRESIDENT"),
  validate(idParamSchema, "params"),
  validate(updateActualiteSchema, "body"),
  ctrl.update
);

// DELETE (Président)
router.delete(
  "/:id",
  requireRole("PRESIDENT"),
  validate(idParamSchema, "params"),
  ctrl.remove
);

module.exports = router;
