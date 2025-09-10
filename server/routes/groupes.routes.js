const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/groupe.controller");
const {
  createGroupeSchema,
  inscrireEnfantsSchema,
  affecterEducateurSchema,
} = require("../validations/groupe.schema");

router.use(auth);

// Création d’un groupe (DIRECTEUR ou PRESIDENT)
router.post(
  "/",
  requireRole("DIRECTEUR", "PRESIDENT"),
  validate(createGroupeSchema),
  ctrl.create
);

// Lister les groupes d’une année
router.get(
  "/annees/:anneeId",
  requireRole("DIRECTEUR", "PRESIDENT", "EDUCATEUR"),
  ctrl.listByYear
);

// Inscrire des enfants à un groupe (batch)
router.post(
  "/annees/:anneeId/:groupeId/inscriptions",
  requireRole("DIRECTEUR", "PRESIDENT"),
  validate(inscrireEnfantsSchema),
  ctrl.inscrireEnfants
);

// Affecter/remplacer l’éducateur d’un groupe pour l’année
router.post(
  "/annees/:anneeId/:groupeId/educateur",
  requireRole("DIRECTEUR", "PRESIDENT"),
  validate(affecterEducateurSchema),
  ctrl.affecterEducateur
);

module.exports = router;
