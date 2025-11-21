"use strict";

const Joi = require("joi");

const numericId = Joi.number().integer().positive();

// Participants must be at least one numeric id
const createThreadSchema = Joi.object({
  participantIds: Joi.array().items(numericId).min(1).required(),
  title: Joi.string().allow(null, "").max(255),
  text: Joi.string().min(1).max(2000).required(),
  isGroup: Joi.boolean().optional(),
});

const sendMessageSchema = Joi.object({
  text: Joi.string().min(1).max(2000).required(),
  attachments: Joi.array().items(Joi.object()).default([]),
});

const threadIdParamSchema = Joi.object({
  threadId: numericId.required(),
});

module.exports = {
  createThreadSchema,
  sendMessageSchema,
  threadIdParamSchema,
};
