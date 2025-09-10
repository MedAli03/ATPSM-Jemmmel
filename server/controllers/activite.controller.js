const service = require("../services/activite.service");

exports.listByPei = async (req, res, next) => {
  try {
    const peiId = Number(req.params.peiId);
    const { rows, count } = await service.listByPei(peiId, req.query);
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    res.json({ data: rows, page, pageSize, total: count });
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    res.json(await service.get(req.params.id));
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const peiId = Number(req.params.peiId);
    const out = await service.create(peiId, req.body, req.user.id);
    res.status(201).json(out);
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

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id, req.user.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};
