const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const educateurCtrl = require("../controllers/educateur.controller");
const observationSchema = require("../validations/observation_initiale.schema");
const peiSchema = require("../validations/pei.schema");
const activiteSchema = require("../validations/activite.schema");
const dailynoteSchema = require("../validations/dailynote.schema");
const evaluationSchema = require("../validations/evaluation.schema");
const educatorAccess = require("../services/educateur_access.service");
const {
  paginationQuerySchema,
  childIdParamSchema,
  peiIdParamSchema,
  observationIdParamSchema,
} = require("../validations/educateur.schema");

router.use(auth);
router.use(requireRole("EDUCATEUR"));

router.get("/me/groupes", educateurCtrl.listMyGroups);
router.get(
  "/me/enfants",
  validate(paginationQuerySchema, "query"),
  educateurCtrl.listMyChildren
);

router.get(
  "/enfants/:enfantId",
  validate(childIdParamSchema, "params"),
  educateurCtrl.getChild
);

router.get(
  "/enfants/:enfantId/pei-actif",
  validate(childIdParamSchema, "params"),
  educateurCtrl.getActivePeiForChild
);

router.post(
  "/enfants/:enfantId/pei",
  validate(childIdParamSchema, "params"),
  async (req, _res, next) => {
    try {
      const activeYear = await educatorAccess.requireActiveSchoolYear();
      req.body.enfant_id = Number(req.params.enfantId);
      req.body.educateur_id = req.user.id;
      req.body.annee_id = activeYear.id;
      req.body.date_creation = req.body.date_creation || new Date().toISOString();
      next();
    } catch (e) {
      next(e);
    }
  },
  validate(peiSchema.createPeiSchema, "body"),
  educateurCtrl.createPeiForChild
);

router.put(
  "/pei/:peiId",
  validate(peiIdParamSchema, "params"),
  validate(peiSchema.updatePeiSchema, "body"),
  educateurCtrl.updatePei
);

router.get(
  "/pei/:peiId/activites",
  validate(peiIdParamSchema, "params"),
  validate(activiteSchema.listActivitesQuerySchema, "query"),
  educateurCtrl.listPeiActivities
);
router.post(
  "/pei/:peiId/activites",
  validate(peiIdParamSchema, "params"),
  validate(activiteSchema.createActiviteSchema, "body"),
  educateurCtrl.createPeiActivity
);

router.get(
  "/enfants/:enfantId/daily-notes",
  validate(childIdParamSchema, "params"),
  validate(dailynoteSchema.listDailyNotesQuerySchema, "query"),
  educateurCtrl.listDailyNotes
);
router.post(
  "/enfants/:enfantId/daily-notes",
  validate(childIdParamSchema, "params"),
  (req, _res, next) => {
    req.body.enfant_id = Number(req.params.enfantId);
    next();
  },
  validate(dailynoteSchema.createDailyNoteSchema, "body"),
  educateurCtrl.createDailyNote
);

router.get(
  "/pei/:peiId/evaluations",
  validate(peiIdParamSchema, "params"),
  validate(evaluationSchema.listEvaluationsQuerySchema, "query"),
  educateurCtrl.listEvaluations
);
router.post(
  "/pei/:peiId/evaluations",
  validate(peiIdParamSchema, "params"),
  validate(evaluationSchema.createEvaluationSchema, "body"),
  educateurCtrl.createEvaluation
);

router.get(
  "/enfants/:enfantId/observations-initiales",
  validate(childIdParamSchema, "params"),
  validate(observationSchema.listQuerySchema, "query"),
  educateurCtrl.listObservations
);
router.post(
  "/enfants/:enfantId/observations-initiales",
  validate(childIdParamSchema, "params"),
  (req, _res, next) => {
    req.body.enfant_id = Number(req.params.enfantId);
    next();
  },
  validate(observationSchema.createObservationSchema, "body"),
  educateurCtrl.createObservation
);
router.put(
  "/observations-initiales/:obsId",
  validate(observationIdParamSchema, "params"),
  validate(observationSchema.updateObservationSchema, "body"),
  educateurCtrl.updateObservation
);

router.get("/me/enfants/ids", educateurCtrl.listMyAccessibleChildIds);

module.exports = router;
