"use strict";

const svc = require("../services/fiche_enfant.service");
const Joi = require("joi");
const {
  enfantIdParamSchema,
  upsertFicheSchema,
} = require("../validations/fiche_enfant.schema");

// GET /enfants/:enfantId/fiche
exports.get = async (req, res, next) => {
  try {
    const { error } = enfantIdParamSchema.validate(req.params);
    if (error) {
      error.status = 422;
      return next(error);
    }
    const data = await svc.getByEnfant(req.params.enfantId);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

// PUT /enfants/:enfantId/fiche (upsert)
exports.upsert = async (req, res, next) => {
  try {
    const ve = enfantIdParamSchema.validate(req.params);
    if (ve.error) {
      ve.error.status = 422;
      return next(ve.error);
    }

    const { error, value } = upsertFicheSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      error.status = 422;
      return next(error);
    }

    const data = await svc.upsert(req.params.enfantId, value);
    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
