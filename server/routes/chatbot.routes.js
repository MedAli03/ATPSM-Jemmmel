const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/chatbot.controller");
const { chatbotQuerySchema } = require("../validations/chatbot.schema");

const ALLOWED_CHATBOT_ROLES = ["EDUCATEUR", "DIRECTEUR", "PRESIDENT"];

router.use(auth);

router.get("/history", requireRole(...ALLOWED_CHATBOT_ROLES), ctrl.history);
router.post(
  "/query",
  requireRole(...ALLOWED_CHATBOT_ROLES),
  validate(chatbotQuerySchema),
  ctrl.query
);

module.exports = router;
