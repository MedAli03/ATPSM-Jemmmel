"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");

const ctrl = require("../controllers/notifications.user.controller");
const {
  idParamSchema,
  listQuerySchema,
} = require("../validations/notifications.user.schema");

router.get("/notifications/stream", ctrl.stream);

router.use(auth);

const ROLES = ["PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT"];

// Lister MES notifs
router.get(
  "/notifications/me",
  requireRole(...ROLES),
  validate(listQuerySchema, "query"),
  ctrl.listMine
);

// Détail d'UNE de MES notifs
router.get(
  "/notifications/:id",
  requireRole(...ROLES),
  validate(idParamSchema, "params"),
  ctrl.getMine
);

// Compteur non lues
router.get(
  "/notifications/me/unread-count",
  requireRole(...ROLES),
  ctrl.unreadCount
);

// Marquer UNE comme lue
router.patch(
  "/notifications/:id/read",
  requireRole(...ROLES),
  validate(idParamSchema, "params"),
  ctrl.readOne
);

// Tout marquer comme lu
router.post(
  "/notifications/mark-all-read",
  requireRole(...ROLES),
  ctrl.readAll
);

// Supprimer une notification
router.delete(
  "/notifications/:id",
  requireRole(...ROLES),
  validate(idParamSchema, "params"),
  ctrl.remove
);

module.exports = router;
