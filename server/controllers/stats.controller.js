"use strict";

const svc = require("../services/stats.service");

exports.getDirectorStats = async (req, res, next) => {
  try {
    const data = await svc.getDirectorStats(req.query);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.getChildrenPerGroup = async (req, res, next) => {
  try {
    const data = await svc.getChildrenPerGroup(req.query);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.getMonthlyInscriptions = async (req, res, next) => {
  try {
    const data = await svc.getMonthlyInscriptions(req.query);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.getFamilySituationDistribution = async (req, res, next) => {
  try {
    const data = await svc.getFamilySituationDistribution(req.query);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.getNonInscrits = async (req, res, next) => {
  try {
    const data = await svc.getNonInscrits(req.query);
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

exports.createInscription = async (req, res, next) => {
  try {
    const data = await svc.createInscription(req.body);
    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
};

