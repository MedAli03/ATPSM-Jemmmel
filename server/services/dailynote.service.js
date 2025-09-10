const { sequelize } = require("../models");
const repo = require("../repos/dailynote.repo");

exports.listByPei = async (pei_id, q) => {
  const page = Math.max(1, Number(q.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize || 20)));
  return repo.listByPei({ pei_id, page, pageSize });
};

exports.get = async (id) => {
  const n = await repo.findById(id);
  if (!n) {
    const e = new Error("Note introuvable");
    e.status = 404;
    throw e;
  }
  return n;
};

exports.create = async (pei_id, dto, userId) => {
  return sequelize.transaction(async (t) => {
    const pei = await repo.getPei(pei_id, t);
    if (!pei) {
      const e = new Error("PEI introuvable");
      e.status = 404;
      throw e;
    }
    if (Number(dto.enfant_id) !== Number(pei.enfant_id)) {
      const e = new Error("enfant_id ne correspond pas au PEI");
      e.status = 422;
      throw e;
    }

    const payload = {
      projet_id: pei_id,
      educateur_id: userId,
      enfant_id: dto.enfant_id,
      date_note: dto.date_note,
      contenu: dto.contenu || null,
      type: dto.type || null,
      pieces_jointes: dto.pieces_jointes || null,
    };
    const created = await repo.create(payload, t);

    const { HistoriqueProjet } = require("../models");
    await HistoriqueProjet.create(
      {
        projet_id: pei_id,
        educateur_id: userId,
        date_modification: new Date(),
        ancien_objectifs: pei.objectifs || "",
        ancien_statut: pei.statut,
        raison_modification: `Ajout note quotidienne`,
      },
      { transaction: t }
    );

    return created;
  });
};

exports.update = async (id, dto, userId) => {
  return sequelize.transaction(async (t) => {
    const current = await repo.findById(id);
    if (!current) {
      const e = new Error("Note introuvable");
      e.status = 404;
      throw e;
    }

    if (dto.enfant_id && Number(dto.enfant_id) !== Number(current.enfant_id)) {
      const e = new Error("Impossible de changer enfant_id");
      e.status = 422;
      throw e;
    }
    const updated = await repo.updateById(id, dto, t);

    const { HistoriqueProjet } = require("../models");
    await HistoriqueProjet.create(
      {
        projet_id: current.projet_id,
        educateur_id: userId,
        date_modification: new Date(),
        ancien_objectifs: "",
        ancien_statut: "",
        raison_modification: `Mise à jour note quotidienne`,
      },
      { transaction: t }
    );

    return updated;
  });
};

exports.remove = async (id, userId) => {
  return sequelize.transaction(async (t) => {
    const current = await repo.findById(id);
    if (!current) {
      const e = new Error("Note introuvable");
      e.status = 404;
      throw e;
    }
    await repo.deleteById(id, t);

    const { HistoriqueProjet } = require("../models");
    await HistoriqueProjet.create(
      {
        projet_id: current.projet_id,
        educateur_id: userId,
        date_modification: new Date(),
        ancien_objectifs: "",
        ancien_statut: "",
        raison_modification: `Suppression note quotidienne`,
      },
      { transaction: t }
    );

    return true;
  });
};
