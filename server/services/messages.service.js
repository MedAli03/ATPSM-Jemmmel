"use strict";

const path = require("path");
const fs = require("fs/promises");
const { randomUUID } = require("crypto");
const { sequelize } = require("../models");
const ApiError = require("../utils/api-error");
const repo = require("../repos/messages.repo");
const typingStatus = require("./typing-status.service");
const notifier = require("./notifier.service");

const ATTACHMENTS_DIR = path.join(__dirname, "..", "uploads", "messages");
const ATTACHMENTS_PREFIX = "/uploads/messages/";
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ATTACHMENTS = 5;

function sanitizeFileName(name) {
  if (!name || typeof name !== "string") return null;
  const base = name.replace(/[^a-zA-Z0-9_.\-\s]/g, "").trim();
  return base || null;
}

function extractBase64Payload(raw) {
  if (typeof raw !== "string" || !raw) return { mime: null, base64: null };
  const trimmed = raw.trim();
  const match = trimmed.match(/^data:([^;]+);base64,(.*)$/);
  if (match) {
    return { mime: match[1], base64: match[2].replace(/\s+/g, "") };
  }
  return { mime: null, base64: trimmed.replace(/\s+/g, "") };
}

async function saveAttachments(threadId, attachments = []) {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return { files: [], cleanup: async () => {} };
  }

  const limited = attachments.slice(0, MAX_ATTACHMENTS);
  const saved = [];

  await fs.mkdir(ATTACHMENTS_DIR, { recursive: true });

  try {
    for (const attachment of limited) {
      if (!attachment || typeof attachment !== "object") {
        throw new ApiError({
          status: 400,
          code: "INVALID_ATTACHMENT",
          message: "المرفق المرسل غير صالح",
        });
      }
      const name = sanitizeFileName(attachment.name) || `attachment-${Date.now()}`;
      const { mime, base64 } = extractBase64Payload(attachment.data || attachment.base64);
      if (!base64) {
        throw new ApiError({
          status: 400,
          code: "INVALID_ATTACHMENT",
          message: "صيغة المرفق غير مدعومة",
        });
      }
      const buffer = Buffer.from(base64, "base64");
      if (!buffer || buffer.length === 0) {
        throw new ApiError({
          status: 400,
          code: "INVALID_ATTACHMENT",
          message: "صيغة المرفق غير مدعومة",
        });
      }
      if (buffer.length > MAX_ATTACHMENT_SIZE) {
        throw new ApiError({
          status: 413,
          code: "ATTACHMENT_TOO_LARGE",
          message: "حجم المرفق يتجاوز الحد المسموح به (5MB)",
        });
      }
      const ext = path.extname(name).slice(0, 12);
      const fileName = `thread-${threadId}-${randomUUID()}${ext}`;
      const absolutePath = path.join(ATTACHMENTS_DIR, fileName);
      await fs.writeFile(absolutePath, buffer);
      saved.push({
        meta: {
          id: fileName,
          name,
          url: `${ATTACHMENTS_PREFIX}${fileName}`,
          size: buffer.length,
          mimeType: attachment.mimeType || mime || null,
        },
        absolutePath,
      });
    }
  } catch (error) {
    await Promise.all(
      saved.map((file) => fs.unlink(file.absolutePath).catch(() => {}))
    );
    throw error;
  }

  return {
    files: saved.map((file) => file.meta),
    cleanup: async () => {
      await Promise.all(
        saved.map((file) => fs.unlink(file.absolutePath).catch(() => {}))
      );
    },
  };
}

function mapThread(thread, currentUserId, fallbackUnread = 0) {
  if (!thread) return null;
  const plain = thread.get ? thread.get({ plain: true }) : thread;
  const allParticipants = (plain.participants || []).map((participant) => {
    const user = participant.utilisateur || participant;
    return {
      id: user.id,
      role: user.role,
      name:
        [user.prenom, user.nom].filter(Boolean).join(" ") ||
        user.email ||
        participant.name ||
        null,
    };
  });
  const participants = allParticipants.filter(
    (participant) =>
      participant.id != null &&
      String(participant.id) !== String(currentUserId)
  );
  const displayParticipants = participants.length ? participants : allParticipants;
  const lastMessage = plain.lastMessage || plain.messages?.[0] || null;
  const unreadCount =
    typeof plain.unreadCount === "number" ? plain.unreadCount : fallbackUnread;
  return {
    id: plain.id,
    title: plain.sujet || plain.title,
    createdAt: plain.created_at || plain.createdAt,
    updatedAt: plain.updated_at || plain.updatedAt,
    participants: displayParticipants,
    unreadCount,
    lastMessage: lastMessage
      ? {
        id: lastMessage.id,
          body: lastMessage.body || lastMessage.texte,
          createdAt: lastMessage.createdAt || lastMessage.created_at,
          senderId: lastMessage.senderId || lastMessage.expediteur_id,
          senderName:
            lastMessage.senderName ||
            [lastMessage.expediteur?.prenom, lastMessage.expediteur?.nom]
              .filter(Boolean)
              .join(" ") ||
            lastMessage.expediteur?.email ||
            null,
        }
      : null,
    currentUserId,
  };
}

function mapMessage(message) {
  const plain = message.get ? message.get({ plain: true }) : message;
  return {
    id: plain.id,
    body: plain.texte,
    createdAt: plain.created_at,
    updatedAt: plain.updated_at,
    senderId: plain.expediteur_id,
    senderName:
      [plain.expediteur?.prenom, plain.expediteur?.nom]
        .filter(Boolean)
        .join(" ") || plain.expediteur?.email || null,
    attachments: Array.isArray(plain.pieces_jointes)
      ? plain.pieces_jointes
      : [],
  };
}

exports.listThreads = async (currentUser, query) => {
  const { rows, total, page, limit } = await repo.listThreadsForUser(
    currentUser.id,
    query
  );
  const threads = rows.map((row) => mapThread(row, currentUser.id, row.unreadCount));
  const totalPages = Math.max(1, Math.ceil(total / (limit || 1)));
  return {
    threads,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

exports.getThread = async (currentUser, threadId) => {
  const membership = await repo.ensureParticipant(threadId, currentUser.id);
  if (!membership) {
    throw new ApiError({
      status: 404,
      code: "THREAD_NOT_FOUND",
      message: "المحادثة غير متاحة",
    });
  }
  const thread = await repo.getThreadDetails(threadId);
  if (!thread) {
    throw new ApiError({
      status: 404,
      code: "THREAD_NOT_FOUND",
      message: "المحادثة غير متاحة",
    });
  }
  const unread = await repo.countUnreadForThread(threadId, currentUser.id);
  return mapThread(thread, currentUser.id, unread);
};

exports.listMessages = async (currentUser, threadId, params = {}) => {
  const membership = await repo.ensureParticipant(threadId, currentUser.id);
  if (!membership) {
    throw new ApiError({
      status: 404,
      code: "THREAD_NOT_FOUND",
      message: "المحادثة غير متاحة",
    });
  }
  let cursorDate = null;
  if (params.cursor) {
    const parsed = new Date(params.cursor);
    if (!Number.isNaN(parsed.getTime())) {
      cursorDate = parsed;
    }
  }
  const limit = Math.min(Number(params.limit) || 20, 50);
  const messages = await repo.listMessages(threadId, {
    cursor: cursorDate,
    limit,
  });
  const mapped = messages.map(mapMessage);
  const nextCursor =
    messages.length === limit
      ? messages[messages.length - 1].created_at
      : null;
  return {
    messages: mapped,
    nextCursor: nextCursor ? new Date(nextCursor).toISOString() : null,
  };
};

exports.sendMessage = async (currentUser, threadId, payload = {}) => {
  const membership = await repo.ensureParticipant(threadId, currentUser.id);
  if (!membership) {
    throw new ApiError({
      status: 404,
      code: "THREAD_NOT_FOUND",
      message: "المحادثة غير متاحة",
    });
  }
  const body = String(payload.body || "").trim();
  if (!body) {
    throw new ApiError({
      status: 400,
      code: "MESSAGE_BODY_REQUIRED",
      message: "نص الرسالة مطلوب",
    });
  }

  const { files, cleanup } = await saveAttachments(threadId, payload.attachments);

  let message;
  try {
    await sequelize.transaction(async (t) => {
      message = await repo.createMessage(
        {
          thread_id: threadId,
          expediteur_id: currentUser.id,
          texte: body,
          pieces_jointes: files,
        },
        t
      );
      await repo.touchThread(threadId, message.created_at, t);
      await repo.updateLastRead(threadId, currentUser.id, message.created_at, t);
    });
  } catch (error) {
    await cleanup();
    throw error;
  }

  const mapped = mapMessage(message);

  notifier
    .notifyOnNewMessage({
      thread_id: threadId,
      expediteur_id: currentUser.id,
      texte: body,
    })
    .catch(() => {});

  typingStatus.setTyping(threadId, currentUser.id, false);

  return mapped;
};

exports.markAsRead = async (currentUser, threadId) => {
  const membership = await repo.ensureParticipant(threadId, currentUser.id);
  if (!membership) {
    throw new ApiError({
      status: 404,
      code: "THREAD_NOT_FOUND",
      message: "المحادثة غير متاحة",
    });
  }
  const now = new Date();
  await repo.updateLastRead(threadId, currentUser.id, now);
  const unread = await repo.countUnreadForThread(threadId, currentUser.id);
  return { unread };
};

exports.getTypingStatus = async (currentUser, threadId) => {
  const membership = await repo.ensureParticipant(threadId, currentUser.id);
  if (!membership) {
    throw new ApiError({
      status: 404,
      code: "THREAD_NOT_FOUND",
      message: "المحادثة غير متاحة",
    });
  }
  return typingStatus.getTyping(threadId, currentUser.id);
};

exports.setTypingStatus = async (currentUser, threadId, isTyping) => {
  const membership = await repo.ensureParticipant(threadId, currentUser.id);
  if (!membership) {
    throw new ApiError({
      status: 404,
      code: "THREAD_NOT_FOUND",
      message: "المحادثة غير متاحة",
    });
  }
  const user = await repo.findUserById(currentUser.id);
  const label = user
    ? `${[user.prenom, user.nom].filter(Boolean).join(" ") || "مستخدم"} يكتب الآن...`
    : "يكتب الآن...";
  typingStatus.setTyping(threadId, currentUser.id, Boolean(isTyping), label);
  return typingStatus.getTyping(threadId, currentUser.id);
};
