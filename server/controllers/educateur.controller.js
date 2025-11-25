const service = require("../services/educateur_portal.service");
const educatorAccess = require("../services/educateur_access.service");

exports.listMyGroups = async (req, res, next) => {
  try {
    const groups = await service.listMyGroups(req.user.id);
    res.json({ data: groups });
  } catch (e) {
    next(e);
  }
};

exports.listMyChildren = async (req, res, next) => {
  try {
    const { rows, count, page, limit } = await service.listMyChildren(
      req.query,
      req.user
    );
    res.json({ data: rows, meta: { page, limit, total: count } });
  } catch (e) {
    next(e);
  }
};

exports.getChild = async (req, res, next) => {
  try {
    const childId = Number(req.params.enfantId);
    const child = await service.getChild(childId, req.user);
    res.json({ data: child });
  } catch (e) {
    next(e);
  }
};

exports.getActivePeiForChild = async (req, res, next) => {
  try {
    const childId = Number(req.params.enfantId);
    const pei = await service.getActivePeiForChild(childId, req.user);
    res.json({ data: pei });
  } catch (e) {
    next(e);
  }
};

exports.createPeiForChild = async (req, res, next) => {
  try {
    const childId = Number(req.params.enfantId);
    const pei = await service.createPeiForChild(childId, req.body, req.user);
    res.status(201).json({ data: pei });
  } catch (e) {
    next(e);
  }
};

exports.updatePei = async (req, res, next) => {
  try {
    const peiId = Number(req.params.peiId);
    const pei = await service.updatePei(peiId, req.body, req.user);
    res.json({ data: pei });
  } catch (e) {
    next(e);
  }
};

exports.listPeiActivities = async (req, res, next) => {
  try {
    const peiId = Number(req.params.peiId);
    const { rows, count } = await service.listPeiActivities(
      peiId,
      req.query,
      req.user
    );
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    res.json({ data: rows, page, pageSize, total: count });
  } catch (e) {
    next(e);
  }
};

exports.createPeiActivity = async (req, res, next) => {
  try {
    const peiId = Number(req.params.peiId);
    const created = await service.createPeiActivity(
      peiId,
      req.body,
      req.user
    );
    res.status(201).json({ data: created });
  } catch (e) {
    next(e);
  }
};

exports.listDailyNotes = async (req, res, next) => {
  try {
    const enfantId = Number(req.params.enfantId);
    const { rows, count } = await service.listDailyNotesForChild(
      enfantId,
      req.query,
      req.user
    );
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    res.json({ data: rows, page, pageSize, total: count });
  } catch (e) {
    next(e);
  }
};

exports.createDailyNote = async (req, res, next) => {
  try {
    const enfantId = Number(req.params.enfantId);
    const created = await service.createDailyNoteForChild(
      enfantId,
      req.body,
      req.user
    );
    res.status(201).json({ data: created });
  } catch (e) {
    next(e);
  }
};

exports.listEvaluations = async (req, res, next) => {
  try {
    const peiId = Number(req.params.peiId);
    const { rows, count } = await service.listEvaluations(
      peiId,
      req.query,
      req.user
    );
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    res.json({ data: rows, page, pageSize, total: count });
  } catch (e) {
    next(e);
  }
};

exports.createEvaluation = async (req, res, next) => {
  try {
    const peiId = Number(req.params.peiId);
    const created = await service.createEvaluation(peiId, req.body, req.user);
    res.status(201).json({ data: created });
  } catch (e) {
    next(e);
  }
};

exports.listObservations = async (req, res, next) => {
  try {
    const enfantId = Number(req.params.enfantId);
    const out = await service.listObservations(enfantId, req.query, req.user);
    res.json(out);
  } catch (e) {
    next(e);
  }
};

exports.createObservation = async (req, res, next) => {
  try {
    const enfantId = Number(req.params.enfantId);
    const created = await service.createObservation(
      enfantId,
      req.body,
      req.user
    );
    res.status(201).json({ data: created });
  } catch (e) {
    next(e);
  }
};

exports.updateObservation = async (req, res, next) => {
  try {
    const obsId = Number(req.params.obsId);
    const updated = await service.updateObservation(obsId, req.body, req.user);
    res.json({ data: updated });
  } catch (e) {
    next(e);
  }
};

exports.listMyAccessibleChildIds = async (req, res, next) => {
  try {
    const data = await educatorAccess.listAccessibleChildIds(req.user.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
};
