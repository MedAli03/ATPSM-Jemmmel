"use strict";

const svc = require("../services/actualites.service");

exports.list = async (req, res, next) => {
  try {
    const data = await svc.list(req.query);
    res.json({
      data: data.items,
      meta: {
        total: data.total,
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
    res.json({ data, meta: null });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await svc.create(req.body, req.user);
    res.status(201).json({ data, meta: null });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await svc.update(req.params.id, req.body, req.user);
    res.json({ data, meta: null });
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await svc.remove(req.params.id);
    res.json({ data, meta: null });
  } catch (e) {
    next(e);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const data = await svc.updateStatus(req.params.id, req.body);
    res.json({ data, meta: null });
  } catch (e) {
    next(e);
  }
};

exports.togglePin = async (req, res, next) => {
  try {
    const data = await svc.togglePin(req.params.id, req.body.epingle);
    res.json({ data, meta: null });
  } catch (e) {
    next(e);
  }
};
