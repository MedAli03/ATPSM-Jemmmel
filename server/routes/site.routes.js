"use strict";

const router = require("express").Router();
const ctrl = require("../controllers/site.controller");

router.get("/overview", ctrl.overview);
router.get("/navigation", ctrl.navigation);
router.get("/hero", ctrl.hero);
router.get("/highlights", ctrl.highlights);
router.get("/footer", ctrl.footer);
router.get("/contact", ctrl.contact);
router.get("/about", ctrl.about);
router.get("/news", ctrl.news);
router.get("/news/:id", ctrl.newsById);
router.get("/events", ctrl.events);
router.get("/events/:id", ctrl.eventById);

module.exports = router;
