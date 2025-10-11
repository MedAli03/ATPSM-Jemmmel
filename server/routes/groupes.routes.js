// routes/groupe.routes.js
"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/groupe.controller");

const {
  createGroupeSchema,
  updateGroupeSchema,
  inscrireEnfantsSchema,
  affecterEducateurSchema,
  listCandidatsEnfantsQuerySchema,
  listCandidatsEducateursQuerySchema,
} = require("../validations/groupe.schema");

/* ===================== Param / Query guards ===================== */
const intParam = (name) => (req, res, next) => {
  const v = Number.parseInt(req.params[name], 10);
  if (!Number.isFinite(v) || v <= 0) {
    return res.status(422).json({ message: `Paramètre invalide: ${name}` });
  }
  req.params[name] = v;
  next();
};

const intQuery =
  (name, optional = true) =>
  (req, res, next) => {
    const raw = req.query?.[name];
    if (raw == null || raw === "") {
      if (!optional)
        return res.status(422).json({ message: `Query manquante: ${name}` });
      return next();
    }
    const v = Number.parseInt(raw, 10);
    if (!Number.isFinite(v) || v <= 0) {
      return res.status(422).json({ message: `Query invalide: ${name}` });
    }
    req.query[name] = v;
    next();
  };

// Normalize pagination if provided
const paginationQuery = (req, _res, next) => {
  const n = (x, d) => {
    const v = Number.parseInt(x, 10);
    return Number.isFinite(v) && v > 0 ? v : d;
  };
  if (req.query.page != null) req.query.page = n(req.query.page, 1);
  if (req.query.limit != null) req.query.limit = n(req.query.limit, 10);
  next();
};

/* ============================ Auth ============================ */
router.use(auth);

/**
 * ####################################################################
 * GROUPES (CRUD)
 * ####################################################################
 */

// Create
router.post(
  "/",
  requireRole("DIRECTEUR", "PRESIDENT"),
  validate(createGroupeSchema),
  ctrl.create
);

// List (flat)  GET /groupes?anneeId=&statut=&search=&page=&limit=
router.get(
  "/",
  requireRole("DIRECTEUR", "PRESIDENT", "EDUCATEUR"),
  intQuery("anneeId", true),
  paginationQuery,
  ctrl.list
);

// Details
router.get(
  "/:groupeId",
  requireRole("DIRECTEUR", "PRESIDENT", "EDUCATEUR"),
  intParam("groupeId"),
  ctrl.get
);

// Update (name/description/statut)
router.put(
  "/:groupeId",
  requireRole("DIRECTEUR", "PRESIDENT"),
  intParam("groupeId"),
  validate(updateGroupeSchema),
  ctrl.update
);

// Archive / Unarchive (body: { statut: "archive" | "actif" })
router.patch(
  "/:groupeId/archive",
  requireRole("DIRECTEUR", "PRESIDENT"),
  intParam("groupeId"),
  ctrl.archive
);

// Delete (409 if linked). Optional ?anneeId= for guard.
router.delete(
  "/:groupeId",
  requireRole("DIRECTEUR", "PRESIDENT"),
  intParam("groupeId"),
  intQuery("anneeId", true),
  ctrl.remove
);

/**
 * --------------------------------------------------------------------
 * Backward-compatible: list groups by year
 * Prefer GET /groupes?anneeId=... instead.
 * --------------------------------------------------------------------
 */
router.get(
  "/annees/:anneeId",
  requireRole("DIRECTEUR", "PRESIDENT", "EDUCATEUR"),
  intParam("anneeId"),
  paginationQuery,
  ctrl.listByYear
);

/**
 * ####################################################################
 * INSCRIPTIONS (enfant ↔ groupe / année)
 * ####################################################################
 */

// Candidates (available / transferable children for a school year)
router.get(
  "/annees/:anneeId/candidats/enfants",
  requireRole("DIRECTEUR", "PRESIDENT"),
  intParam("anneeId"),
  validate(listCandidatsEnfantsQuerySchema, "query"),
  ctrl.searchEnfantsCandidats
);

// List inscriptions of a group for a year
// GET /groupes/:groupeId/inscriptions?anneeId=
router.get(
  "/:groupeId/inscriptions",
  requireRole("DIRECTEUR", "PRESIDENT", "EDUCATEUR"),
  intParam("groupeId"),
  intQuery("anneeId", false),
  paginationQuery,
  ctrl.listInscriptions
);

// Batch add children to a group for a year
// POST /groupes/annees/:anneeId/:groupeId/inscriptions  { enfants: [ids...] }
router.post(
  "/annees/:anneeId/:groupeId/inscriptions",
  requireRole("DIRECTEUR", "PRESIDENT"),
  intParam("anneeId"),
  intParam("groupeId"),
  validate(inscrireEnfantsSchema),
  ctrl.inscrireEnfants
);

// Remove a single inscription
router.delete(
  "/:groupeId/inscriptions/:inscriptionId",
  requireRole("DIRECTEUR", "PRESIDENT"),
  intParam("groupeId"),
  intParam("inscriptionId"),
  ctrl.removeInscription
);

/**
 * ####################################################################
 * AFFECTATION (educateur ↔ groupe / année)
 * ####################################################################
 */

// Available educators for a school year
router.get(
  "/annees/:anneeId/candidats/educateurs",
  requireRole("DIRECTEUR", "PRESIDENT"),
  intParam("anneeId"),
  validate(listCandidatsEducateursQuerySchema, "query"),
  ctrl.searchEducateursCandidats
);

// Get current assignment for a given year
// GET /groupes/:groupeId/affectation?anneeId=
router.get(
  "/:groupeId/affectation",
  requireRole("DIRECTEUR", "PRESIDENT"),
  intParam("groupeId"),
  intQuery("anneeId", false),
  ctrl.getAffectation
);

// Assign/replace the educator for a group/year
// POST /groupes/annees/:anneeId/:groupeId/educateur  { educateur_id }
router.post(
  "/annees/:anneeId/:groupeId/educateur",
  requireRole("DIRECTEUR", "PRESIDENT"),
  intParam("anneeId"),
  intParam("groupeId"),
  validate(affecterEducateurSchema),
  ctrl.affecterEducateur
);

// Remove assignment
router.delete(
  "/:groupeId/affectation/:affectationId",
  requireRole("DIRECTEUR", "PRESIDENT"),
  intParam("groupeId"),
  intParam("affectationId"),
  ctrl.removeAffectation
);

module.exports = router;
