"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const ctrl = require("../controllers/educateur_messages.controller");

const intParam = (name) => (req, res, next) => {
  const parsed = Number.parseInt(req.params[name], 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return res.status(422).json({ message: `Paramètre invalide: ${name}` });
  }
  req.params[name] = parsed;
  next();
};

router.use(auth);

router.post(
  "/enfants/:enfantId/messages/thread",
  requireRole("EDUCATEUR"),
  intParam("enfantId"),
  ctrl.ensureParentThread
);

module.exports = router;
