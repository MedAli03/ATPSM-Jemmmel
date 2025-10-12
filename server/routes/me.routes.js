const router = require("express").Router();

const auth = require("../middlewares/auth");
const controller = require("../controllers/me.controller");

router.use(auth);

router.get("/", controller.getProfile);
router.put("/", controller.updateProfile);
router.put("/password", controller.changePassword);
router.put("/avatar", controller.updateAvatar);
router.get("/sessions", controller.listSessions);

module.exports = router;
