// routes/childRoutes.js
const express = require("express");
const router = express.Router();
const childController = require("../controllers/childController");
const auth = require("../middleware/auth");

router.get(
  "/:childId/progress",
  auth(["parent", "educator"]),
  childController.getChildProgress
);

router.post(
  "/progress-reports",
  auth(["educator"]),
  childController.createProgressReport
);

module.exports = router;
