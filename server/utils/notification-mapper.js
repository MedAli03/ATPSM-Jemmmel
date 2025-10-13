"use strict";

function toDTO(row) {
  if (!row) return null;
  const plain = typeof row.get === "function" ? row.get({ plain: true }) : row;
  if (!plain) return null;

  const type = (plain.type || "info").toLowerCase();

  return {
    id: plain.id,
    user_id: plain.utilisateur_id,
    type,
    title: plain.titre || "",
    body: plain.corps || "",
    icon: plain.icon || null,
    action_url: plain.action_url || null,
    payload: plain.payload || null,
    read: Boolean(plain.lu_le),
    read_at: plain.lu_le || null,
    created_at: plain.created_at || plain.createdAt || null,
    updated_at: plain.updated_at || plain.updatedAt || null,
  };
}

function forClient(row) {
  const dto = toDTO(row);
  if (!dto) return null;
  const { user_id: _userId, ...rest } = dto;
  return rest;
}

module.exports = {
  toDTO,
  forClient,
};
