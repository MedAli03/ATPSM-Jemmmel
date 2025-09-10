const service = require("../services/groupe.service");

exports.create = async (req, res, next) => {
  try {
    const g = await service.create(req.body);
    res.status(201).json(g);
  } catch (e) {
    next(e);
  }
};

exports.listByYear = async (req, res, next) => {
  try {
    const annee_id = Number(req.params.anneeId);
    const data = await service.listByYear(annee_id);
    res.json(data);
  } catch (e) {
    next(e);
  }
};

exports.inscrireEnfants = async (req, res, next) => {
  try {
    const { anneeId, groupeId } = req.params;
    const { enfant_ids } = req.body;
    const out = await service.inscrireEnfants(
      Number(groupeId),
      Number(anneeId),
      enfant_ids
    );
    res.json(out);
  } catch (e) {
    next(e);
  }
};

exports.affecterEducateur = async (req, res, next) => {
  try {
    const { anneeId, groupeId } = req.params;
    const { educateur_id } = req.body;
    const out = await service.affecterEducateur(
      Number(groupeId),
      Number(anneeId),
      Number(educateur_id)
    );
    res.json(out);
  } catch (e) {
    next(e);
  }
};
