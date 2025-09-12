"use strict";

const service = require("../services/annees.service");

exports.list = async (req, res, next) => {
  try {
    const data = await service.list({ libelle: req.query.libelle });
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getActive = async (_req, res, next) => {
  try {
    const data = await service.getActive();
    res.json({ ok: true, data });
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
    const data = await service.create(req.body);
    res.status(201).json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.id, req.body);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

exports.activate = async (req, res, next) => {
  try {
    const data = await service.activate(req.params.id);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const data = await service.remove(req.params.id);
    res.json({ ok: true, data });
  } catch (err) {
    next(err);
  }
};
