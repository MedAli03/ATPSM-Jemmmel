const service = require("../services/reco.service");

exports.generate = async (req, res, next) => {
  try {
    res
      .status(201)
      .json(
        await service.generateFromEvaluation(
          Number(req.params.evaluationId),
          req.user.id
        )
      );
  } catch (e) {
    next(e);
  }
};

exports.get = async (req, res, next) => {
  try {
    res.json(await service.get(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
};

exports.updateItems = async (req, res, next) => {
  try {
    res.json(await service.updateItems(Number(req.params.id), req.body));
  } catch (e) {
    next(e);
  }
};

exports.apply = async (req, res, next) => {
  try {
    res.json(await service.apply(Number(req.params.id), req.user.id));
  } catch (e) {
    next(e);
  }
};
