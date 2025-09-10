"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[enfant]] = await queryInterface.sequelize.query(
      "SELECT id FROM enfants WHERE nom='Sami' AND prenom='Ahmed' LIMIT 1"
    );
    const [[educ]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educateur@asso.tn' LIMIT 1"
    );
    const [[evalRow]] = await queryInterface.sequelize.query(
      "SELECT id, projet_id FROM evaluation_projet ORDER BY id DESC LIMIT 1"
    );
    const [[pei]] = await queryInterface.sequelize.query(
      "SELECT id FROM projet_educatif_individuel WHERE id = ? LIMIT 1",
      { replacements: [evalRow.projet_id] }
    );

    await queryInterface.bulkInsert("recommendation_ai", [
      {
        enfant_id: enfant.id,
        educateur_id: educ.id,
        evaluation_id: evalRow.id,
        projet_source_id: pei.id,
        projet_cible_id: null,
        statut: "proposee",
        model_version: "mock-1.0",
        visible_parent: false,
        date_creation: now,
        commentaire: "Recommandations générées (mock).",
        created_at: now,
        updated_at: now,
      },
    ]);

    const [[reco]] = await queryInterface.sequelize.query(
      "SELECT id FROM recommendation_ai ORDER BY id DESC LIMIT 1"
    );

    await queryInterface.bulkInsert("recommendation_ai_objectif", [
      {
        recommendation_id: reco.id,
        texte: "Introduire PECS niveau 1",
        accepte: false,
        applique_le: null,
        created_at: now,
        updated_at: now,
      },
      {
        recommendation_id: reco.id,
        texte: "Renforcer l’attente du tour",
        accepte: false,
        applique_le: null,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("recommendation_ai_activite", [
      {
        recommendation_id: reco.id,
        description: "Échanges d’images pour demandes (eau, snack).",
        objectifs: "Demande fonctionnelle",
        accepte: false,
        created_activite_id: null,
        applique_le: null,
        created_at: now,
        updated_at: now,
      },
      {
        recommendation_id: reco.id,
        description: "Jeux à tours de rôle (puzzle simple).",
        objectifs: "Interaction sociale",
        accepte: false,
        created_activite_id: null,
        applique_le: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("recommendation_ai_activite", null);
    await queryInterface.bulkDelete("recommendation_ai_objectif", null);
    await queryInterface.bulkDelete("recommendation_ai", null);
  },
};
