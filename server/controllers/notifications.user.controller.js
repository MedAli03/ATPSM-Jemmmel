"use strict";

const svc = require("../services/notifications.user.service");

exports.listMine = async (req, res, next) => {
  try {
    const data = await svc.listMine(req.user, req.query);
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

exports.getMine = async (req, res, next) => {
  try {
    const data = await svc.getMine(req.user, req.params.id);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.unreadCount = async (req, res, next) => {
  try {
    const count = await svc.unreadCount(req.user);
    res.json({ ok: true, count });
  } catch (e) {
    next(e);
  }
};

exports.readOne = async (req, res, next) => {
  try {
    const data = await svc.readOne(req.user, req.params.id);
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

exports.readAll = async (req, res, next) => {
  try {
    const data = await svc.readAll(req.user);
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};
