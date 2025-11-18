"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[annee]] = await queryInterface.sequelize.query(
      "SELECT id FROM annees_scolaires WHERE est_active=1 LIMIT 1"
    );
    const [[enfant]] = await queryInterface.sequelize.query(
      "SELECT id FROM enfants WHERE nom='Sami' AND prenom='Ahmed' LIMIT 1"
    );
    const [[educ]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educateur@asso.tn' LIMIT 1"
    );
    await queryInterface.bulkInsert("projet_educatif_individuel", [
      {
        enfant_id: enfant.id,
        educateur_id: educ.id,
        annee_id: annee.id,
        date_creation: "2025-09-10",
        objectifs: "Améliorer la communication fonctionnelle et l’autonomie.",
        statut: "VALIDE",
        precedent_projet_id: null,
        date_derniere_maj: now,
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("projet_educatif_individuel", null);
  },
};
