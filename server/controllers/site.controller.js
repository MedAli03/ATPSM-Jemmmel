"use strict";

const service = require("../services/site.service");
const ApiError = require("../utils/api-error");

function respond(res, payload) {
  res.json({ ok: true, data: payload, meta: null });
}

function parsePositiveInt(value) {
  const num = Number(value);
  if (Number.isFinite(num) && num > 0) {
    return num;
  }
  return undefined;
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

exports.about = async (req, res, next) => {
  try {
    const data = await service.getAbout();
    respond(res, data);
  } catch (err) {
    next(err);
  }
};

exports.news = async (req, res, next) => {
  try {
    const data = await service.listNews({
      page: parsePositiveInt(req.query.page),
      limit: parsePositiveInt(req.query.limit),
      search: req.query.search ?? req.query.q ?? undefined,
    });
    respond(res, data);
  } catch (err) {
    next(err);
  }
};

exports.newsById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      throw new ApiError({
        status: 400,
        code: "INVALID_NEWS_ID",
        message: "معرّف الخبر غير صالح",
      });
    }
    const data = await service.getNewsArticle(id);
    respond(res, data);
  } catch (err) {
    next(err);
  }
};

exports.events = async (req, res, next) => {
  try {
    const data = await service.listEvents({
      page: parsePositiveInt(req.query.page),
      limit: parsePositiveInt(req.query.limit),
      audience: req.query.audience ?? req.query.for ?? undefined,
      search: req.query.search ?? req.query.q ?? undefined,
      from: req.query.from ?? req.query.date_debut ?? undefined,
      to: req.query.to ?? req.query.date_fin ?? undefined,
    });
    respond(res, data);
  } catch (err) {
    next(err);
  }
};

exports.eventById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      throw new ApiError({
        status: 400,
        code: "INVALID_EVENT_ID",
        message: "معرّف الفعالية غير صالح",
      });
    }
    const data = await service.getEvent(id);
    respond(res, data);
  } catch (err) {
    next(err);
  }
};
