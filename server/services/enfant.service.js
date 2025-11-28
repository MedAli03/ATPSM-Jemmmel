"use strict";

const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const { Op } = require("sequelize");
const {
  sequelize,
  Sequelize,
  Enfant,
  Utilisateur,
  ParentsFiche,
  DailyNote,
} = require("../models");
const repo = require("../repos/enfant.repo");
const educatorAccess = require("./educateur_access.service");
const parentChildReadStateService = require("./parent_child_read_state.service");

exports.list = async (q, currentUser) => {
  if (currentUser?.role === "EDUCATEUR") {
    return educatorAccess.listChildrenForEducateurCurrentYear(currentUser.id, {
      search: q.q,
      page: q.page,
      limit: q.limit,
    });
  }
  return repo.findAll(
    { q: q.q, parent_user_id: q.parent_user_id },
    { page: q.page, limit: q.limit }
  );
};

exports.get = async (id, currentUser) => {
  const enfant = await repo.findById(id);
  if (!enfant) {
    const e = new Error("Enfant introuvable");
    e.status = 404;
    throw e;
  }
  // If requester is PARENT, ensure ownership
  if (
    currentUser?.role === "PARENT" &&
    enfant.parent_user_id !== currentUser.id
  ) {
    const e = new Error("Accès refusé");
    e.status = 403;
    throw e;
  }
  if (currentUser?.role === "EDUCATEUR") {
    await educatorAccess.assertCanAccessChild(currentUser.id, id);
  }
  return enfant;
};

exports.create = async (payload) => {
  return sequelize.transaction(async (t) => {
    const enfant = await repo.create(
      {
        nom: payload.nom,
        prenom: payload.prenom,
        date_naissance: payload.date_naissance,
        parent_user_id:
          payload.parent_user_id != null
            ? Number(payload.parent_user_id)
            : null,
      },
      t
    );
    return enfant;
  });
};

exports.update = async (id, payload) => {
  return sequelize.transaction(async (t) => {
    const exists = await repo.findById(id, t);
    if (!exists) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }
    const n = await repo.updateById(id, payload, t);
    if (!n) {
      const e = new Error("Aucune modification");
      e.status = 400;
      throw e;
    }
    return repo.findById(id, t);
  });
};

exports.remove = async (id) => {
  return sequelize.transaction(async (t) => {
    const exists = await repo.findById(id, t);
    if (!exists) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }

    // If your DB FKs have ON DELETE CASCADE to fiche tables, this is enough.
    // If you need app-level cascade, delete here via repos before deleting enfant.

    await repo.deleteById(id, t);
    return { deleted: true };
  });
};

exports.linkParent = async (id, parent_user_id) => {
  return sequelize.transaction(async (t) => {
    const enfant = await repo.findById(id, t);
    if (!enfant) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }
    const parent = await Utilisateur.findOne({
      where: { id: parent_user_id, role: "PARENT", is_active: true },
      transaction: t,
    });
    if (!parent) {
      const e = new Error("Parent introuvable ou inactif");
      e.status = 404;
      throw e;
    }
    await repo.linkParent(id, parent_user_id, t);
    return repo.findById(id, t);
  });
};

exports.unlinkParent = async (id) => {
  return sequelize.transaction(async (t) => {
    const enfant = await repo.findById(id, t);
    if (!enfant) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }
    await repo.unlinkParent(id, t);
    return repo.findById(id, t);
  });
};

exports.listForParent = async (parentId, q) => {
  const data = await repo.findByParent(parentId, { page: q.page, limit: q.limit });
  const childIds = data.rows.map((row) => Number(row.id));
  if (!childIds.length) {
    return data;
  }

  const threadIds = [
    ...new Set(
      data.rows
        .map((row) => (row.thread_id ? Number(row.thread_id) : null))
        .filter(Boolean)
    ),
  ];

  const [states, noteAggregates, unreadMap] = await Promise.all([
    parentChildReadStateService.findStatesForParent(parentId, childIds),
    DailyNote.findAll({
      attributes: [
        "enfant_id",
        [sequelize.fn("MAX", sequelize.col("created_at")), "last_note_created_at"],
      ],
      where: { enfant_id: { [Op.in]: childIds } },
      group: ["enfant_id"],
      raw: true,
    }),
    fetchUnreadCountsForParent(parentId, threadIds),
  ]);

  const stateMap = new Map(states.map((state) => [Number(state.child_id), state]));
  const lastNoteMap = new Map(
    noteAggregates.map((row) => [
      Number(row.enfant_id),
      row.last_note_created_at ? new Date(row.last_note_created_at) : null,
    ])
  );

  data.rows.forEach((child) => {
    const state = stateMap.get(Number(child.id));
    const lastNoteAt = lastNoteMap.get(Number(child.id));
    let hasUnreadNote = false;
    if (state && lastNoteAt) {
      const lastSeen = state.last_daily_note_seen_at
        ? new Date(state.last_daily_note_seen_at)
        : null;
      hasUnreadNote = !lastSeen || lastNoteAt > lastSeen;
    }
    child.setDataValue("has_unread_note", hasUnreadNote);
    child.setDataValue("has_unread_daily_note", hasUnreadNote);

    const threadId = child.thread_id ? Number(child.thread_id) : null;
    const unreadMessages = threadId ? unreadMap.get(threadId) || 0 : 0;
    child.setDataValue("unread_messages_count", unreadMessages);
  });

  return data;
};

async function fetchUnreadCountsForParent(parentId, threadIds = []) {
  if (!threadIds.length) {
    return new Map();
  }
  const rows = await sequelize.query(
    `SELECT m.thread_id AS threadId, COUNT(*) AS unread
     FROM messages m
     INNER JOIN thread_participants tp
       ON tp.thread_id = m.thread_id
      AND tp.user_id = :parentId
      AND (tp.left_at IS NULL OR tp.left_at > NOW())
     LEFT JOIN message_read_receipts r
       ON r.message_id = m.id AND r.user_id = :parentId
     WHERE m.thread_id IN (:threadIds)
       AND r.id IS NULL
     GROUP BY m.thread_id`,
    {
      type: Sequelize.QueryTypes.SELECT,
      replacements: { parentId, threadIds },
    }
  );
  return new Map(rows.map((row) => [Number(row.threadId), Number(row.unread)]));
}

/**
 * Helper: create parent account from parents_fiche and link to child.
 * - Requires that parents_fiche exists for the child (to fill names/phones)
 * - Checks email uniqueness
 * - Hashes password
 * - Creates Utilisateur with role=PARENT
 * - Links enfant.parent_user_id
 */
exports.createParentAccount = async (
  enfantId,
  { email, mot_de_passe },
  currentUser
) => {
  return sequelize.transaction(async (t) => {
    // 1) Child must exist
    const enfant = await Enfant.findByPk(enfantId, { transaction: t });
    if (!enfant) {
      const e = new Error("Enfant introuvable");
      e.status = 404;
      throw e;
    }
    // 2) Must not already be linked
    if (enfant.parent_user_id) {
      const e = new Error("Un parent est déjà lié à cet enfant");
      e.status = 409;
      throw e;
    }
    // 3) parents_fiche must exist
    const pf = await ParentsFiche.findOne({
      where: { enfant_id: enfantId },
      transaction: t,
    });
    if (!pf) {
      const e = new Error(
        "Fiche parents introuvable. Veuillez la renseigner d'abord."
      );
      e.status = 409;
      throw e;
    }
    // 4) email unique among all users
    const emailUsed = await Utilisateur.findOne({
      where: { email },
      transaction: t,
    });
    if (emailUsed) {
      const e = new Error("Email déjà utilisé");
      e.status = 409;
      throw e;
    }
    // 5) Build display name from fiche
    const nom = pf.mere_nom || pf.pere_nom || "Parent";
    const prenom = pf.mere_prenom || pf.pere_prenom || "Compte";
    const telephone = pf.mere_tel_portable || pf.pere_tel_portable || null;

    // 6) Hash password
    const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);

    // 7) Create parent user
    const parentUser = await Utilisateur.create(
      {
        nom,
        prenom,
        email,
        mot_de_passe: hash,
        telephone,
        role: "PARENT",
        is_active: true,
        avatar_url: null,
      },
      { transaction: t }
    );

    // 8) Link child to new parent
    await Enfant.update(
      { parent_user_id: parentUser.id },
      { where: { id: enfantId }, transaction: t }
    );

    // 9) Return compact result
    const linked = await Enfant.findByPk(enfantId, { transaction: t });
    return {
      enfant: { id: linked.id, nom: linked.nom, prenom: linked.prenom },
      parent: {
        id: parentUser.id,
        email: parentUser.email,
        role: parentUser.role,
      },
      linked: true,
    };
  });
};
