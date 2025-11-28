"use strict";

const repo = require("../repos/parent_child_read_state.repo");

exports.findStatesForParent = (parentId, childIds = []) =>
  repo.findStates(parentId, childIds);

exports.markDailyNotesSeen = (parentId, childId, seenAt = new Date()) =>
  repo.touchDailyNotes(parentId, childId, seenAt);

exports.markMessagesSeen = (parentId, childId, seenAt = new Date()) =>
  repo.touchMessages(parentId, childId, seenAt);
