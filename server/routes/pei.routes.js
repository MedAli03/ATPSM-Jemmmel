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

// Lister / filtrer (PRESIDENT, DIRECTEUR, EDUCATEUR)
router.get(
  "/",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  (req, res, next) => {
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
  },
  ctrl.list
);

// Obtenir un PEI (PRESIDENT, DIRECTEUR, EDUCATEUR)
router.get(
  "/:id",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  ctrl.get
);

// Créer un PEI (DIRECTEUR, PRESIDENT)
router.post(
  "/",
  requireRole("DIRECTEUR", "PRESIDENT", "EDUCATEUR"),
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

// Clôturer un PEI
router.post(
  "/:id/close",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  ctrl.close
);

module.exports = router;
