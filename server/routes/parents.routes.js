"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const ctrl = require("../controllers/parents.controller");

// toutes ces routes nécessitent un token
router.use(auth);

// Lister
router.get("/parents", requireRole("PRESIDENT", "DIRECTEUR"), ctrl.list);

// Détails
router.get("/parents/:id", requireRole("PRESIDENT", "DIRECTEUR"), ctrl.get);

// Créer
router.post("/parents", requireRole("PRESIDENT", "DIRECTEUR"), ctrl.create);

// Mettre à jour (profil)
router.put("/parents/:id", requireRole("PRESIDENT", "DIRECTEUR"), ctrl.update);

// Changer le mot de passe
router.patch(
  "/parents/:id/change-password",
  requireRole("PRESIDENT", "DIRECTEUR"),
  ctrl.changePassword
);

// Enfants du parent
router.get(
  "/parents/:id/enfants",
  requireRole("PRESIDENT", "DIRECTEUR"),
  ctrl.children
);

// Créer un NOUVEL enfant pour un parent existant
// POST /parents/:parentId/enfants
router.post(
  "/parents/:parentId/enfants",
  requireRole("PRESIDENT", "DIRECTEUR"),
  ctrl.createChildForParent
);

module.exports = router;
