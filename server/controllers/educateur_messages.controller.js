"use strict";

const messagesService = require("../services/messages.service");

exports.ensureParentThread = async (req, res, next) => {
  try {
    const enfantId = Number(req.params.enfantId);
    const anneeIdRaw = req.body?.anneeId ?? req.query?.anneeId;
    const anneeId = Number.isFinite(Number(anneeIdRaw)) ? Number(anneeIdRaw) : null;

    const result = await messagesService.ensureEducateurParentThread({
      educateurId: req.user.id,
      enfantId,
      anneeId,
    });

    res.status(result.created ? 201 : 200).json({ ok: true, data: result });
  } catch (error) {
    next(error);
  }
};
