"use strict";

const { FicheEnfant } = require("../models");

exports.findByEnfantId = (enfantId, t = null) =>
  FicheEnfant.findOne({ where: { enfant_id: enfantId }, transaction: t });

exports.create = (enfantId, attrs, t = null) =>
  FicheEnfant.create({ enfant_id: enfantId, ...attrs }, { transaction: t });

exports.update = async (enfantId, attrs, t = null) => {
  const [n] = await FicheEnfant.update(attrs, {
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
  FicheEnfant.destroy({ where: { enfant_id: enfantId }, transaction: t });
