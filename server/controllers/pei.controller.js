const service = require("../services/pei.service");

exports.list = async (req, res, next) => {
  try {
    const { rows, count } = await service.list(req.query, req.user);
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    res.json({ data: rows, page, pageSize, total: count });
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    res.json(await service.get(req.params.id, req.user));
  } catch (e) {
    next(e);
  }
};

exports.listPending = async (req, res, next) => {
  try {
    const { rows, count } = await service.listPending(req.query);
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    res.json({ data: rows, page, pageSize, total: count });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    res.status(201).json(await service.create(req.body));
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    res.json(await service.update(req.params.id, req.body, req.user.id));
  } catch (e) {
    next(e);
  }
};

exports.close = async (req, res, next) => {
  try {
    res.json(await service.close(req.params.id, req.user.id));
  } catch (e) {
    next(e);
  }
};

exports.validate = async (req, res, next) => {
  try {
    res.json(await service.validate(req.params.id, req.user.id));
  } catch (e) {
    next(e);
  }
};
