"use strict";

const Joi = require("joi");

const threadIdParam = Joi.object({
  threadId: Joi.number().integer().positive().required(),
});

const listThreadsQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
  search: Joi.string().max(200).allow("", null).optional(),
});

const listMessagesQuery = Joi.object({
  cursor: Joi.string().optional(),
  limit: Joi.number().integer().min(1).max(50).default(20),
});

const sendMessageBody = Joi.object({
  body: Joi.string().trim().min(1).required(),
  attachments: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().max(255).optional(),
        mimeType: Joi.string().max(100).optional(),
        size: Joi.number().integer().min(0).optional(),
        data: Joi.string().required(),
      })
    )
    .max(5)
    .optional(),
});

const typingBody = Joi.object({
  isTyping: Joi.boolean().required(),
});

module.exports = {
  threadIdParam,
  listThreadsQuery,
  listMessagesQuery,
  sendMessageBody,
  typingBody,
};
