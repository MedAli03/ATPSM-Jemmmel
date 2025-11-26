const { sequelize } = require("../models");
const repo = require("../repos/evaluation.repo");

// Optionnel : stricter rule — vérifier cohérence éducateur ↔ enfant ↔ année via groupes
// Ici on garde simple: l'éducateur connecté crée l’évaluation sur le PEI.

const educatorAccess = require("./educateur_access.service");

async function assertEducateurPeiAccess(pei_id, currentUser) {
  if (currentUser?.role === "EDUCATEUR") {
    await educatorAccess.assertCanAccessPei(currentUser.id, pei_id);
  }
}

exports.listByPei = async (pei_id, q, currentUser) => {
  await assertEducateurPeiAccess(pei_id, currentUser);
  const page = Math.max(1, Number(q.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize || 20)));
  return repo.listByPei({ pei_id, page, pageSize });
};

exports.get = async (id, currentUser) => {
  const e = await repo.findById(id);
  if (!e) {
    const err = new Error("Évaluation introuvable");
    err.status = 404;
    throw err;
  }
  if (currentUser?.role === "EDUCATEUR") {
    await assertEducateurPeiAccess(e.projet_id, currentUser);
  }
  return e;
};

exports.create = async (pei_id, dto, currentUser) => {
  await assertEducateurPeiAccess(pei_id, currentUser);
  const userId = currentUser?.id;
  return sequelize.transaction(async (t) => {
    const pei = await repo.getPei(pei_id, t);
    if (!pei) {
      const err = new Error("PEI introuvable");
      err.status = 404;
      throw err;
    }

    // Création
    const created = await repo.create(
      {
        projet_id: pei_id,
        educateur_id: userId,
        date_evaluation: dto.date_evaluation,
        score: dto.score,
        grille: dto.grille || null,
        notes: dto.notes || null,
      },
      t
    );

    // Historique (facultatif)
    const { HistoriqueProjet } = require("../models");
    await HistoriqueProjet.create(
      {
        projet_id: pei_id,
        educateur_id: userId,
        date_modification: new Date(),
        ancien_objectifs: pei.objectifs || "",
        ancien_statut: pei.statut,
        raison_modification: `Ajout évaluation (${dto.score})`,
      },
      { transaction: t }
    );

    return created;
  });
};
