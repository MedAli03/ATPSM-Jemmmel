// src/services/reco.service.js
const { sequelize, PEI, HistoriqueProjet } = require("../models");
const repo = require("../repos/reco.repo");

/**
 * Génère une recommandation IA (mock) à partir d'une évaluation :
 * - crée RecoAI (statut = 'proposee')
 * - ajoute des objectifs & activités par défaut (accepte=false)
 * - retourne la reco complète (avec include) via le même transaction 't'
 */
exports.generateFromEvaluation = async (evaluation_id, userId) => {
  return sequelize.transaction(async (t) => {
    const evaluation = await repo.getEvaluation(evaluation_id, t);
    if (!evaluation) {
      const e = new Error("Évaluation introuvable");
      e.status = 404;
      throw e;
    }

    const pei = await repo.getPei(evaluation.projet_id, t);
    if (!pei) {
      const e = new Error("PEI introuvable");
      e.status = 404;
      throw e;
    }

    // --- MOCK IA simple basé sur le score
    const score = Number(evaluation.score || 0);
    const niveau = score >= 70 ? "bon" : score >= 40 ? "moyen" : "fragile";

    const objectifsMock = [
      {
        texte: `Renforcer compétence sociale (niveau ${niveau})`,
        accepte: false,
      },
      {
        texte: `Améliorer attention conjointe (niveau ${niveau})`,
        accepte: false,
      },
    ];

    const activitesMock = [
      {
        description: "Jeu de tours (préhension + attendre son tour)",
        objectifs: "Patience, interaction",
        accepte: false,
      },
      {
        description: "Pictogrammes routines du matin",
        objectifs: "Autonomie routine",
        accepte: false,
      },
    ];

    // --- Reco tête
    const reco = await repo.createReco(
      {
        enfant_id: pei.enfant_id,
        educateur_id: userId,
        evaluation_id,
        projet_source_id: pei.id,
        projet_cible_id: null,
        statut: "proposee",
        model_version: "mock-v1",
        visible_parent: false,
        date_creation: new Date(),
        commentaire: `Reco auto (mock) basée sur score=${score}`,
      },
      t
    );

    // --- Items (bulk)
    await repo.bulkCreateObjectifs(
      objectifsMock.map((o) => ({
        recommendation_id: reco.id,
        texte: o.texte,
        accepte: o.accepte,
      })),
      t
    );
    await repo.bulkCreateActivites(
      activitesMock.map((a) => ({
        recommendation_id: reco.id,
        description: a.description,
        objectifs: a.objectifs,
        accepte: a.accepte,
      })),
      t
    );

    // --- Recharger avec include à l'intérieur de la transaction
    return await repo.findByIdFull(reco.id, t);
  });
};

/**
 * Met à jour l'arbitrage des items (objectifs & activités) d'une reco :
 * - accepter / rejeter / éditer le texte (objectifs) et description/objectifs (activités)
 * - retourne la reco complète avec include (dans la même transaction)
 */
exports.updateItems = async (reco_id, dto) => {
  return sequelize.transaction(async (t) => {
    const full = await repo.findByIdFull(reco_id, t);
    if (!full) {
      const e = new Error("Recommandation introuvable");
      e.status = 404;
      throw e;
    }

    // Objectifs
    for (const o of dto.objectifs || []) {
      await repo.updateObjectif(
        o.id,
        { accepte: !!o.accepte, texte: o.texte ?? null },
        t
      );
    }
    // Activités
    for (const a of dto.activites || []) {
      await repo.updateActivite(
        a.id,
        {
          accepte: !!a.accepte,
          description: a.description ?? null,
          objectifs: a.objectifs ?? null,
        },
        t
      );
    }

    return await repo.findByIdFull(reco_id, t);
  });
};

/**
 * Applique la reco au PEI cible :
 * - crée le PEI cible (brouillon) si absent (lié au PEI source)
 * - fusionne objectifs acceptés dans le PEI cible
 * - crée les activités acceptées (type 'reco') et référence leurs IDs dans les items
 * - enregistre l'historique de modification
 * - met le statut de la reco ('validee' s'il y a des éléments appliqués, sinon 'rejetee')
 * - retourne la reco complète (dans la même transaction)
 */
exports.apply = async (reco_id, userId) => {
  return sequelize.transaction(async (t) => {
    const full = await repo.findByIdFull(reco_id, t);
    if (!full) {
      const e = new Error("Recommandation introuvable");
      e.status = 404;
      throw e;
    }

    const src = full.source;
    if (!src) {
      const e = new Error("PEI source introuvable");
      e.status = 422;
      throw e;
    }

    // 1) PEI cible
    let cible = full.cible;
    if (!cible) {
      cible = await PEI.create(
        {
          enfant_id: src.enfant_id,
          educateur_id: userId,
          annee_id: src.annee_id,
          date_creation: new Date(),
          objectifs: src.objectifs || "",
          statut: "brouillon",
          precedent_projet_id: src.id,
          date_derniere_maj: new Date(),
        },
        { transaction: t }
      );

      await repo.updateReco(full.id, { projet_cible_id: cible.id }, t);
    }

    // 2) Objectifs acceptés -> concat
    const acceptedObj = (full.objectifs || []).filter((x) => x.accepte);
    if (acceptedObj.length) {
      const exist = cible.objectifs || "";
      const ajout = acceptedObj.map((o) => `- ${o.texte}`).join("\n");
      await cible.update(
        {
          objectifs: [exist, ajout].filter(Boolean).join("\n"),
          date_derniere_maj: new Date(),
        },
        { transaction: t }
      );
    }

    // 3) Activités acceptées -> création + lien
    const acceptedAct = (full.activites || []).filter((x) => x.accepte);
    for (const a of acceptedAct) {
      const created = await repo.createActiviteProjet(
        {
          projet_id: cible.id,
          educateur_id: userId,
          enfant_id: src.enfant_id,
          date_activite: new Date(),
          titre: (a.description || "Activité issue reco").slice(0, 150),
          description: a.description || null,
          objectifs: a.objectifs || null,
          type: "reco",
        },
        t
      );
      await repo.linkCreatedActivite(a.id, created.id, t);
    }

    // 4) Historique
    await HistoriqueProjet.create(
      {
        projet_id: cible.id,
        educateur_id: userId,
        date_modification: new Date(),
        ancien_objectifs: src.objectifs || "",
        ancien_statut: src.statut,
        raison_modification: "Application recommandations IA",
      },
      { transaction: t }
    );

    // 5) Statut final
    const statut =
      acceptedObj.length || acceptedAct.length ? "validee" : "rejetee";
    await repo.updateReco(full.id, { statut }, t);

    // 6) Retourner la reco complète (toujours dans t)
    return await repo.findByIdFull(full.id, t);
  });
};

/**
 * Récupère une recommandation (hors transaction)
 */
exports.get = async (id) => {
  const r = await repo.findByIdFull(id, null);
  if (!r) {
    const e = new Error("Recommandation introuvable");
    e.status = 404;
    throw e;
  }
  return r;
};
