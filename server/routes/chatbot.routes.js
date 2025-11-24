const router = require("express").Router();
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/chatbot.controller");
const { chatbotQuerySchema } = require("../validations/chatbot.schema");

router.use(auth);

router.post("/query", validate(chatbotQuerySchema), ctrl.query);

module.exports = router;
