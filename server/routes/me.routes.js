const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

router.use(auth); // <= IMPORTANT

router.get("/", (req, res) => res.json({ you: req.user }));

router.get(
  "/admin-only",
  requireRole("DIRECTEUR", "PRESIDENT", "PARENT", "EDUCATEUR"),
  (_req, res) => res.json({ ok: true })
);

module.exports = router;
