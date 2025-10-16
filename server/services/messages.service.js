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
  const base = name.replace(/[^\p{L}\p{N}_.\-\s]/gu, "").trim();
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

async function writeAttachments(threadId, attachments = []) {
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
        id: fileName,
        name,
        mimeType: attachment.mimeType || mime || null,
        size: buffer.length,
        publicUrl: `${ATTACHMENTS_PREFIX}${fileName}`,
        storagePath: path.posix.join("messages", fileName),
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
    files: saved,
    cleanup: async () => {
      await Promise.all(
        saved.map((file) => fs.unlink(file.absolutePath).catch(() => {}))
      );
    },
  };
}

function mapParticipant(participant, currentUserId) {
  if (!participant) return null;
  const user = participant.utilisateur || participant;
  if (!user) return null;
  const name =
    [user.prenom, user.nom].filter(Boolean).join(" ") ||
    user.email ||
    participant.name ||
    null;
  return {
    id: user.id,
    role: user.role,
    name,
    isCurrentUser: String(user.id) === String(currentUserId),
  };
}

function mapAttachmentRecord(record) {
  if (!record) return null;
  const plain = record.get ? record.get({ plain: true }) : record;
  const name = plain.original_name || plain.name || null;
  const url = plain.public_url || plain.url || null;
  if (!name && !url) return null;
  return {
    id: plain.id || plain.storage_path || plain.fileName || url,
    name,
    url,
    mimeType: plain.mime_type || plain.mimeType || null,
    size:
      typeof plain.size === "number"
        ? plain.size
        : typeof plain.fileSize === "number"
          ? plain.fileSize
          : null,
    createdAt: plain.created_at || plain.createdAt || null,
  };
}

function mapLegacyAttachment(legacy) {
  if (!legacy) return null;
  const name = legacy.name || legacy.original_name || null;
  const url = legacy.url || legacy.public_url || null;
  if (!name && !url) return null;
  return {
    id: legacy.id || legacy.storage_path || url,
    name,
    url,
    mimeType: legacy.mimeType || legacy.mime_type || null,
    size:
      typeof legacy.size === "number"
        ? legacy.size
        : typeof legacy.fileSize === "number"
          ? legacy.fileSize
          : null,
    createdAt: legacy.createdAt || legacy.created_at || null,
  };
}

function combineAttachments(relational = [], legacy = []) {
  const collected = [];
  const seen = new Set();
  const push = (attachment) => {
    if (!attachment) return;
    const key = attachment.id || attachment.url || `${attachment.name}-${attachment.size}`;
    if (key && seen.has(key)) return;
    if (key) seen.add(key);
    collected.push(attachment);
  };
  relational.forEach((item) => push(mapAttachmentRecord(item)));
  legacy.forEach((item) => push(mapLegacyAttachment(item)));
  return collected;
}

function mapMessageRecord(message) {
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
    attachments: combineAttachments(plain.attachments, plain.pieces_jointes),
  };
}

function mapThreadRecord(thread, currentUserId, fallbackUnread = 0) {
  if (!thread) return null;
  const plain = thread.get ? thread.get({ plain: true }) : thread;
  const participantList = (plain.participants || [])
    .map((participant) => mapParticipant(participant, currentUserId))
    .filter(Boolean);
  const otherParticipants = participantList.filter(
    (participant) => !participant.isCurrentUser
  );
  const displayParticipants = otherParticipants.length
    ? otherParticipants
    : participantList;
  const lastMessageRaw = plain.lastMessage || plain.messages?.[0] || null;
  const unreadCount =
    typeof plain.unreadCount === "number" ? plain.unreadCount : fallbackUnread;
  return {
    id: plain.id,
    subject: plain.sujet || plain.title,
    createdAt: plain.created_at || plain.createdAt,
    updatedAt: plain.updated_at || plain.updatedAt,
    participants: displayParticipants.map(({ isCurrentUser, ...rest }) => rest),
    unreadCount,
    lastMessage: lastMessageRaw ? mapMessageRecord(lastMessageRaw) : null,
    enfant: plain.enfant
      ? {
          id: plain.enfant.id,
          name: [plain.enfant.prenom, plain.enfant.nom].filter(Boolean).join(" "),
        }
      : null,
    createdBy: plain.creator
      ? {
          id: plain.creator.id,
          name:
            [plain.creator.prenom, plain.creator.nom]
              .filter(Boolean)
              .join(" ") || plain.creator.email,
        }
      : null,
    currentUserId,
  };
}

exports.listThreads = async (currentUser, query) => {
  const { rows, total, page, limit } = await repo.listThreadsForUser(
    currentUser.id,
    query
  );
  const threads = rows.map((row) => mapThreadRecord(row, currentUser.id, row.unreadCount));
  const perPage = limit || rows.length || 1;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  return {
    threads,
    pagination: {
      total,
      page,
      perPage,
      totalPages,
      hasNextPage: page < totalPages,
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
  return mapThreadRecord(thread, currentUser.id, unread);
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
  const mapped = messages.map(mapMessageRecord);
  const nextCursor =
    messages.length === limit
      ? messages[messages.length - 1].created_at
      : null;
  return {
    messages: mapped,
    pageInfo: {
      nextCursor: nextCursor ? new Date(nextCursor).toISOString() : null,
      hasMore: Boolean(nextCursor),
    },
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

  const { files, cleanup } = await writeAttachments(threadId, payload.attachments);

  let message;
  try {
    await sequelize.transaction(async (t) => {
      message = await repo.createMessage(
        {
          thread_id: threadId,
          expediteur_id: currentUser.id,
          texte: body,
          pieces_jointes: files.map((file) => ({
            id: file.id,
            name: file.name,
            url: file.publicUrl,
            mimeType: file.mimeType,
            size: file.size,
          })),
        },
        t
      );

      if (files.length) {
        await repo.createMessageAttachments(
          files.map((file) => ({
            message_id: message.id,
            original_name: file.name,
            mime_type: file.mimeType,
            size: file.size,
            storage_path: file.storagePath,
            public_url: file.publicUrl,
          })),
          t
        );
      }

      await repo.touchThread(threadId, message.created_at, t);
      await repo.updateLastRead(threadId, currentUser.id, message.created_at, t);
    });
  } catch (error) {
    await cleanup();
    throw error;
  }

  const freshMessage = await repo.findMessageById(message.id);
  const mapped = mapMessageRecord(freshMessage || message);

  notifier
    .notifyOnNewMessage({
      thread_id: threadId,
      expediteur_id: currentUser.id,
      texte: body,
    })
    .catch(() => {});

  typingStatus.setTyping(threadId, currentUser.id, { isTyping: false });

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
  return { unread, lastReadAt: now.toISOString() };
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
  const displayName = user
    ? [user.prenom, user.nom].filter(Boolean).join(" ") || user.email || "مستخدم"
    : "مستخدم";
  const label = `${displayName} يكتب الآن...`;
  typingStatus.setTyping(threadId, currentUser.id, {
    isTyping: Boolean(isTyping),
    name: displayName,
    label,
  });
  return typingStatus.getTyping(threadId, currentUser.id);
};
