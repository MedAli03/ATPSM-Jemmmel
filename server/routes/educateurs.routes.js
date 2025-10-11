"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const ctrl = require("../controllers/educateurs.controller");

router.use(auth);
router.use(requireRole("PRESIDENT", "DIRECTEUR"));

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.post("/:id/archive", ctrl.archive);
router.post("/:id/unarchive", ctrl.unarchive);

module.exports = router;
