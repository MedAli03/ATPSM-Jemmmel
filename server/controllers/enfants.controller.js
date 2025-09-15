"use strict";

const svc = require("../services/enfant.service");
const {
  listEnfantsQuerySchema,
  createEnfantSchema,
  updateEnfantSchema,
  idParamSchema,
  linkParentSchema,
  createParentAccountSchema,
  enfantIdParamSchema,
} = require("../validations/enfants.schema");

// List
exports.list = async (req, res, next) => {
  try {
    const { error, value } = listEnfantsQuerySchema.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      error.status = 422;
      return next(error);
    }
    const data = await svc.list(value);
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

// Get
exports.get = async (req, res, next) => {
  try {
    const { error } = idParamSchema.validate(req.params);
    if (error) {
      error.status = 422;
      return next(error);
    }
    const data = await svc.get(req.params.id, req.user);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

// Create
exports.create = async (req, res, next) => {
  try {
    const { error, value } = createEnfantSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      error.status = 422;
      return next(error);
    }
    const data = await svc.create(value);
    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

// Update
exports.update = async (req, res, next) => {
  try {
    const ve = idParamSchema.validate(req.params);
    if (ve.error) {
      ve.error.status = 422;
      return next(ve.error);
    }
    const { error, value } = updateEnfantSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      error.status = 422;
      return next(error);
    }
    const data = await svc.update(req.params.id, value);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

// Delete
exports.remove = async (req, res, next) => {
  try {
    const { error } = idParamSchema.validate(req.params);
    if (error) {
      error.status = 422;
      return next(error);
    }
    const data = await svc.remove(req.params.id);
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};

// Link / Unlink
exports.linkParent = async (req, res, next) => {
  try {
    const ve = idParamSchema.validate(req.params);
    if (ve.error) {
      ve.error.status = 422;
      return next(ve.error);
    }
    const { error, value } = linkParentSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      error.status = 422;
      return next(error);
    }
    const data = await svc.linkParent(req.params.id, value.parent_user_id);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.unlinkParent = async (req, res, next) => {
  try {
    const { error } = idParamSchema.validate(req.params);
    if (error) {
      error.status = 422;
      return next(error);
    }
    const data = await svc.unlinkParent(req.params.id);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

// Helper: create parent account from parents_fiche
exports.createParentAccount = async (req, res, next) => {
  try {
    const pe = enfantIdParamSchema.validate(req.params);
    if (pe.error) {
      pe.error.status = 422;
      return next(pe.error);
    }
    const { error, value } = createParentAccountSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      error.status = 422;
      return next(error);
    }
    const data = await svc.createParentAccount(
      req.params.enfantId,
      value,
      req.user
    );
    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

// Parent self-view
exports.listMine = async (req, res, next) => {
  try {
    const { error, value } = listEnfantsQuerySchema.validate(req.query, {
      abortEarly: false,
    });
    if (error) {
      error.status = 422;
      return next(error);
    }
    const data = await svc.listForParent(req.user.id, value);
    res.json({ ok: true, ...data });
  } catch (e) {
    next(e);
  }
};
