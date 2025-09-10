const { sequelize } = require("../models");
const repo = require("../repos/groupe.repo");
const { Utilisateur } = require("../models");

exports.create = async (dto) => {
  // manager_id optionnel; aucune contrainte forte ici
  return repo.createGroupe(dto);
};

exports.listByYear = async (annee_id) => {
  const groupes = await repo.listByYear(annee_id);
  const counts = await repo.countEnfantsByGroup(annee_id);
  return groupes.map((g) => ({
    ...g.get({ plain: true }),
    nb_enfants: counts[g.id] || 0,
  }));
};

exports.inscrireEnfants = async (groupe_id, annee_id, enfant_ids) => {
  // règle: UNIQUE(enfant_id, annee_id) → déjà garanti par DB, mais on préfiltre pour un message + propre
  const existing = await repo.getEnfantsAlreadyAssigned(enfant_ids, annee_id);
  const already = new Set(existing.map((x) => x.enfant_id));
  const toInsert = enfant_ids
    .filter((id) => !already.has(id))
    .map((id) => ({
      enfant_id: id,
      groupe_id,
      annee_id,
      date_inscription: new Date(),
    }));

  if (!toInsert.length) return { inserted: 0, skipped: enfant_ids.length };

  const inserted = await repo.addInscriptions(toInsert);
  return {
    inserted: inserted.length,
    skipped: enfant_ids.length - inserted.length,
  };
};

exports.affecterEducateur = async (groupe_id, annee_id, educateur_id) => {
  // Educateur doit être de rôle EDUCATEUR
  const edu = await Utilisateur.findByPk(educateur_id);
  if (!edu || edu.role !== "EDUCATEUR") {
    const e = new Error(
      "educateur_id invalide (doit référencer un utilisateur rôle EDUCATEUR)"
    );
    e.status = 422;
    throw e;
  }

  // règles: UNIQUE(educateur_id, annee_id) & UNIQUE(groupe_id, annee_id)
  const existsElsewhere = await repo.findEducateurAssignment(
    educateur_id,
    annee_id
  );
  if (existsElsewhere && existsElsewhere.groupe_id !== groupe_id) {
    const e = new Error(
      "Cet éducateur est déjà affecté à un autre groupe pour cette année"
    );
    e.status = 409;
    throw e;
  }

  await sequelize.transaction(async (t) => {
    // on remplace l’affectation du groupe (si existante) par la nouvelle
    await repo.clearAffectation(groupe_id, annee_id, t);
    await repo.createAffectation(
      { groupe_id, annee_id, educateur_id, date_affectation: new Date() },
      t
    );
  });

  return { ok: true };
};
