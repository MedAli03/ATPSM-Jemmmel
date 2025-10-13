"use strict";

const svc = require("../services/notifications.user.service");
const realtime = require("../realtime");

exports.stream = (req, res) => {
  realtime.stream(req, res);
};

exports.listMine = async (req, res, next) => {
  try {
    const { items, meta } = await svc.listMine(req.user, req.query);
    res.json({ ok: true, data: items, meta });
  } catch (e) {
    next(e);
  }
};

exports.getMine = async (req, res, next) => {
  try {
    const notification = await svc.getMine(req.user, req.params.id);
    res.json({ ok: true, data: notification });
  } catch (e) {
    next(e);
  }
};

exports.unreadCount = async (req, res, next) => {
  try {
    const count = await svc.unreadCount(req.user);
    res.json({ ok: true, data: { count } });
  } catch (e) {
    next(e);
  }
};

exports.readOne = async (req, res, next) => {
  try {
    const { updated, data, unread } = await svc.readOne(
      req.user,
      req.params.id
    );
    res.json({ ok: true, data, meta: { updated, unread } });
  } catch (e) {
    next(e);
  }
};

exports.readAll = async (req, res, next) => {
  try {
    const { updated } = await svc.readAll(req.user);
    res.json({ ok: true, data: { updated }, meta: { unread: 0 } });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await svc.removeOne(req.user, req.params.id);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
