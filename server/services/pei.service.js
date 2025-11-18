const {
  sequelize,
  PEI,
  Enfant,
  Utilisateur,
  InscriptionEnfant,
  AffectationEducateur,
} = require("../models");
const repo = require("../repos/pei.repo");
const notifier = require("./notifier.service");
const { DatabaseError } = require("sequelize");

const PEI_STATUS = {
  PENDING: "EN_ATTENTE_VALIDATION",
  VALID: "VALIDE",
  CLOSED: "CLOTURE",
  REFUSED: "REFUSE",
};

exports.list = async (q) => {
  const page = Math.max(1, Number(q.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize || 20)));
  const where = {};
  if (q.enfant_id) where.enfant_id = Number(q.enfant_id);
  if (q.educateur_id) where.educateur_id = Number(q.educateur_id);
  if (q.annee_id) where.annee_id = Number(q.annee_id);
  if (q.statut) where.statut = q.statut;

  return repo.findAndCount({ page, pageSize, where });
};

exports.get = async (id) => {
  const peiId = Number(id);
  if (!Number.isFinite(peiId) || peiId <= 0) {
    const e = new Error("Identifiant de PEI invalide");
    e.status = 400;
    throw e;
  }
  try {
    const pei = await repo.findByIdFull(peiId);
    if (!pei) {
      const e = new Error("PEI introuvable");
      e.status = 404;
      throw e;
    }
    return pei;
  } catch (error) {
    if (error instanceof DatabaseError) {
      const e = new Error("Erreur lors du chargement du PEI");
      e.status = 500;
      throw e;
    }
    throw error;
  }
};

// Vérifie que l'éducateur est bien affecté au groupe de l'enfant pour l'année
async function verifyEducateurEnfantSameGroupe(
  enfant_id,
  educateur_id,
  annee_id
) {
  const inscription = await InscriptionEnfant.findOne({
    where: { enfant_id, annee_id },
  });
  if (!inscription) return false;
  const affectation = await AffectationEducateur.findOne({
    where: { annee_id, groupe_id: inscription.groupe_id, est_active: true },
  });
  return !!(affectation && affectation.educateur_id === Number(educateur_id));
}

// Règle: 1 seul PEI actif par (enfant, année), + cohérence éducateur/groupe
exports.create = async (dto) => {
  const enfant = await Enfant.findByPk(dto.enfant_id);
  if (!enfant) {
    const e = new Error("enfant_id invalide");
    e.status = 422;
    throw e;
  }
  const educ = await Utilisateur.findByPk(dto.educateur_id);
  if (!educ || educ.role !== "EDUCATEUR") {
    const e = new Error("educateur_id invalide");
    e.status = 422;
    throw e;
  }

  const okGroup = await verifyEducateurEnfantSameGroupe(
    dto.enfant_id,
    dto.educateur_id,
    dto.annee_id
  );
  if (!okGroup) {
    const e = new Error(
      "L'éducateur n'est pas affecté au groupe de l'enfant pour cette année"
    );
    e.status = 422;
    throw e;
  }

  return sequelize.transaction(async (t) => {
    const existingPending = await repo.findPendingByEnfantYear(
      { enfant_id: dto.enfant_id, annee_id: dto.annee_id },
      t
    );
    if (existingPending) {
      const e = new Error(
        "Un PEI est déjà en attente de validation pour cet enfant et cette année"
      );
      e.status = 409;
      throw e;
    }

    const payload = { ...dto, statut: PEI_STATUS.PENDING, est_actif: null };
    const created = await repo.create(payload, t);
    const plain = created.get({ plain: true });

    await repo.addHistory(
      {
        projet_id: plain.id,
        educateur_id: dto.educateur_id,
        date_modification: new Date(),
        ancien_objectifs: "",
        ancien_statut: PEI_STATUS.PENDING,
        raison_modification: "Création du PEI",
      },
      t
    );

    await notifier.notifyOnPeiAwaitingValidation(plain, t);

    return plain;
  });
};

exports.update = async (id, dto, userId) => {
  return sequelize.transaction(async (t) => {
    const current = await PEI.findByPk(id, { transaction: t });
    if (!current) {
      const e = new Error("PEI introuvable");
      e.status = 404;
      throw e;
    }

    if (dto.statut === PEI_STATUS.VALID && current.statut !== PEI_STATUS.VALID) {
      const active = await repo.findActiveByEnfantYear({
        enfant_id: current.enfant_id,
        annee_id: current.annee_id,
      }, t);
      if (active && active.id !== current.id) {
        const e = new Error(
          "Un autre PEI actif existe déjà pour cet enfant et cette année"
        );
        e.status = 409;
        throw e;
      }
    }

    const ancien_objectifs = current.objectifs || "";
    const ancien_statut = current.statut;

    const updated = await repo.updateById(
      id,
      {
        ...dto,
        est_actif:
          dto.statut === PEI_STATUS.VALID
            ? true
            : dto.statut
            ? null
            : current.est_actif,
        date_derniere_maj: new Date(),
      },
      t
    );

    await repo.addHistory(
      {
        projet_id: id,
        educateur_id: userId,
        date_modification: new Date(),
        ancien_objectifs,
        ancien_statut,
        raison_modification: "Mise à jour du PEI",
      },
      t
    );

    return updated;
  });
};

exports.close = async (id, userId) => {
  return sequelize.transaction(async (t) => {
    const current = await PEI.findByPk(id, { transaction: t });
    if (!current) {
      const e = new Error("PEI introuvable");
      e.status = 404;
      throw e;
    }
    if (current.statut === PEI_STATUS.CLOSED) return current;

    const updated = await repo.updateById(
      id,
      {
        statut: PEI_STATUS.CLOSED,
        est_actif: null,
        date_derniere_maj: new Date(),
      },
      t
    );
    await repo.addHistory(
      {
        projet_id: id,
        educateur_id: userId,
        date_modification: new Date(),
        ancien_objectifs: current.objectifs || "",
        ancien_statut: current.statut,
        raison_modification: "Clôture du PEI",
      },
      t
    );
    return updated;
  });
};

exports.validate = async (id, userId) => {
  return sequelize.transaction(async (t) => {
    const current = await PEI.findByPk(id, { transaction: t });
    if (!current) {
      const e = new Error("PEI introuvable");
      e.status = 404;
      throw e;
    }
    if (current.statut === PEI_STATUS.CLOSED) {
      const e = new Error("Impossible de valider un PEI clôturé");
      e.status = 400;
      throw e;
    }
    if (current.statut === PEI_STATUS.VALID) {
      return current.get({ plain: true });
    }
    if (
      current.statut !== PEI_STATUS.PENDING &&
      current.statut !== PEI_STATUS.REFUSED
    ) {
      const e = new Error("Ce PEI ne peut pas être validé");
      e.status = 400;
      throw e;
    }

    const active = await repo.findActiveByEnfantYear(
      { enfant_id: current.enfant_id, annee_id: current.annee_id },
      t
    );
    if (active && active.id !== current.id) {
      await repo.updateById(
        active.id,
        {
          statut: PEI_STATUS.CLOSED,
          est_actif: null,
          date_derniere_maj: new Date(),
        },
        t
      );
    }

    const updated = await repo.updateById(
      id,
      {
        statut: PEI_STATUS.VALID,
        est_actif: true,
        date_derniere_maj: new Date(),
      },
      t
    );
    const plain = updated.get({ plain: true });

    await repo.addHistory(
      {
        projet_id: id,
        educateur_id: userId,
        date_modification: new Date(),
        ancien_objectifs: current.objectifs || "",
        ancien_statut: current.statut,
        raison_modification: "Validation du PEI",
      },
      t
    );

    await notifier.notifyOnPEICreated(plain, t);

    return plain;
  });
};

exports.listPending = async (q) => {
  return exports.list({ ...q, statut: PEI_STATUS.PENDING });
};
