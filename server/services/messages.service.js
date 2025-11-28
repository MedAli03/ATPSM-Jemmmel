"use strict";

const { Op, QueryTypes } = require("sequelize");
const { randomUUID } = require("crypto");
const {
  sequelize,
  Thread,
  ThreadParticipant,
  Message,
  MessageReadReceipt,
  Attachment,
  MessageAttachment,
  Utilisateur,
  Enfant,
} = require("../models");
const ApiError = require("../utils/api-error");
const educatorAccess = require("./educateur_access.service");

const MAX_TEXT_LENGTH = 2000;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const MESSAGE_PAGE_SIZE = 25;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 45;

const rateLimiter = new Map(); // userId -> timestamps[]
const typingState = new Map(); // threadId -> Map(userId, expiresAt)
const TYPING_TTL_MS = 6 * 1000;

function normalizeLimit(limit, fallback, cap = MAX_PAGE_SIZE) {
  const parsed = Number.parseInt(limit, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, cap);
}

function buildParticipantPayload(participant, currentUserId) {
  if (!participant) return null;
  const user = participant.user || participant.utilisateur || participant;
  if (!user) return null;
  const fullName = [user.prenom, user.nom].filter(Boolean).join(" ") || user.email;
  return {
    id: Number(user.id),
    role: user.role,
    name: fullName || "-",
    avatarUrl: user.avatar_url || user.avatarUrl || null,
    joinedAt: participant.joined_at || participant.joinedAt || null,
    leftAt: participant.left_at || participant.leftAt || null,
    isCurrentUser: Number(user.id) === Number(currentUserId),
  };
}

function sanitizeMessageForRole(message, role) {
  if (!message) return null;
  if (role === "PARENT" && message.kind === "system") {
    return null;
  }
  return message;
}

function buildMessagePayload(message) {
  const sender = message.sender || message.expediteur;
  const attachments = Array.isArray(message.attachments)
    ? message.attachments.map((attachment) => ({
        id: Number(attachment.id),
        name: attachment.name,
        mime: attachment.mime,
        size: attachment.size,
        storageKey: attachment.storage_key,
        url: attachment.url || null,
      }))
    : [];
  return {
    id: Number(message.id),
    threadId: Number(message.thread_id || message.threadId),
    kind: message.kind,
    text: message.text,
    createdAt: message.created_at || message.createdAt,
    status: message.status || "sent",
    sender: sender
      ? {
          id: Number(sender.id),
          role: sender.role,
          name: [sender.prenom, sender.nom].filter(Boolean).join(" ") || sender.email,
        }
      : null,
    attachments,
    readBy: Array.isArray(message.readReceipts)
      ? message.readReceipts.map((receipt) => Number(receipt.user_id || receipt.userId))
      : [],
  };
}

async function ensureThreadParticipant(userId, threadId, options = {}) {
  const participant = await ThreadParticipant.findOne({
    where: {
      thread_id: threadId,
      user_id: userId,
      [Op.or]: [{ left_at: null }, { left_at: { [Op.gt]: new Date() } }],
    },
    transaction: options.transaction,
  });
  if (!participant) {
    throw new ApiError({
      status: 403,
      code: "THREAD_FORBIDDEN",
      message: "ليس لديك صلاحية لعرض هذه المحادثة",
    });
  }
  return participant;
}

async function fetchUnreadCounts(userId, threadIds) {
  if (!threadIds.length) return new Map();
  const rows = await sequelize.query(
    `SELECT m.thread_id AS threadId, COUNT(*) AS unread
     FROM messages m
     LEFT JOIN message_read_receipts r
       ON r.message_id = m.id AND r.user_id = :userId
     WHERE m.thread_id IN (:threadIds)
       AND m.sender_id <> :userId
       AND r.id IS NULL
     GROUP BY m.thread_id`,
    {
      replacements: { userId, threadIds },
      type: QueryTypes.SELECT,
    }
  );
  const map = new Map();
  const records = Array.isArray(rows) ? rows : [];
  for (const row of records) {
    map.set(Number(row.threadId), Number(row.unread));
  }
  return map;
}

async function listThreads(userId, params = {}) {
  const { q, status, page = 1, limit = DEFAULT_PAGE_SIZE, sort = "recent" } = params;
  const safeLimit = normalizeLimit(limit, DEFAULT_PAGE_SIZE);
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);

  const membership = await ThreadParticipant.findAll({
    where: { user_id: userId, [Op.or]: [{ left_at: null }, { left_at: { [Op.gt]: new Date() } }] },
    attributes: ["thread_id"],
  });
  if (!membership.length) {
    return { data: [], page: safePage, limit: safeLimit, total: 0 };
  }
  const threadIds = membership.map((item) => Number(item.thread_id));

  const where = { id: threadIds };
  if (status === "archived") {
    where.archived = true;
  } else if (status === "active") {
    where.archived = false;
  }

  const order = sort === "oldest" ? [["updated_at", "ASC"]] : [["updated_at", "DESC"]];

  const include = [
    {
      model: ThreadParticipant,
      as: "participants",
      include: [
        {
          model: Utilisateur,
          as: "user",
          attributes: ["id", "prenom", "nom", "email", "role", "avatar_url"],
        },
      ],
    },
    {
      model: Message,
      as: "lastMessage",
      include: [
        {
          model: Utilisateur,
          as: "sender",
          attributes: ["id", "prenom", "nom", "email", "role"],
        },
      ],
    },
  ];

  if (q) {
    const like = `%${q.trim()}%`;
    where[Op.or] = [{ title: { [Op.like]: like } }];
  }

  const { rows, count } = await Thread.findAndCountAll({
    where,
    include,
    distinct: true,
    order,
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  });

  const unreadMap = await fetchUnreadCounts(userId, rows.map((row) => row.id));
  const payload = rows
    .map((thread) => {
      const last = sanitizeMessageForRole(thread.lastMessage, params.role);
      return {
        id: Number(thread.id),
        title: thread.title,
        isGroup: Boolean(thread.is_group),
        archived: Boolean(thread.archived),
        updatedAt: thread.updated_at,
        unreadCount: unreadMap.get(Number(thread.id)) || 0,
        lastMessage: last ? buildMessagePayload(last) : null,
        participants: thread.participants
          .map((participant) => buildParticipantPayload(participant, userId))
          .filter(Boolean),
      };
    })
    .filter(Boolean);

  let filtered = payload;
  if (q) {
    const term = String(q).toLowerCase();
    filtered = filtered.filter((thread) => {
      const titleMatch = (thread.title || "").toLowerCase().includes(term);
      const participantMatch = (thread.participants || []).some((participant) =>
        (participant.name || "").toLowerCase().includes(term)
      );
      const lastMessageMatch = (thread.lastMessage?.text || "").toLowerCase().includes(term);
      return titleMatch || participantMatch || lastMessageMatch;
    });
  }
  if (status === "unread") {
    filtered = filtered.filter((thread) => (thread.unreadCount || 0) > 0);
  }

  const totalCount =
    status === "unread" || status === "read" || q ? filtered.length : count;
  return {
    data: filtered,
    page: safePage,
    limit: safeLimit,
    total: totalCount,
  };
}

async function getThread(userId, threadId, role) {
  await ensureThreadParticipant(userId, threadId);
  const thread = await Thread.findByPk(threadId, {
    include: [
      {
        model: ThreadParticipant,
        as: "participants",
        include: [
          {
            model: Utilisateur,
            as: "user",
            attributes: ["id", "prenom", "nom", "email", "role", "avatar_url"],
          },
        ],
      },
      {
        model: Message,
        as: "lastMessage",
        include: [
          {
            model: Utilisateur,
            as: "sender",
            attributes: ["id", "prenom", "nom", "email", "role"],
          },
        ],
      },
    ],
  });
  if (!thread) {
    throw new ApiError({ status: 404, code: "THREAD_NOT_FOUND", message: "المحادثة غير موجودة" });
  }
  const unreadMap = await fetchUnreadCounts(userId, [thread.id]);
  const last = sanitizeMessageForRole(thread.lastMessage, role);
  return {
    id: Number(thread.id),
    title: thread.title,
    isGroup: Boolean(thread.is_group),
    archived: Boolean(thread.archived),
    updatedAt: thread.updated_at,
    unreadCount: unreadMap.get(Number(thread.id)) || 0,
    lastMessage: last ? buildMessagePayload(last) : null,
    participants: thread.participants
      .map((participant) => buildParticipantPayload(participant, userId))
      .filter(Boolean),
  };
}

async function listMessages(userId, threadId, params = {}) {
  const participant = await ensureThreadParticipant(userId, threadId);
  const limit = normalizeLimit(params.limit, MESSAGE_PAGE_SIZE, MESSAGE_PAGE_SIZE);
  const where = { thread_id: threadId };

  if (params.cursor && params.cursor.createdAt && params.cursor.id) {
    const createdAt = new Date(params.cursor.createdAt);
    const id = Number(params.cursor.id);
    if (!Number.isNaN(id)) {
      where[Op.or] = [
        { created_at: { [Op.lt]: createdAt } },
        { created_at: createdAt, id: { [Op.lt]: id } },
      ];
    }
  }

  const messages = await Message.findAll({
    where,
    include: [
      {
        model: Utilisateur,
        as: "sender",
        attributes: ["id", "prenom", "nom", "email", "role"],
      },
      {
        model: Attachment,
        as: "attachments",
        through: { attributes: [] },
      },
      {
        model: MessageReadReceipt,
        as: "readReceipts",
        attributes: ["user_id"],
      },
    ],
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
    ],
    limit: limit + 1,
  });

  const hasMore = messages.length > limit;
  const sliced = hasMore ? messages.slice(0, limit) : messages;
  const role = participant.role;
  const sanitized = sliced
    .filter((message) => sanitizeMessageForRole(message, role))
    .map(buildMessagePayload)
    .reverse();

  const nextCursor = hasMore
    ? {
        id: String(sliced[sliced.length - 1].id),
        createdAt: sliced[sliced.length - 1].created_at,
      }
    : null;

  return { data: sanitized, nextCursor };
}

async function createThread({ actorId, participantIds = [], title = null, isGroup = false }) {
  const uniqueIds = Array.from(new Set([actorId, ...participantIds.map(Number)])).filter(Boolean);
  if (uniqueIds.length < 2) {
    throw new ApiError({
      status: 400,
      code: "THREAD_PARTICIPANTS_MIN",
      message: "يلزم اختيار مشاركين للمحادثة",
    });
  }

  const users = await Utilisateur.findAll({
    where: { id: uniqueIds },
    attributes: ["id", "role", "prenom", "nom", "email", "avatar_url"],
  });
  if (users.length !== uniqueIds.length) {
    throw new ApiError({ status: 400, code: "THREAD_USER_INVALID", message: "مشارك غير صالح" });
  }

  const transaction = await sequelize.transaction();
  try {
    const thread = await Thread.create(
      {
        title,
        is_group: Boolean(isGroup),
      },
      { transaction }
    );

    const now = new Date();
    await ThreadParticipant.bulkCreate(
      users.map((user) => ({
        thread_id: thread.id,
        user_id: user.id,
        role: user.role,
        joined_at: now,
      })),
      { transaction }
    );

    await transaction.commit();

    const fullThread = await getThread(actorId, thread.id, users.find((u) => u.id === actorId)?.role);
    return fullThread;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

function pruneRateLimit(userId) {
  const now = Date.now();
  const timestamps = rateLimiter.get(userId) || [];
  const filtered = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  rateLimiter.set(userId, filtered);
  return filtered;
}

async function sendMessage({ userId, threadId, text, attachments = [] }) {
  if (text && text.length > MAX_TEXT_LENGTH) {
    throw new ApiError({
      status: 400,
      code: "MESSAGE_TOO_LONG",
      message: "الرسالة تتجاوز الحد المسموح به",
    });
  }
  await ensureThreadParticipant(userId, threadId);

  const recent = pruneRateLimit(userId);
  if (recent.length >= RATE_LIMIT_MAX) {
    throw new ApiError({
      status: 429,
      code: "MESSAGE_RATE_LIMITED",
      message: "تم إرسال عدد كبير من الرسائل، الرجاء المحاولة لاحقًا",
    });
  }

  if (!text && (!attachments || attachments.length === 0)) {
    throw new ApiError({
      status: 400,
      code: "MESSAGE_EMPTY",
      message: "لا يمكن إرسال رسالة فارغة",
    });
  }

  const transaction = await sequelize.transaction();
  try {
    const message = await Message.create(
      {
        thread_id: threadId,
        sender_id: userId,
        kind: attachments.length > 0 && !text ? "attachment" : "text",
        text: text || null,
      },
      { transaction }
    );

    let attachmentRecords = [];
    if (attachments.length) {
      attachmentRecords = await Attachment.bulkCreate(
        attachments.map((file) => ({
          uploader_id: userId,
          name: file.name,
          mime: file.mime || null,
          size: file.size || 0,
          storage_key: file.storageKey || file.storage_key || randomUUID(),
        })),
        { transaction }
      );

      await MessageAttachment.bulkCreate(
        attachmentRecords.map((record) => ({
          message_id: message.id,
          attachment_id: record.id,
        })),
        { transaction }
      );
    }

    await Thread.update(
      { last_message_id: message.id, updated_at: new Date() },
      { where: { id: threadId }, transaction }
    );

    await transaction.commit();

    const fullMessage = await Message.findByPk(message.id, {
      include: [
        { model: Utilisateur, as: "sender", attributes: ["id", "prenom", "nom", "email", "role"] },
        { model: Attachment, as: "attachments", through: { attributes: [] } },
        { model: MessageReadReceipt, as: "readReceipts", attributes: ["user_id"] },
      ],
    });

    rateLimiter.get(userId)?.push(Date.now());

    return buildMessagePayload(fullMessage);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function markRead({ userId, threadId, upToMessageId = null }) {
  await ensureThreadParticipant(userId, threadId);

  const where = {
    thread_id: threadId,
  };
  if (upToMessageId) {
    where.id = { [Op.lte]: upToMessageId };
  }

  const messages = await Message.findAll({
    where,
    attributes: ["id"],
  });
  if (!messages.length) return { updated: 0 };

  const rows = messages.map((msg) => ({
    message_id: msg.id,
    user_id: userId,
    read_at: new Date(),
  }));

  await MessageReadReceipt.bulkCreate(rows, {
    updateOnDuplicate: ["read_at", "updated_at"],
  });

  return { updated: rows.length };
}

async function unreadCount(userId) {
  const [result] = await sequelize.query(
    `SELECT COUNT(*) AS total FROM (
      SELECT m.id
      FROM messages m
      INNER JOIN thread_participants tp
        ON tp.thread_id = m.thread_id AND tp.user_id = :userId AND (tp.left_at IS NULL OR tp.left_at > NOW())
      LEFT JOIN message_read_receipts r
        ON r.message_id = m.id AND r.user_id = :userId
      WHERE m.sender_id <> :userId AND r.id IS NULL
    ) AS pending`,
    {
      replacements: { userId },
      type: QueryTypes.SELECT,
    }
  );
  return Number(result?.total || 0);
}

function setTyping({ userId, threadId, on }) {
  if (!typingState.has(threadId)) {
    typingState.set(threadId, new Map());
  }
  const threadTyping = typingState.get(threadId);
  if (on) {
    threadTyping.set(userId, Date.now() + TYPING_TTL_MS);
  } else {
    threadTyping.delete(userId);
  }
  return Array.from(threadTyping.entries())
    .filter(([, expires]) => expires > Date.now())
    .map(([id]) => Number(id));
}

function getTyping(threadId) {
  const threadTyping = typingState.get(threadId);
  if (!threadTyping) return [];
  const now = Date.now();
  for (const [key, expires] of threadTyping.entries()) {
    if (expires <= now) threadTyping.delete(key);
  }
  return Array.from(threadTyping.keys()).map((id) => Number(id));
}

function buildFullName(user) {
  return [user?.prenom, user?.nom].filter(Boolean).join(" ").trim();
}

async function findThreadForParticipants(userIds = []) {
  if (!userIds.length) return null;
  const rows = await ThreadParticipant.findAll({
    where: {
      user_id: { [Op.in]: userIds },
      [Op.or]: [{ left_at: null }, { left_at: { [Op.gt]: new Date() } }],
    },
    attributes: ["thread_id", "user_id"],
  });

  const presence = new Map();
  for (const row of rows) {
    const id = Number(row.thread_id);
    if (!presence.has(id)) presence.set(id, new Set());
    presence.get(id).add(Number(row.user_id));
  }

  const candidates = Array.from(presence.entries())
    .filter(([, participants]) => userIds.every((id) => participants.has(Number(id))))
    .map(([threadId]) => threadId);

  if (!candidates.length) return null;

  return Thread.findOne({
    where: { id: candidates, archived: false },
    order: [["updated_at", "DESC"]],
  });
}

async function ensureEducateurParentThread({ educateurId, enfantId, anneeId = null }) {
  if (!Number.isInteger(Number(enfantId)) || Number(enfantId) <= 0) {
    throw new ApiError({ status: 422, message: "Identifiant enfant invalide" });
  }

  const { anneeId: activeYearId } = await educatorAccess.assertCanAccessChild(
    educateurId,
    enfantId
  );

  if (anneeId && Number(anneeId) !== Number(activeYearId)) {
    throw new ApiError({
      status: 403,
      message: "Année scolaire non autorisée pour cet éducateur",
    });
  }

  const enfant = await Enfant.findByPk(enfantId, {
    attributes: ["id", "prenom", "nom", "parent_user_id"],
  });
  if (!enfant) {
    throw new ApiError({ status: 404, message: "Enfant introuvable" });
  }
  if (!enfant.parent_user_id) {
    throw new ApiError({ status: 404, message: "Aucun parent lié à cet enfant" });
  }

  const parent = await Utilisateur.findByPk(enfant.parent_user_id, {
    attributes: ["id", "prenom", "nom", "email", "role"],
  });
  if (!parent) {
    throw new ApiError({ status: 404, message: "Parent introuvable" });
  }

  const existingThread = await findThreadForParticipants([
    Number(educateurId),
    Number(parent.id),
  ]);

  const payload = {
    threadId: existingThread ? Number(existingThread.id) : null,
    enfant: {
      id: enfant.id,
      prenom: enfant.prenom,
      nom: enfant.nom,
    },
    parent: {
      id: Number(parent.id),
      prenom: parent.prenom,
      nom: parent.nom,
    },
    created: false,
  };

  if (existingThread) {
    return payload;
  }

  const title = buildFullName(enfant) || `Enfant ${enfant.id}`;
  const thread = await createThread({
    actorId: educateurId,
    participantIds: [parent.id],
    title,
    isGroup: false,
  });

  return { ...payload, threadId: Number(thread.id), created: true };
}

module.exports = {
  createThread,
  listThreads,
  getThread,
  listMessages,
  sendMessage,
  markRead,
  unreadCount,
  setTyping,
  getTyping,
  ensureEducateurParentThread,
};
