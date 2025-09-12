"use strict";

const express = require("express");
const router = express.Router();

router.use("/president", require("./president.routes"));
router.use("/directeur", require("./directeur.routes"));

module.exports = router;
