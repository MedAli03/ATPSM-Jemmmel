const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/utilisateur.controller");
const {
  createUserSchema,
  updateUserSchema,
} = require("../validations/utilisateur.schema");

router.use(auth);

// Seuls PRESIDENT & DIRECTEUR gèrent les comptes
router.get("/", requireRole("PRESIDENT", "DIRECTEUR"), ctrl.list);
router.get("/:id", requireRole("PRESIDENT", "DIRECTEUR"), ctrl.get);
router.post(
  "/",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(createUserSchema),
  ctrl.create
);
router.put(
  "/:id",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(updateUserSchema),
  ctrl.update
);
router.delete("/:id", requireRole("PRESIDENT", "DIRECTEUR"), ctrl.remove);

module.exports = router;
