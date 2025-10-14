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

const ROLES = ["PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT"];
const ensureNotificationRole = requireRole(...ROLES);

router.get(
  "/notifications/stream",
  auth,
  ensureNotificationRole,
  ctrl.stream
);

// Lister MES notifs
router.get(
  "/notifications/me",
  auth,
  ensureNotificationRole,
  validate(listQuerySchema, "query"),
  ctrl.listMine
);

// Détail d'UNE de MES notifs
router.get(
  "/notifications/:id",
  auth,
  ensureNotificationRole,
  validate(idParamSchema, "params"),
  ctrl.getMine
);

// Compteur non lues
router.get(
  "/notifications/me/unread-count",
  auth,
  ensureNotificationRole,
  ctrl.unreadCount
);

// Marquer UNE comme lue
router.patch(
  "/notifications/:id/read",
  auth,
  ensureNotificationRole,
  validate(idParamSchema, "params"),
  ctrl.readOne
);

// Tout marquer comme lu
router.post(
  "/notifications/mark-all-read",
  auth,
  ensureNotificationRole,
  ctrl.readAll
);

// Supprimer une notification
router.delete(
  "/notifications/:id",
  auth,
  ensureNotificationRole,
  validate(idParamSchema, "params"),
  ctrl.remove
);

module.exports = router;
