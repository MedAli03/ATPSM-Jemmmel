"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[parent]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='parent@asso.tn' LIMIT 1"
    );
    await queryInterface.bulkInsert("enfants", [
      {
        nom: "Sami",
        prenom: "Ahmed",
        date_naissance: "2018-04-12",
        parent_user_id: parent.id,
        created_at: now,
        updated_at: now,
      },
    ]);
    // fiche_enfant + parents_fiche minimales (optionnel)
    const [[enfant]] = await queryInterface.sequelize.query(
      "SELECT id FROM enfants WHERE nom='Sami' AND prenom='Ahmed' LIMIT 1"
    );
    await queryInterface.bulkInsert("fiche_enfant", [
      {
        enfant_id: enfant.id,
        lieu_naissance: "Monastir",
        diagnostic_medical: "TSA léger",
        nb_freres: 1,
        nb_soeurs: 0,
        rang_enfant: 1,
        situation_familiale: "deux_parents",
        created_at: now,
        updated_at: now,
      },
    ]);
    await queryInterface.bulkInsert("parents_fiche", [
      {
        enfant_id: enfant.id,
        pere_nom: "Habib",
        pere_prenom: "Mohamed",
        mere_nom: "Aya",
        mere_prenom: "Ben Amor",
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("parents_fiche", null);
    await queryInterface.bulkDelete("fiche_enfant", null);
    await queryInterface.bulkDelete("enfants", {
      nom: "Sami",
      prenom: "Ahmed",
    });
  },
};
