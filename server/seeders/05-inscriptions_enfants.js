"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[annee]] = await queryInterface.sequelize.query(
      "SELECT id FROM annees_scolaires WHERE est_active=1 LIMIT 1"
    );
    const [[groupe]] = await queryInterface.sequelize.query(
      "SELECT id FROM groupes WHERE nom='Groupe A (démo)' LIMIT 1"
    );
    const [[enfant]] = await queryInterface.sequelize.query(
      "SELECT id FROM enfants WHERE nom='Sami' AND prenom='Ahmed' LIMIT 1"
    );
    await queryInterface.bulkInsert("inscriptions_enfants", [
      {
        annee_id: annee.id,
        groupe_id: groupe.id,
        enfant_id: enfant.id,
        date_inscription: now,
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("inscriptions_enfants", null);
  },
};
