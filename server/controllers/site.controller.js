"use strict";

const service = require("../services/site.service");

function respond(res, payload) {
  res.json({ ok: true, data: payload, meta: null });
}

exports.overview = async (req, res, next) => {
  try {
    const data = await service.getOverview();
    respond(res, data);
  } catch (err) {
    next(err);
  }
};

exports.navigation = async (req, res, next) => {
  try {
    const data = await service.getNavigation();
    respond(res, data);
  } catch (err) {
    next(err);
  }
};

exports.hero = async (req, res, next) => {
  try {
    const data = await service.getHero();
    respond(res, data);
  } catch (err) {
    next(err);
  }
};

exports.highlights = async (req, res, next) => {
  try {
    const data = await service.getHighlights();
    respond(res, data);
  } catch (err) {
    next(err);
  }
};

exports.footer = async (req, res, next) => {
  try {
    const data = await service.getFooter();
    respond(res, data);
  } catch (err) {
    next(err);
  }
};

exports.contact = async (req, res, next) => {
  try {
    const data = await service.getContact();
    respond(res, data);
  } catch (err) {
    next(err);
  }
};
