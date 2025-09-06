const router = require("express").Router();
const requireRole = require("../middlewares/requireRole");
router.get("/", (req, res) => res.json({ you: req.user }));
router.get(
  "/admin-only",
  requireRole("ADMIN", "DIRECTEUR", "MANAGER"),
  (_req, res) => res.json({ ok: true })
);
module.exports = router;
