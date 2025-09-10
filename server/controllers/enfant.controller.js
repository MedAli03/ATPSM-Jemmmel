const service = require("../services/enfant.service");

exports.list = async (req, res, next) => {
  try {
    const { rows, count } = await service.list(req.query);
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    res.json({ data: rows, page, pageSize, total: count });
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const enfant = await service.create(req.body);
    res.status(201).json(enfant);
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    const enfant = await service.get(req.params.id);
    res.json(enfant);
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const enfant = await service.update(req.params.id, req.body);
    res.json(enfant);
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};
