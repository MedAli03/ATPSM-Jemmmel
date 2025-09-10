const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/activite.controller");
const {
  createActiviteSchema,
  updateActiviteSchema,
  listActivitesQuerySchema,
} = require("../validations/activite.schema");

router.use(auth);

// Lister les activités d’un PEI
router.get(
  "/pei/:peiId/activites",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  (req, _res, next) => {
    const { error, value } = listActivitesQuerySchema.validate(req.query, {
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
  ctrl.listByPei
);

// Obtenir 1 activité
router.get(
  "/activites/:id",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  ctrl.get
);

// Créer (educateur/directeur/president)
router.post(
  "/pei/:peiId/activites",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  validate(createActiviteSchema),
  ctrl.create
);

// Mettre à jour
router.put(
  "/activites/:id",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  validate(updateActiviteSchema),
  ctrl.update
);

// Supprimer
router.delete(
  "/activites/:id",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  ctrl.remove
);

module.exports = router;
