const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/chatbot.controller");
const { chatbotQuerySchema } = require("../validations/chatbot.schema");

router.use(auth, requireRole("EDUCATEUR", "DIRECTEUR", "PRESIDENT"));

router.post("/query", validate(chatbotQuerySchema), ctrl.query);

module.exports = router;
