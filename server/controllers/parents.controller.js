"use strict";

const svc = require("../services/parents.service");
const {
  parentIdParamSchema,
  createChildForParentSchema,
  linkExistingChildSchema,
} = require("../validations/parents_add_child.schema");
const {
  listParentsQuerySchema,
  idParamSchema,
  createParentSchema,
  updateParentSchema,
  changePasswordSchema,
} = require("../validations/parents.schema");

module.exports = {
  // GET /parents
  async list(req, res, next) {
    try {
      const { error, value } = listParentsQuerySchema.validate(req.query, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.list(value);
      res.json({
        data: data.items,
        meta: { total: data.total, page: data.page, limit: data.limit },
      });
    } catch (e) {
      next(e);
    }
  },

  // GET /parents/:id
  async get(req, res, next) {
    try {
      const { error } = idParamSchema.validate(req.params);
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.get(req.params.id);
      res.json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },

  // POST /parents
  async create(req, res, next) {
    try {
      const { error, value } = createParentSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.create(value);
      res.status(201).json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },

  // PUT /parents/:id
  async update(req, res, next) {
    try {
      const pe = idParamSchema.validate(req.params);
      if (pe.error) {
        pe.error.status = 422;
        return next(pe.error);
      }
      const { error, value } = updateParentSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.update(req.params.id, value);
      res.json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },

  // PATCH /parents/:id/change-password
  async changePassword(req, res, next) {
    try {
      const pe = idParamSchema.validate(req.params);
      if (pe.error) {
        pe.error.status = 422;
        return next(pe.error);
      }
      const { error, value } = changePasswordSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.changePassword(req.params.id, value.mot_de_passe);
      res.json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },

  // GET /parents/:id/enfants
  async children(req, res, next) {
    try {
      const pe = idParamSchema.validate(req.params);
      if (pe.error) {
        pe.error.status = 422;
        return next(pe.error);
      }
      const data = await svc.children(req.params.id, req.query || {});
      res.json({
        data: data.rows,
        meta: { total: data.count, page: data.page, limit: data.limit },
      });
    } catch (e) {
      next(e);
    }
  },
  // POST /parents/:parentId/enfants
  async createChildForParent(req, res, next) {
    try {
      const pe = parentIdParamSchema.validate(req.params);
      if (pe.error) {
        pe.error.status = 422;
        return next(pe.error);
      }

      const { error, value } = createChildForParentSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }

      const data = await svc.createChildForParent(req.params.parentId, value);
      res.status(201).json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },
  async archive(req, res, next) {
    try {
      const ve = idParamSchema.validate(req.params);
      if (ve.error) {
        ve.error.status = 422;
        return next(ve.error);
      }
      const data = await svc.archive(req.params.id, false);
      res.json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },
  async unarchive(req, res, next) {
    try {
      const ve = idParamSchema.validate(req.params);
      if (ve.error) {
        ve.error.status = 422;
        return next(ve.error);
      }
      const data = await svc.archive(req.params.id, true);
      res.json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },
  async linkChild(req, res, next) {
    try {
      const pe = parentIdParamSchema.validate({ parentId: req.params.id });
      if (pe.error) {
        pe.error.status = 422;
        return next(pe.error);
      }
      const { error, value } = linkExistingChildSchema.validate(req.body, {
        abortEarly: false,
      });
      if (error) {
        error.status = 422;
        return next(error);
      }
      const data = await svc.linkChild(req.params.id, value.enfant_id);
      res.json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },
  async unlinkChild(req, res, next) {
    try {
      const pe = parentIdParamSchema.validate({ parentId: req.params.id });
      if (pe.error) {
        pe.error.status = 422;
        return next(pe.error);
      }
      const enfantId = Number(req.params.enfantId || req.params.enfant_id);
      if (!Number.isInteger(enfantId) || enfantId <= 0) {
        const err = new Error("enfant_id invalide");
        err.status = 422;
        return next(err);
      }
      const data = await svc.unlinkChild(req.params.id, enfantId);
      res.json({ data, meta: null });
    } catch (e) {
      next(e);
    }
  },
};
