"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/enfants.controller");

const {
  listEnfantsQuerySchema,
  createEnfantSchema,
  updateEnfantSchema,
  idParamSchema,
  linkParentSchema,
  createParentAccountSchema,
  enfantIdParamSchema,
} = require("../validations/enfants.schema");

// All enfants routes require auth
router.use(auth);

// LIST (staff only)
router.get(
  "/",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  (req, _res, next) => {
    const { error, value } = listEnfantsQuerySchema.validate(req.query, { abortEarly: false });
    if (error) { error.status = 422; return next(error); }
    req.query = value;
    next();
  },
  ctrl.list
);

// GET one (staff; parent can GET only their child via ctrl guard)
router.get(
  "/:id",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT"),
  validate(idParamSchema, "params"),
  ctrl.get
);

// CREATE (President/Directeur)
router.post(
  "/",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(createEnfantSchema),
  ctrl.create
);

// UPDATE (President/Directeur)
router.put(
  "/:id",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(idParamSchema, "params"),
  validate(updateEnfantSchema),
  ctrl.update
);

// DELETE (President/Directeur)
router.delete(
  "/:id",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(idParamSchema, "params"),
  ctrl.remove
);

// LINK PARENT (President/Directeur)
router.patch(
  "/:id/link-parent",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(idParamSchema, "params"),
  validate(linkParentSchema),
  ctrl.linkParent
);

// UNLINK PARENT (President/Directeur)
router.patch(
  "/:id/unlink-parent",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(idParamSchema, "params"),
  ctrl.unlinkParent
);

// HELPER: create a parent user from parents_fiche, then link it
router.post(
  "/:enfantId/create-parent-account",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(enfantIdParamSchema, "params"),
  validate(createParentAccountSchema),
  ctrl.createParentAccount
);

// PARENT: list my own children
router.get(
  "/me/enfants",
  requireRole("PARENT"),
  (req, _res, next) => {
    const { error, value } = listEnfantsQuerySchema.validate(req.query, { abortEarly: false });
    if (error) { error.status = 422; return next(error); }
    req.query = value;
    next();
  },
  ctrl.listMine
);

module.exports = router;
