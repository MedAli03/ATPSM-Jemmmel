"use strict";

const service = require("../services/messages.service");

exports.listThreads = async (req, res, next) => {
  try {
    const result = await service.listThreads(req.user, req.query);
    res.json({
      ok: true,
      data: {
        threads: result.threads,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getThread = async (req, res, next) => {
  try {
    const thread = await service.getThread(req.user, Number(req.params.threadId));
    res.json({ ok: true, data: { thread } });
  } catch (error) {
    next(error);
  }
};

exports.listMessages = async (req, res, next) => {
  try {
    const { messages, pageInfo } = await service.listMessages(
      req.user,
      Number(req.params.threadId),
      req.query
    );
    res.json({
      ok: true,
      data: {
        messages,
        pageInfo,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const message = await service.sendMessage(
      req.user,
      Number(req.params.threadId),
      req.body
    );
    res.status(201).json({ ok: true, data: { message } });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const result = await service.markAsRead(
      req.user,
      Number(req.params.threadId)
    );
    res.json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getTypingStatus = async (req, res, next) => {
  try {
    const status = await service.getTypingStatus(
      req.user,
      Number(req.params.threadId)
    );
    res.json({ ok: true, data: status });
  } catch (error) {
    next(error);
  }
};

exports.setTypingStatus = async (req, res, next) => {
  try {
    const status = await service.setTypingStatus(
      req.user,
      Number(req.params.threadId),
      req.body.isTyping
    );
    res.json({ ok: true, data: status });
  } catch (error) {
    next(error);
  }
};
