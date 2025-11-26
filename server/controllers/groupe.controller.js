"use strict";

const service = require("../services/groupe.service");

/* ============== CRUD ============== */
exports.create = async (req, res, next) => {
  try {
    const g = await service.create(req.body);
    res.status(201).json({ ok: true, data: g });
  } catch (e) { next(e); }
};

exports.list = async (req, res, next) => {
  try {
    const { anneeId, search, statut, page = 1, limit = 10 } = req.query;
    const data = await service.list({ anneeId, search, statut, page, limit });
    res.json({ ok: true, data });
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const data = await service.get(Number(req.params.groupeId));
    res.json({ ok: true, data });
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.update(Number(req.params.groupeId), req.body);
    res.json({ ok: true, data });
  } catch (e) { next(e); }
};

exports.archive = async (req, res, next) => {
  try {
    const { statut } = req.body; // "actif" | "archive"
    const data = await service.archive(Number(req.params.groupeId), statut);
    res.json({ ok: true, data });
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const result = await service.remove(
      Number(req.params.groupeId),
      Number(req.query.anneeId)
    );

    if (result?.status) {
      return res.status(result.status).json({ ok: result.status < 400, ...result.data });
    }

    res.json({ ok: true, data: result });
  } catch (e) { next(e); }
};

/* ============== Compat list by year ============== */
exports.listByYear = async (req, res, next) => {
  try {
    const annee_id = Number(req.params.anneeId);
    const data = await service.listByYear(annee_id);
    res.json({ ok: true, data });
  } catch (e) { next(e); }
};

/* ============== Inscriptions ============== */
exports.listInscriptions = async (req, res, next) => {
  try {
    const { groupeId } = req.params;
    const { anneeId, page = 1, limit = 50 } = req.query;
    const data = await service.listInscriptions({
      groupe_id: Number(groupeId),
      annee_id: Number(anneeId),
      page,
      limit,
    }, req.user);
    res.json({ ok: true, data });
  } catch (e) { next(e); }
};

exports.inscrireEnfants = async (req, res, next) => {
  try {
    const groupeId = Number(req.params.groupeId);
    const anneeId = Number(req.query.anneeId ?? req.params.anneeId);
    const enfantIds = req.body.enfantIds ?? req.body.enfants ?? [];

    const out = await service.inscrireEnfants(groupeId, anneeId, enfantIds);
    res.status(out.created > 0 ? 201 : 200).json({ ok: true, data: out });
  } catch (e) { next(e); }
};

exports.removeInscription = async (req, res, next) => {
  try {
    const data = await service.removeInscription(Number(req.params.inscriptionId));
    res.json({ ok: true, data });
  } catch (e) { next(e); }
};

/* ============== Affectation ============== */
exports.getAffectation = async (req, res, next) => {
  try {
    const { groupeId } = req.params;
    const { anneeId } = req.query;
    const data = await service.getAffectation(
      Number(groupeId),
      Number(anneeId)
    );
    res.json({ ok: true, data });
  } catch (e) { next(e); }
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
    res.status(201).json({ ok: true, data: out });
  } catch (e) { next(e); }
};

exports.removeAffectation = async (req, res, next) => {
  try {
    const data = await service.removeAffectation(
      Number(req.params.groupeId),
      Number(req.params.affectationId)
    );
    res.json({ ok: true, data });
  } catch (e) { next(e); }
};

/* ============== Candidates ============== */
exports.searchEnfantsCandidats = async (req, res, next) => {
  try {
    const { anneeId } = req.params;
    const {
      search = null,
      page = 1,
      limit = 10,
      scope = "available",
      excludeGroupeId = null,
    } = req.query;

    const data = await service.searchEnfantsCandidats({
      annee_id: Number(anneeId),
      search,
      page,
      limit,
      scope,
      exclude_groupe_id: excludeGroupeId ? Number(excludeGroupeId) : undefined,
    });

    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.searchEducateursCandidats = async (req, res, next) => {
  try {
    const { anneeId } = req.params;
    const { search = null, page = 1, limit = 10 } = req.query;

    const data = await service.searchEducateursCandidats({
      annee_id: Number(anneeId),
      search,
      page,
      limit,
    });

    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};
