"use strict";

const svc = require("../services/notifications.broadcast.service");

exports.broadcast = async (req, res, next) => {
  try {
    const data = await svc.broadcast(req.body, req.user);
    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
