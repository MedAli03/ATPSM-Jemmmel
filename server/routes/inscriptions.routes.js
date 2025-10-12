"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");

const ctrl = require("../controllers/stats.controller");
const { createInscriptionSchema } = require("../validations/stats.schema");

router.use(auth);
router.use(requireRole("DIRECTEUR", "PRESIDENT"));

router.post("/", validate(createInscriptionSchema), ctrl.createInscription);

module.exports = router;

