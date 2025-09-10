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
    const [[educ]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educateur@asso.tn' LIMIT 1"
    );
    await queryInterface.bulkInsert("affectations_educateurs", [{
      annee_id: annee.id, groupe_id: groupe.id, educateur_id: educ.id,
      date_affectation: now, created_at: now, updated_at: now
    }]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("affectations_educateurs", null);
  }
};
