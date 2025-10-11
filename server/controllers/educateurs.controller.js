"use strict";

const svc = require("../services/educateurs.service");
const validate = require("../middlewares/validate");
const {
  listEducateursQuerySchema,
  idParamSchema,
  createEducateurSchema,
  updateEducateurSchema,
} = require("../validations/educateurs.schema");

exports.list = [
  validate(listEducateursQuerySchema, "query"),
  async (req, res, next) => {
    try {
      const data = await svc.list(req.query);
      res.json({
        data: data.items,
        meta: { total: data.total, page: data.page, limit: data.limit },
      });
    } catch (e) {
      next(e);
    }
  },
];

exports.get = [
  validate(idParamSchema, "params"),
  async (req, res, next) => {
    try {
      const data = await svc.get(req.params.id, req.query || {});
      res.json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },
];

exports.create = [
  validate(createEducateurSchema),
  async (req, res, next) => {
    try {
      const data = await svc.create(req.body);
      res.status(201).json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },
];

exports.update = [
  validate(idParamSchema, "params"),
  validate(updateEducateurSchema),
  async (req, res, next) => {
    try {
      const data = await svc.update(req.params.id, req.body);
      res.json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },
];

exports.archive = [
  validate(idParamSchema, "params"),
  async (req, res, next) => {
    try {
      const data = await svc.archive(req.params.id);
      res.json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },
];

exports.unarchive = [
  validate(idParamSchema, "params"),
  async (req, res, next) => {
    try {
      const data = await svc.unarchive(req.params.id);
      res.json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },
];
