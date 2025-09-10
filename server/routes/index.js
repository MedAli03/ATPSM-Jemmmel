const router = require("express").Router();

router.use("/auth", require("./auth.routes")); // /api/auth/*
router.use("/me", require("../middlewares/auth"), (req, res) =>
  res.json({ you: req.user })
);
router.use("/enfants", require("./enfants.routes"));
router.use("/utilisateurs", require("./utilisateurs.routes"));
router.use("/groupes", require("./groupes.routes"));
router.use("/pei", require("./pei.routes"));
router.use("/", require("./activites.routes"));
router.use("/", require("./dailynotes.routes"));
router.use("/", require("./evaluations.routes"));
router.use("/", require("./reco.routes"));
module.exports = router;
