"use strict";

const router = require("express").Router();
const auth = require("../middlewares/auth");
const messagesService = require("../services/messages.service");
const validate = require("../middlewares/validate");
const {
  createThreadSchema,
  sendMessageSchema,
  threadIdParamSchema,
} = require("../validations/messages.schema");

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function parseCursor(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

router.use(auth);

router.get(
  "/threads",
  asyncHandler(async (req, res) => {
    const { q, status, page, limit, sort } = req.query;
    const result = await messagesService.listThreads(req.user.id, {
      q,
      status,
      page,
      limit,
      sort,
      role: req.user.role,
    });
    res.json({ data: result, meta: null });
  })
);

// إنشاء محادثة جديدة مع رسالة افتتاحية (يدمج الرئيس كمشارك تلقائي)
router.post(
  "/threads",
  validate(createThreadSchema),
  asyncHandler(async (req, res) => {
    const { participantIds, title, text, isGroup } = req.body || {};

    const normalizedIsGroup = typeof isGroup === "boolean" ? isGroup : participantIds.length > 1;

    const thread = await messagesService.createThread({
      actorId: req.user.id,
      participantIds,
      title: title || null,
      isGroup: normalizedIsGroup,
    });

    // إرسال أول رسالة في الخيط الجديد
    const message = await messagesService.sendMessage({
      userId: req.user.id,
      threadId: thread.id,
      text: text.trim(),
      attachments: [],
    });

    const fullThread = await messagesService.getThread(req.user.id, thread.id, req.user.role);

    res.status(201).json({ data: { thread: fullThread, message }, meta: null });
  })
);

router.get(
  "/threads/:threadId",
  validate(threadIdParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const threadId = Number(req.params.threadId);
    const thread = await messagesService.getThread(req.user.id, threadId, req.user.role);
    res.json({ data: thread, meta: null });
  })
);

router.get(
  "/threads/:threadId/messages",
  validate(threadIdParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const threadId = Number(req.params.threadId);
    const cursor = parseCursor(req.query.cursor);
    const limit = req.query.limit;
    const result = await messagesService.listMessages(req.user.id, threadId, {
      cursor,
      limit,
    });
    res.json({ data: result, meta: null });
  })
);

router.post(
  "/threads/:threadId/messages",
  validate(threadIdParamSchema, "params"),
  validate(sendMessageSchema),
  asyncHandler(async (req, res) => {
    const threadId = Number(req.params.threadId);
    const { text, attachments } = req.body || {};
    const message = await messagesService.sendMessage({
      userId: req.user.id,
      threadId,
      text,
      attachments: Array.isArray(attachments) ? attachments : [],
    });

    const io = req.app.get("io");
    if (io) {
      const namespace = io.of("/messages");
      namespace.to(`thread:${threadId}`).emit("message:new", message);
      try {
        const thread = await messagesService.getThread(req.user.id, threadId, req.user.role);
        const recipients = thread.participants || [];
        await Promise.all(
          recipients.map(async (participant) => {
            const room = `user:${participant.id}`;
            namespace.to(room).emit("thread:updated", {
              threadId,
              lastMessage: message,
              updatedAt: message.createdAt,
            });
            const count = await messagesService.unreadCount(participant.id);
            namespace.to(room).emit("unread:count", { count });
          })
        );
      } catch (error) {
        // Logging only; HTTP response continues
        console.error("[http] messages broadcast failed", error);
      }
    }

    res.status(201).json({ data: message, meta: null });
  })
);

router.post(
  "/threads/:threadId/read",
  validate(threadIdParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const threadId = Number(req.params.threadId);
    const rawUpTo = req.body?.upToMessageId;
    const numericUpTo = rawUpTo !== undefined ? Number(rawUpTo) : null;
    const upToMessageId = Number.isFinite(numericUpTo) ? numericUpTo : null;
    const result = await messagesService.markRead({
      userId: req.user.id,
      threadId,
      upToMessageId,
    });
    res.json({ data: result, meta: null });
  })
);

module.exports = router;
