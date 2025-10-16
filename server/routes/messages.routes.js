"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");
const validate = require("../middlewares/validate");
const ctrl = require("../controllers/messages.controller");
const {
  threadIdParam,
  listThreadsQuery,
  listMessagesQuery,
  sendMessageBody,
  typingBody,
} = require("../validations/messages.schema");

const ROLES = ["PRESIDENT", "DIRECTEUR", "EDUCATEUR", "PARENT"];
const ensureMessagingRole = requireRole(...ROLES);

router.use(auth, ensureMessagingRole);

router.get(
  "/messages/threads",
  validate(listThreadsQuery, "query"),
  ctrl.listThreads
);

router.get(
  "/messages/threads/:threadId",
  validate(threadIdParam, "params"),
  ctrl.getThread
);

router.get(
  "/messages/threads/:threadId/messages",
  validate(threadIdParam, "params"),
  validate(listMessagesQuery, "query"),
  ctrl.listMessages
);

router.post(
  "/messages/threads/:threadId/messages",
  validate(threadIdParam, "params"),
  validate(sendMessageBody, "body"),
  ctrl.sendMessage
);

router.post(
  "/messages/threads/:threadId/read",
  validate(threadIdParam, "params"),
  ctrl.markAsRead
);

router.get(
  "/messages/threads/:threadId/typing",
  validate(threadIdParam, "params"),
  ctrl.getTypingStatus
);

router.post(
  "/messages/threads/:threadId/typing",
  validate(threadIdParam, "params"),
  validate(typingBody, "body"),
  ctrl.setTypingStatus
);

module.exports = router;
