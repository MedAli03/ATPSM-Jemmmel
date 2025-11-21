"use strict";

const { Op } = require("sequelize");
const { ParentChildReadState } = require("../models");

exports.findStates = (parentId, childIds = []) => {
  if (!parentId || !childIds.length) {
    return Promise.resolve([]);
  }
  return ParentChildReadState.findAll({
    where: {
      parent_id: parentId,
      child_id: { [Op.in]: childIds },
    },
  });
};

exports.touchDailyNotes = async (parentId, childId, seenAt = new Date()) => {
  if (!parentId || !childId) return null;
  const [state] = await ParentChildReadState.findOrCreate({
    where: { parent_id: parentId, child_id: childId },
    defaults: { last_daily_note_seen_at: seenAt, last_message_seen_at: null },
  });
  state.last_daily_note_seen_at = seenAt;
  await state.save();
  return state;
};

exports.touchMessages = async (parentId, childId, seenAt = new Date()) => {
  if (!parentId || !childId) return null;
  const [state] = await ParentChildReadState.findOrCreate({
    where: { parent_id: parentId, child_id: childId },
    defaults: { last_daily_note_seen_at: null, last_message_seen_at: seenAt },
  });
  state.last_message_seen_at = seenAt;
  await state.save();
  return state;
};
