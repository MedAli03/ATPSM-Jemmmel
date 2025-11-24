const {
  sequelize,
  PEI,
  Enfant,
  Utilisateur,
  InscriptionEnfant,
  AffectationEducateur,
} = require("../models");
const repo = require("../repos/pei.repo");
const activiteRepo = require("../repos/activite.repo");
const noteRepo = require("../repos/dailynote.repo");
const evaluationRepo = require("../repos/evaluation.repo");
const observationRepo = require("../repos/observation_initiale.repo");
const notifier = require("./notifier.service");
const { DatabaseError, Op } = require("sequelize");
const educatorAccess = require("./educateur_access.service");

const PEI_STATUS = {
  PENDING: "EN_ATTENTE_VALIDATION",
  VALID: "VALIDE",
  CLOSED: "CLOTURE",
  REFUSED: "REFUSE",
};

// Lifecycle (aligné avec les rôles)
// - Création: EN_ATTENTE_VALIDATION (éducateur/directeur/president)
// - Validation: VALIDE (PRESIDENT ou DIRECTEUR via /:id/validate)
// - Clôture/archivage: CLOTURE (EDUCATEUR, DIRECTEUR, PRESIDENT via /:id/close)
// - REFUSE reste possible pour cohérence historique
//
// Workflow PEI (sans recommandations IA) :
// Observation initiale → Création du PEI → Ajout d’objectifs/activités → Notes quotidiennes →
// Évaluations périodiques → Historique des versions du PEI.

exports.list = async (q, currentUser) => {
  const page = Math.max(1, Number(q.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize || 20)));
  const where = {};
  if (q.enfant_id) where.enfant_id = Number(q.enfant_id);
  if (q.educateur_id) where.educateur_id = Number(q.educateur_id);
  if (q.annee_id) where.annee_id = Number(q.annee_id);
  if (q.statut) where.statut = q.statut;

  if (currentUser?.role === "EDUCATEUR") {
    const { enfantIds } = await educatorAccess.listAccessibleChildIds(
      currentUser.id
    );
    if (!enfantIds.length) {
      return { rows: [], count: 0 };
    }
    if (where.enfant_id != null) {
      const targetId = Number(where.enfant_id);
      if (!enfantIds.includes(targetId)) {
        return { rows: [], count: 0 };
      }
    } else {
      where.enfant_id = { [Op.in]: enfantIds };
    }
  }

  return repo.findAndCount({ page, pageSize, where });
};

exports.get = async (id, currentUser) => {
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
    if (currentUser?.role === "EDUCATEUR") {
      await educatorAccess.assertCanAccessChild(currentUser.id, pei.enfant_id);
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
        valide_par_id: userId,
        date_validation: new Date(),
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

/**
 * Historique complet d'un PEI (activités, notes, évaluations, observation initiale).
 * Fournit une chronologie consolidée pour le Président/Directeur et contrôle l'accès
 * des éducateurs aux enfants qu'ils suivent.
 */
exports.history = async (peiId, currentUser) => {
  const id = Number(peiId);
  if (!Number.isFinite(id) || id <= 0) {
    const e = new Error("Identifiant de PEI invalide");
    e.status = 400;
    throw e;
  }

  const pei = await repo.findByIdFull(id);
  if (!pei) {
    const e = new Error("PEI introuvable");
    e.status = 404;
    throw e;
  }

  // Relations rappelées pour les futurs devs :
  // - PEI.projet_id = clé primaire (projet_educatif_individuel)
  // - ActiviteProjet.projet_id, DailyNote.projet_id, EvaluationProjet.projet_id pointent sur le PEI
  // - ObservationInitiale lié à enfant_id : point d'entrée pédagogique avant/pendant le PEI
  if (currentUser?.role === "EDUCATEUR") {
    await educatorAccess.assertCanAccessChild(currentUser.id, pei.enfant_id);
  }

  const [activities, notes, evaluations, observations] = await Promise.all([
    activiteRepo.listAllByPei(id),
    noteRepo.listAllByPei(id),
    evaluationRepo.listAllByPei(id),
    observationRepo.listAllForEnfant(pei.enfant_id),
  ]);

  const plainActivities = activities.map((a) =>
    a?.get ? a.get({ plain: true }) : a
  );
  const plainNotes = notes.map((n) => (n?.get ? n.get({ plain: true }) : n));
  const plainEvaluations = evaluations.map((e) =>
    e?.get ? e.get({ plain: true }) : e
  );
  const plainObservations = observations.map((o) =>
    o?.get ? o.get({ plain: true }) : o
  );

  const mapUser = (user) =>
    user
      ? {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
        }
      : null;

  const truncate = (text) => {
    if (!text) return "";
    return text.length > 160 ? `${text.slice(0, 157)}...` : text;
  };

  const history = [
    ...plainObservations.map((o) => ({
      type: "OBSERVATION",
      id: o.id,
      date: o.date_observation || o.createdAt,
      author: mapUser(o.educateur),
      summary: truncate(o.contenu),
      details: o,
    })),
    ...plainActivities.map((a) => ({
      type: "ACTIVITY",
      id: a.id,
      date: a.date_activite || a.createdAt,
      author: mapUser(a.educateur),
      summary: truncate(a.titre || a.description),
      details: a,
    })),
    ...plainNotes.map((n) => ({
      type: "NOTE",
      id: n.id,
      date: n.date_note || n.createdAt,
      author: mapUser(n.educateur),
      summary: truncate(n.contenu),
      details: n,
    })),
    ...plainEvaluations.map((ev) => ({
      type: "EVALUATION",
      id: ev.id,
      date: ev.date_evaluation || ev.createdAt,
      author: mapUser(ev.educateur),
      summary: truncate(
        ev.notes ||
          (ev.score != null ? `Évaluation notée (${ev.score})` : "Évaluation")
      ),
      details: ev,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return { pei, history };
};
