"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/notifications.broadcast.controller");
const {
  broadcastSchema,
} = require("../validations/notifications.broadcast.schema");

// BROADCAST (Président)
router.post(
  "/admin/notifications/broadcast",
  auth,
  requireRole("PRESIDENT"),
  validate(broadcastSchema, "body"),
  ctrl.broadcast
);

module.exports = router;
