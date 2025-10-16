"use strict";

const { Op, QueryTypes } = require("sequelize");
const {
  sequelize,
  Thread,
  ThreadParticipant,
  Message,
  MessageAttachment,
  Utilisateur,
} = require("../models");

const THREAD_PAGE_LIMIT = 12;
const MESSAGE_PAGE_LIMIT = 20;

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

exports.ensureParticipant = (threadId, userId, t = null) =>
  ThreadParticipant.findOne({
    where: { thread_id: threadId, utilisateur_id: userId },
    transaction: t,
  });

exports.listThreadsForUser = async (
  userId,
  { page = 1, limit = THREAD_PAGE_LIMIT, search = "" } = {}
) => {
  const pageNumber = toPositiveInt(page, 1);
  const perPage = Math.min(toPositiveInt(limit, THREAD_PAGE_LIMIT), 50);
  const offset = (pageNumber - 1) * perPage;
  const searchTerm = String(search || "").trim();

  const replacements = {
    userId,
    limit: perPage,
    offset,
    search: searchTerm,
    likeSearch: `%${searchTerm}%`,
  };

  const searchClause = searchTerm
    ? "AND (t.sujet LIKE :likeSearch OR u2.nom LIKE :likeSearch OR u2.prenom LIKE :likeSearch OR u2.email LIKE :likeSearch)"
    : "";

  const [idRows, countRows] = await Promise.all([
    sequelize.query(
      `SELECT DISTINCT t.id
       FROM threads t
       INNER JOIN thread_participants tp ON tp.thread_id = t.id AND tp.utilisateur_id = :userId
       LEFT JOIN thread_participants tp2 ON tp2.thread_id = t.id
       LEFT JOIN utilisateurs u2 ON u2.id = tp2.utilisateur_id
       WHERE 1 = 1 ${searchClause}
       ORDER BY t.updated_at DESC, t.id DESC
       LIMIT :limit OFFSET :offset`,
      {
        replacements,
        type: QueryTypes.SELECT,
      }
    ),
    sequelize.query(
      `SELECT COUNT(DISTINCT t.id) AS total
       FROM threads t
       INNER JOIN thread_participants tp ON tp.thread_id = t.id AND tp.utilisateur_id = :userId
       LEFT JOIN thread_participants tp2 ON tp2.thread_id = t.id
       LEFT JOIN utilisateurs u2 ON u2.id = tp2.utilisateur_id
       WHERE 1 = 1 ${searchClause}`,
      {
        replacements,
        type: QueryTypes.SELECT,
      }
    ),
  ]);

  const threadIds = idRows.map((row) => row.id);
  const total = countRows?.[0]?.total ? Number(countRows[0].total) : 0;

  if (!threadIds.length) {
    return { rows: [], total, page: pageNumber, limit: perPage };
  }

  const threads = await Thread.findAll({
    where: { id: threadIds },
    include: [
      {
        association: "participants",
        include: [
          {
            association: "utilisateur",
            attributes: ["id", "nom", "prenom", "email", "role"],
          },
        ],
      },
      {
        association: "messages",
        separate: true,
        limit: 1,
        order: [
          ["created_at", "DESC"],
          ["id", "DESC"],
        ],
        include: [
          {
            association: "expediteur",
            attributes: ["id", "nom", "prenom", "email", "role"],
          },
          {
            association: "attachments",
            attributes: [
              "id",
              "original_name",
              "mime_type",
              "size",
              "public_url",
            ],
            required: false,
            separate: false,
            order: [["id", "ASC"]],
          },
        ],
      },
    ],
  });

  const participantRecords = await ThreadParticipant.findAll({
    where: { thread_id: threadIds, utilisateur_id: userId },
  });
  const participantMap = new Map(
    participantRecords.map((record) => [record.thread_id, record])
  );

  const unreadRows = await sequelize.query(
    `SELECT m.thread_id, COUNT(*) AS unread
     FROM messages m
     INNER JOIN thread_participants tp ON tp.thread_id = m.thread_id AND tp.utilisateur_id = :userId
     WHERE m.thread_id IN (:threadIds)
       AND m.expediteur_id <> :userId
       AND (tp.last_read_at IS NULL OR m.created_at > tp.last_read_at)
     GROUP BY m.thread_id`,
    {
      replacements: { userId, threadIds },
      type: QueryTypes.SELECT,
    }
  );

  const unreadMap = new Map(
    unreadRows.map((row) => [Number(row.thread_id), Number(row.unread)])
  );

  const orderedThreads = threadIds
    .map((id) => threads.find((thread) => thread.id === id))
    .filter(Boolean)
    .map((thread) => {
      const plain = thread.get({ plain: true });
      const lastMessage = plain.messages?.[0] || null;
      const participation = participantMap.get(thread.id);
      const participants = (plain.participants || []).map((participant) => {
        const user = participant.utilisateur || {};
        return {
          id: user.id,
          role: user.role,
          name: [user.prenom, user.nom].filter(Boolean).join(" ") || user.email,
        };
      });
      return {
        id: thread.id,
        title: plain.sujet,
        updatedAt: plain.updated_at,
        createdAt: plain.created_at,
        unreadCount: unreadMap.get(thread.id) || 0,
        lastReadAt: participation?.last_read_at || null,
        participants,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              body: lastMessage.texte,
              createdAt: lastMessage.created_at,
              senderId: lastMessage.expediteur_id,
              senderName:
                [
                  lastMessage.expediteur?.prenom,
                  lastMessage.expediteur?.nom,
                ]
                  .filter(Boolean)
                  .join(" ") || lastMessage.expediteur?.email || null,
            }
          : null,
      };
    });

  return {
    rows: orderedThreads,
    total,
    page: pageNumber,
    limit: perPage,
  };
};

exports.findThreadForUser = async (threadId, userId) =>
  Thread.findOne({
    where: { id: threadId },
    include: [
      {
        association: "participants",
        where: { utilisateur_id: userId },
        required: true,
      },
    ],
  });

exports.getThreadDetails = async (threadId) =>
  Thread.findByPk(threadId, {
    include: [
      {
        association: "participants",
        include: [
          {
            association: "utilisateur",
            attributes: ["id", "nom", "prenom", "email", "role"],
          },
        ],
      },
      {
        association: "enfant",
        attributes: ["id", "prenom", "nom"],
      },
      {
        association: "creator",
        attributes: ["id", "nom", "prenom", "email", "role"],
      },
    ],
  });

exports.listMessages = async (
  threadId,
  { cursor = null, limit = MESSAGE_PAGE_LIMIT } = {}
) => {
  const perPage = Math.min(toPositiveInt(limit, MESSAGE_PAGE_LIMIT), 50);
  const where = { thread_id: threadId };
  if (cursor) {
    where.created_at = { [Op.lt]: cursor };
  }
  const messages = await Message.findAll({
    where,
    order: [
      ["created_at", "DESC"],
      ["id", "DESC"],
      [{ model: MessageAttachment, as: "attachments" }, "id", "ASC"],
    ],
    limit: perPage,
    include: [
      {
        association: "expediteur",
        attributes: ["id", "nom", "prenom", "email", "role"],
      },
      {
        association: "attachments",
        attributes: [
          "id",
          "original_name",
          "mime_type",
          "size",
          "public_url",
          "created_at",
        ],
        required: false,
      },
    ],
  });
  return messages;
};

exports.countUnreadForThread = async (threadId, userId) => {
  const rows = await sequelize.query(
    `SELECT COUNT(*) AS unread
     FROM messages m
     INNER JOIN thread_participants tp ON tp.thread_id = m.thread_id AND tp.utilisateur_id = :userId
     WHERE m.thread_id = :threadId
       AND m.expediteur_id <> :userId
       AND (tp.last_read_at IS NULL OR m.created_at > tp.last_read_at)`,
    {
      replacements: { threadId, userId },
      type: QueryTypes.SELECT,
    }
  );
  return rows?.[0]?.unread ? Number(rows[0].unread) : 0;
};

exports.createMessage = (payload, t = null) => Message.create(payload, { transaction: t });

exports.createMessageAttachments = (records, t = null) =>
  MessageAttachment.bulkCreate(records, { transaction: t });

exports.touchThread = (threadId, date = new Date(), t = null) =>
  Thread.update(
    { updated_at: date },
    { where: { id: threadId }, transaction: t }
  );

exports.updateLastRead = (threadId, userId, date, t = null) =>
  ThreadParticipant.update(
    { last_read_at: date, updated_at: new Date() },
    { where: { thread_id: threadId, utilisateur_id: userId }, transaction: t }
  );

exports.findParticipantUsers = (threadId) =>
  ThreadParticipant.findAll({
    where: { thread_id: threadId },
    include: [
      {
        association: "utilisateur",
        attributes: ["id", "nom", "prenom", "email", "role"],
      },
    ],
  });

exports.findUserById = (id) =>
  Utilisateur.findByPk(id, {
    attributes: ["id", "nom", "prenom", "email", "role"],
  });

exports.findMessageById = (id) =>
  Message.findByPk(id, {
    include: [
      {
        association: "expediteur",
        attributes: ["id", "nom", "prenom", "email", "role"],
      },
      {
        association: "attachments",
        attributes: [
          "id",
          "original_name",
          "mime_type",
          "size",
          "public_url",
          "created_at",
        ],
        required: false,
        order: [["id", "ASC"]],
      },
    ],
    order: [[{ model: MessageAttachment, as: "attachments" }, "id", "ASC"]],
  });
