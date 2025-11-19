"use strict";

const bcrypt = require("bcrypt");
const { QueryTypes } = require("sequelize");
const SALT_ROUNDS = 10;

const { sequelize, Enfant, Utilisateur, ParentsFiche } = require("../models");
const repo = require("../repos/enfant.repo");
const educatorAccess = require("./educateur_access.service");

function toPlainChild(child) {
  if (!child) return null;
  if (typeof child.get === "function") {
    return child.get({ plain: true });
  }
  return { ...child };
}

async function fetchParentChildThreadMap(parentId, childIds) {
  if (!Array.isArray(childIds) || childIds.length === 0) {
    return new Map();
  }
  const rows = await sequelize.query(
    `SELECT t.enfant_id AS enfantId, t.id AS threadId
     FROM threads t
     INNER JOIN thread_participants tp
       ON tp.thread_id = t.id
       AND tp.user_id = :parentId
       AND (tp.left_at IS NULL OR tp.left_at > NOW())
     WHERE t.enfant_id IN (:childIds)
     ORDER BY t.updated_at DESC, t.id DESC`,
    { replacements: { parentId, childIds }, type: QueryTypes.SELECT }
  );
  const map = new Map();
  rows.forEach((row) => {
    const enfantId = Number(row.enfantId);
    if (Number.isNaN(enfantId) || map.has(enfantId)) return;
    map.set(enfantId, Number(row.threadId));
  });
  return map;
}

async function fetchUnreadMessagesByChild(parentId, childIds) {
  if (!Array.isArray(childIds) || childIds.length === 0) {
    return new Map();
  }
  const rows = await sequelize.query(
    `SELECT t.enfant_id AS enfantId, COUNT(*) AS unread
     FROM threads t
     INNER JOIN thread_participants tp
       ON tp.thread_id = t.id
       AND tp.user_id = :parentId
       AND (tp.left_at IS NULL OR tp.left_at > NOW())
     INNER JOIN messages m ON m.thread_id = t.id
     LEFT JOIN message_read_receipts r
       ON r.message_id = m.id AND r.user_id = :parentId
     WHERE t.enfant_id IN (:childIds)
       AND t.enfant_id IS NOT NULL
       AND m.sender_id <> :parentId
       AND r.id IS NULL
     GROUP BY t.enfant_id`,
    { replacements: { parentId, childIds }, type: QueryTypes.SELECT }
  );
  const map = new Map();
  rows.forEach((row) => {
    const enfantId = Number(row.enfantId);
    if (Number.isNaN(enfantId)) return;
    map.set(enfantId, Number(row.unread) || 0);
  });
  return map;
}

async function fetchUnreadNotesByChild(parentId, childIds) {
  if (!Array.isArray(childIds) || childIds.length === 0) {
    return new Set();
  }
  const rows = await sequelize.query(
    `SELECT CAST(JSON_UNQUOTE(JSON_EXTRACT(n.payload, '$.enfant_id')) AS UNSIGNED) AS enfantId
     FROM notifications n
     WHERE n.utilisateur_id = :parentId
       AND n.lu_le IS NULL
       AND n.type = 'note'
       AND JSON_EXTRACT(n.payload, '$.enfant_id') IS NOT NULL
       AND CAST(JSON_UNQUOTE(JSON_EXTRACT(n.payload, '$.enfant_id')) AS UNSIGNED) IN (:childIds)
     GROUP BY enfantId`,
    { replacements: { parentId, childIds }, type: QueryTypes.SELECT }
  );
  const set = new Set();
  rows.forEach((row) => {
    const enfantId = Number(row.enfantId);
    if (!Number.isNaN(enfantId)) {
      set.add(enfantId);
    }
  });
  return set;
}

exports.list = async (q, currentUser) => {
  if (currentUser?.role === "EDUCATEUR") {
    return educatorAccess.listChildrenForEducateurCurrentYear(currentUser.id, {
      search: q.q,
      page: q.page,
      limit: q.limit,
    });
  }
  return repo.findAll({ q: q.q }, { page: q.page, limit: q.limit });
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
  const rawRows = Array.isArray(data.rows) ? data.rows : [];
  const plainRows = rawRows.map(toPlainChild).filter(Boolean);
  const childIds = plainRows
    .map((child) => Number(child.id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (!childIds.length) {
    return { ...data, rows: plainRows };
  }

  const [threadMap, unreadMessagesMap, unreadNotesSet] = await Promise.all([
    fetchParentChildThreadMap(parentId, childIds),
    fetchUnreadMessagesByChild(parentId, childIds),
    fetchUnreadNotesByChild(parentId, childIds),
  ]);

  const enrichedRows = plainRows.map((child) => {
    const childId = Number(child.id);
    const computedThreadId = threadMap.get(childId);
    const hasUnreadNote = unreadNotesSet.has(childId);
    return {
      ...child,
      thread_id:
        typeof child.thread_id === "number" && Number.isFinite(child.thread_id)
          ? child.thread_id
          : computedThreadId ?? null,
      has_unread_note: hasUnreadNote,
      has_unread_daily_note: hasUnreadNote,
      unread_messages_count: unreadMessagesMap.get(childId) || 0,
    };
  });

  return { ...data, rows: enrichedRows };
};

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
