const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/dailynote.controller");
const {
  createDailyNoteSchema,
  updateDailyNoteSchema,
  listDailyNotesQuerySchema,
} = require("../validations/dailynote.schema");

router.use(auth);

// Lister les notes d’un PEI
router.get(
  "/pei/:peiId/daily-notes",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  (req, _res, next) => {
    const { error, value } = listDailyNotesQuerySchema.validate(req.query, {
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

// Obtenir 1 note
router.get(
  "/daily-notes/:id",
  requireRole("PRESIDENT", "DIRECTEUR", "EDUCATEUR"),
  ctrl.get
);

// Créer (educateur/directeur/president)
router.post(
  "/pei/:peiId/daily-notes",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  validate(createDailyNoteSchema),
  ctrl.create
);

// Mettre à jour
router.put(
  "/daily-notes/:id",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  validate(updateDailyNoteSchema),
  ctrl.update
);

// Supprimer
router.delete(
  "/daily-notes/:id",
  requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"),
  ctrl.remove
);

module.exports = router;
