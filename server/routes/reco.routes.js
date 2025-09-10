const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/reco.controller");
const { updateRecoItemsSchema } = require("../validations/reco.schema");

router.use(auth);

// Générer une reco (mock) à partir d'une évaluation
router.post(
  "/reco/:evaluationId/generate",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  ctrl.generate
);

// Obtenir une reco
router.get(
  "/reco/:id",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  ctrl.get
);

// Mettre à jour arbitrage des items
router.put(
  "/reco/:id/items",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  validate(updateRecoItemsSchema),
  ctrl.updateItems
);

// Appliquer au PEI (création PEI cible + activités + historique)
router.post(
  "/reco/:id/apply",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  ctrl.apply
);

module.exports = router;
