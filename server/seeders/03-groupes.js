"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const [[annee]] = await queryInterface.sequelize.query(
      "SELECT id FROM annees_scolaires WHERE est_active = 1 LIMIT 1"
    );
    await queryInterface.bulkInsert("groupes", [
      {
        annee_id: annee.id,
        nom: "Groupe A (démo)",
        description: "Groupe de démonstration",
        statut: "actif",
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("groupes", { nom: "Groupe A (démo)" });
  },
};
