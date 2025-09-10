const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/enfant.controller");
const {
  createEnfantSchema,
  updateEnfantSchema,
} = require("../validations/enfant.schema");

router.use(auth);

// READ: PRESIDENT/DIRECTEUR can list & view
router.get("/", requireRole("PRESIDENT", "DIRECTEUR"), ctrl.list);
router.get("/:id", requireRole("PRESIDENT", "DIRECTEUR"), ctrl.get);

// CREATE/UPDATE/DELETE: only PRESIDENT or DIRECTEUR
router.post(
  "/",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(createEnfantSchema),
  ctrl.create
);
router.put(
  "/:id",
  requireRole("PRESIDENT", "DIRECTEUR"),
  validate(updateEnfantSchema),
  ctrl.update
);
router.delete("/:id", requireRole("PRESIDENT", "DIRECTEUR"), ctrl.remove);

module.exports = router;
