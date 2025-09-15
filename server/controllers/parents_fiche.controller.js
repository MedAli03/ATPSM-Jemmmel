"use strict";

const svc = require("../services/parents_fiche.service");
const {
  enfantIdParamSchema,
  upsertParentsFicheSchema,
} = require("../validations/parents_fiche.schema");

// GET /enfants/:enfantId/parents-fiche
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

// PUT /enfants/:enfantId/parents-fiche  (UPsert)
exports.upsert = async (req, res, next) => {
  try {
    const ve = enfantIdParamSchema.validate(req.params);
    if (ve.error) {
      ve.error.status = 422;
      return next(ve.error);
    }

    const { error, value } = upsertParentsFicheSchema.validate(req.body, {
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
