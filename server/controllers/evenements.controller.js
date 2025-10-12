"use strict";

const svc = require("../services/evenements.service");

exports.list = async (req, res, next) => {
  try {
    const data = await svc.list(req.query);
    res.json({
      ok: true,
      data: data.rows,
      meta: {
        total: data.count,
        page: data.page,
        limit: data.limit,
      },
    });
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await svc.get(req.params.id);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.upcoming = async (req, res, next) => {
  try {
    const data = await svc.listUpcoming(req.query);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await svc.create(req.body, req.user);
    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await svc.update(req.params.id, req.body);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await svc.remove(req.params.id);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
