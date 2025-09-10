"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[pei]] = await queryInterface.sequelize.query(
      "SELECT id FROM projet_educatif_individuel ORDER BY id DESC LIMIT 1"
    );
    const [[educ]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educateur@asso.tn' LIMIT 1"
    );
    await queryInterface.bulkInsert("evaluation_projet", [
      {
        projet_id: pei.id,
        educateur_id: educ.id,
        date_evaluation: "2025-09-12",
        score: 72,
        grille: JSON.stringify({
          comprehension: "simple",
          interaction: "limitée",
        }),
        notes: "Progrès gestuels; difficultés en groupe.",
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("evaluation_projet", null);
  },
};
