"use strict";

const service = require("../services/observation_initiale.service");

exports.list = async (req, res, next) => {
  try {
    const data = await service.list(req.query);
    res.json({ ok: true, ...data });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const data = await service.get(req.params.id);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.create(req.body, req.user);
    res.status(201).json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.id, req.body, req.user);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await service.remove(req.params.id, req.user);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};
