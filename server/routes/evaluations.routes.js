const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/evaluation.controller");
const {
  createEvaluationSchema,
  listEvaluationsQuerySchema,
} = require("../validations/evaluation.schema");

router.use(auth);

// Lister les évaluations d’un PEI
router.get(
  "/pei/:peiId/evaluations",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  (req, _res, next) => {
    const { error, value } = listEvaluationsQuerySchema.validate(req.query, {
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

// Obtenir 1 évaluation
router.get(
  "/evaluations/:id",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  ctrl.get
);

// Créer une évaluation
router.post(
  "/pei/:peiId/evaluations",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  validate(createEvaluationSchema),
  ctrl.create
);

module.exports = router;
