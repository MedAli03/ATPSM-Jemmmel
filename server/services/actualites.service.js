"use strict";

const { sequelize } = require("../models");
const repo = require("../repos/actualites.repo");
const notifier = require("./notifier.service");
const ApiError = require("../utils/api-error");

const STATUS_VALUES = ["draft", "published", "scheduled"];

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "string" ? v.trim() : v))
      .filter((v) => typeof v === "string" && v.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeActualite(record) {
  if (!record) return null;
  const plain = record.toJSON ? record.toJSON() : record;
  const inferredStatus = plain.statut
    ? plain.statut
    : plain.publie_le
    ? "published"
    : "draft";

  return {
    id: plain.id,
    titre: plain.titre,
    resume: plain.resume || null,
    contenu: plain.contenu,
    contenu_html: plain.contenu_html || plain.contenu,
    statut: inferredStatus,
    publie_le: plain.publie_le,
    tags: Array.isArray(plain.tags) ? plain.tags : [],
    couverture_url: plain.couverture_url || null,
    galerie_urls: Array.isArray(plain.galerie_urls) ? plain.galerie_urls : [],
    epingle: !!plain.epingle,
    admin: plain.admin || null,
    created_at: plain.created_at,
    updated_at: plain.updated_at,
  };
}

function computeStatus({ statut, publie_le }) {
  const desiredStatus = statut && STATUS_VALUES.includes(statut) ? statut : "draft";
  if (desiredStatus === "published") {
    const publishDate = publie_le ? new Date(publie_le) : new Date();
    if (Number.isNaN(publishDate.getTime())) {
      throw new ApiError({
        status: 400,
        code: "INVALID_DATE",
        message: "تاريخ النشر غير صالح",
      });
    }
    return { statut: "published", publie_le: publishDate };
  }

  if (desiredStatus === "scheduled") {
    if (!publie_le) {
      throw new ApiError({
        status: 400,
        code: "SCHEDULE_REQUIRED",
        message: "يجب تحديد تاريخ ووقت للجدولة",
      });
    }
    const scheduleDate = new Date(publie_le);
    if (Number.isNaN(scheduleDate.getTime())) {
      throw new ApiError({
        status: 400,
        code: "INVALID_DATE",
        message: "تاريخ الجدولة غير صالح",
      });
    }
    if (scheduleDate.getTime() <= Date.now()) {
      throw new ApiError({
        status: 400,
        code: "SCHEDULE_PAST",
        message: "تاريخ الجدولة يجب أن يكون في المستقبل",
      });
    }
    return { statut: "scheduled", publie_le: scheduleDate };
  }

  return { statut: "draft", publie_le: null };
}

function buildAttributes(payload, currentUser, { keepAdmin = false, existing = null } = {}) {
  const titre = payload.titre ?? existing?.titre;
  const contenuHtml = payload.contenu_html ?? existing?.contenu_html ?? existing?.contenu;

  if (!titre || !contenuHtml) {
    throw new ApiError({
      status: 400,
      code: "REQUIRED_FIELDS",
      message: "العنوان والمحتوى مطلوبان",
    });
  }

  const resume =
    payload.resume !== undefined ? payload.resume || null : existing?.resume || null;

  const tags =
    payload.tags !== undefined ? toArray(payload.tags) : toArray(existing?.tags || []);

  const galerie =
    payload.galerie_urls !== undefined
      ? Array.isArray(payload.galerie_urls)
        ? payload.galerie_urls.filter((url) => typeof url === "string" && url.length > 0)
        : []
      : Array.isArray(existing?.galerie_urls)
      ? existing.galerie_urls
      : [];

  const couverture =
    payload.couverture_url !== undefined
      ? payload.couverture_url || null
      : existing?.couverture_url || null;

  const epingle =
    payload.epingle !== undefined ? payload.epingle === true : !!existing?.epingle;

  const statusInput =
    payload.statut !== undefined ? payload.statut : existing?.statut || "draft";

  const publishInput =
    payload.publie_le !== undefined ? payload.publie_le : existing?.publie_le || null;

  const { statut, publie_le } = computeStatus({
    statut: statusInput,
    publie_le: publishInput,
  });

  return {
    ...(keepAdmin ? {} : { admin_id: currentUser.id }),
    titre,
    resume,
    contenu: contenuHtml,
    contenu_html: contenuHtml,
    statut,
    publie_le,
    tags,
    couverture_url: couverture,
    galerie_urls: galerie,
    epingle,
  };
}

exports.list = async (query) => {
  const filters = {
    search: query.search || query.q || null,
    status: query.status || query.statut || "all",
    pinned:
      query.pinned === true ||
      query.pinnedOnly === true ||
      query.onlyPinned === true,
    from: query.from || query.date_debut || null,
    to: query.to || query.date_fin || null,
  };

  const pagination = { page: query.page, limit: query.limit };
  const result = await repo.list(filters, pagination);
  return {
    items: result.rows.map(normalizeActualite),
    total: result.count,
    page: result.page,
    limit: result.limit,
  };
};

exports.get = async (id) => {
  const record = await repo.findById(id);
  if (!record) {
    throw new ApiError({
      status: 404,
      code: "NEWS_NOT_FOUND",
      message: "الخبر غير موجود",
    });
  }
  return normalizeActualite(record);
};

exports.create = async (payload, currentUser) => {
  return sequelize.transaction(async (t) => {
    const attrs = buildAttributes(payload, currentUser);
    const created = await repo.create(attrs, t);
    const full = await repo.findById(created.id, t);

    if (attrs.statut === "published" && attrs.publie_le?.getTime() <= Date.now()) {
      await notifier.notifyOnNewsPublished(full, t);
    }

    return normalizeActualite(full);
  });
};

exports.update = async (id, payload, currentUser) => {
  return sequelize.transaction(async (t) => {
    const exists = await repo.findById(id, t);
    if (!exists) {
      throw new ApiError({
        status: 404,
        code: "NEWS_NOT_FOUND",
        message: "الخبر غير موجود",
      });
    }

    const attrs = buildAttributes(payload, currentUser, {
      keepAdmin: true,
      existing: normalizeActualite(exists),
    });
    await repo.updateById(id, attrs, t);
    const updated = await repo.findById(id, t);

    if (attrs.statut === "published" && attrs.publie_le?.getTime() <= Date.now()) {
      await notifier.notifyOnNewsPublished(updated, t);
    }

    return normalizeActualite(updated);
  });
};

exports.updateStatus = async (id, payload) => {
  return sequelize.transaction(async (t) => {
    const exists = await repo.findById(id, t);
    if (!exists) {
      throw new ApiError({
        status: 404,
        code: "NEWS_NOT_FOUND",
        message: "الخبر غير موجود",
      });
    }

    const { statut, publie_le } = computeStatus(payload);
    await repo.updateStatus(
      id,
      {
        statut,
        publie_le,
      },
      t
    );

    const updated = await repo.findById(id, t);
    if (statut === "published" && publie_le?.getTime() <= Date.now()) {
      await notifier.notifyOnNewsPublished(updated, t);
    }

    return normalizeActualite(updated);
  });
};

exports.togglePin = async (id, epingle) => {
  return sequelize.transaction(async (t) => {
    const exists = await repo.findById(id, t);
    if (!exists) {
      throw new ApiError({
        status: 404,
        code: "NEWS_NOT_FOUND",
        message: "الخبر غير موجود",
      });
    }

    await repo.updateById(id, { epingle: !!epingle }, t);
    const updated = await repo.findById(id, t);
    return normalizeActualite(updated);
  });
};

exports.remove = async (id) => {
  return sequelize.transaction(async (t) => {
    const exists = await repo.findById(id, t);
    if (!exists) {
      throw new ApiError({
        status: 404,
        code: "NEWS_NOT_FOUND",
        message: "الخبر غير موجود",
      });
    }
    await repo.deleteById(id, t);
    return { deleted: true };
  });
};
