"use strict";

const { ParentsFiche } = require("../models");

exports.findByEnfantId = (enfantId, t = null) =>
  ParentsFiche.findOne({ where: { enfant_id: enfantId }, transaction: t });

exports.create = (enfantId, attrs, t = null) =>
  ParentsFiche.create({ enfant_id: enfantId, ...attrs }, { transaction: t });

exports.update = async (enfantId, attrs, t = null) => {
  const [n] = await ParentsFiche.update(attrs, {
    where: { enfant_id: enfantId },
    transaction: t,
  });
  return n;
};

exports.upsert = async (enfantId, attrs, t = null) => {
  const exists = await exports.findByEnfantId(enfantId, t);
  if (!exists) return exports.create(enfantId, attrs, t);
  await exports.update(enfantId, attrs, t);
  return exports.findByEnfantId(enfantId, t);
};

exports.deleteByEnfantId = (enfantId, t = null) =>
  ParentsFiche.destroy({ where: { enfant_id: enfantId }, transaction: t });
