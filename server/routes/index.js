const router = require("express").Router();

router.use("/auth", require("./auth.routes")); // /api/auth/*
router.use("/me", require("../middlewares/auth"), (req, res) =>
  res.json({ you: req.user })
);

module.exports = router;
