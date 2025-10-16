const router = require("express").Router();

router.use("/site", require("./site.routes"));
router.use("/auth", require("./auth.routes")); // /api/auth/*
router.use("/utilisateurs", require("./utilisateurs.routes"));

router.use("/groupes", require("./groupes.routes"));

router.use("/pei", require("./pei.routes"));
router.use("/", require("./activites.routes"));
router.use("/", require("./dailynotes.routes"));
router.use("/", require("./evaluations.routes"));
router.use("/", require("./reco.routes"));

router.use("/dashboard", require("./dashboard/index"));
router.use("/annees", require("./annees.routes"));
router.use("/annees-scolaires", require("./annees-scolaires.routes"));

router.use("/observation", require("./observation_initiale.routes"));
router.use("/documents", require("./documents.routes"));
router.use("/reglements", require("./reglements.routes"));
router.use("/evenements", require("./evenements.routes"));
router.use("/actualites", require("./actualites.routes"));
router.use("/inscriptions", require("./inscriptions.routes"));

router.use(require("./notifications.broadcast.routes"));
router.use(require("./notifications.user.routes"));
router.use(require("./messages.routes"));

router.use("/enfants", require("./enfants.routes"));
router.use(require("./fiche_enfant.routes"));
router.use(require("./parents_fiche.routes"));

router.use(require("./parents.routes"));

router.use(require("./president_dashboard.routes"));
router.use(require("./directeur_dashboard.routes"));
router.use("/stats", require("./stats.routes"));

router.use("/me", require("./me.routes"));
module.exports = router;
