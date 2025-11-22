const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/pei.controller");
const {
  createPeiSchema,
  updatePeiSchema,
  listPeiQuerySchema,
} = require("../validations/pei.schema");

router.use(auth);

const normalizeListQuery = (req, res, next) => {
  const { error, value } = listPeiQuerySchema.validate(req.query, {
    abortEarly: false,
  });
  if (error) {
    const e = new Error(error.details.map((d) => d.message).join(", "));
    e.status = 422;
    return next(e);
  }
  req.query = value;
  next();
};

// Lister / filtrer (PRESIDENT, DIRECTEUR, EDUCATEUR)
router.get(
  "/",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  normalizeListQuery,
  ctrl.list
);

router.get(
  "/en-attente",
  requireRole("PRESIDENT", "DIRECTEUR"),
  normalizeListQuery,
  (req, res, next) => {
    req.query = { ...req.query, statut: "EN_ATTENTE_VALIDATION" };
    next();
  },
  ctrl.listPending
);

// Obtenir un PEI (PRESIDENT, DIRECTEUR, EDUCATEUR)
router.get(
  "/:id",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  ctrl.get
);

router.get(
  "/:id/history",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  ctrl.history
);

// Créer un PEI (DIRECTEUR, PRESIDENT)
router.post(
  "/",
  requireRole("DIRECTEUR", "PRESIDENT", "EDUCATEUR"),
  (req, res, next) => {
    if (req.user?.role === "EDUCATEUR") {
      req.body.educateur_id = req.user.id;
    }
    next();
  },
  validate(createPeiSchema),
  ctrl.create
);

// Mettre à jour objectifs/statut (EDUCATEUR + DIRECTEUR + PRESIDENT)
router.put(
  "/:id",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  validate(updatePeiSchema),
  ctrl.update
);

router.patch(
  "/:id/validate",
  requireRole("DIRECTEUR", "PRESIDENT"),
  ctrl.validate
);

// Clôturer un PEI
router.post(
  "/:id/close",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  ctrl.close
);

module.exports = router;
