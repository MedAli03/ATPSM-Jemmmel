"use strict";
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [[parent1]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='parent@asso.tn' LIMIT 1"
    );
    const [[parent2]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='parent2@asso.tn' LIMIT 1"
    );
    const [[educateur1]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educateur@asso.tn' LIMIT 1"
    );
    const [[educateur2]] = await queryInterface.sequelize.query(
      "SELECT id FROM utilisateurs WHERE email='educatrice@asso.tn' LIMIT 1"
    );

    await queryInterface.bulkInsert("enfants", [
      {
        nom: "Sami",
        prenom: "Ahmed",
        date_naissance: "2018-04-12",
        parent_user_id: parent1.id,
        created_at: now,
        updated_at: now,
      },
      {
        nom: "Nada",
        prenom: "Ben Salem",
        date_naissance: "2017-11-03",
        parent_user_id: parent2.id,
        created_at: now,
        updated_at: now,
      },
    ]);

    const [children] = await queryInterface.sequelize.query(
      "SELECT id, nom FROM enfants WHERE nom IN ('Sami','Nada')"
    );
    const childId = Object.fromEntries(children.map((c) => [c.nom, c.id]));

    await queryInterface.bulkInsert("fiche_enfant", [
      {
        enfant_id: childId.Sami,
        lieu_naissance: "Monastir",
        diagnostic_medical: "TSA léger",
        nb_freres: 1,
        nb_soeurs: 0,
        rang_enfant: 1,
        situation_familiale: "deux_parents",
        created_at: now,
        updated_at: now,
      },
      {
        enfant_id: childId.Nada,
        lieu_naissance: "Sousse",
        diagnostic_medical: "TSA avec dyspraxie",
        nb_freres: 0,
        nb_soeurs: 1,
        rang_enfant: 2,
        situation_familiale: "deux_parents",
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("parents_fiche", [
      {
        enfant_id: childId.Sami,
        pere_nom: "Habib",
        pere_prenom: "Mohamed",
        mere_nom: "Aya",
        mere_prenom: "Ben Amor",
        created_at: now,
        updated_at: now,
      },
      {
        enfant_id: childId.Nada,
        pere_nom: "Omar",
        pere_prenom: "Meftah",
        mere_nom: "Rahma",
        mere_prenom: "Mansouri",
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("observation_initiale", [
      {
        enfant_id: childId.Sami,
        educateur_id: educateur1.id,
        date_observation: "2025-09-05",
        contenu: JSON.stringify({
          contexte: "Intégration groupe أطلس",
          forces: "Très curieux, adore les puzzles",
          besoins: "Structurer la communication fonctionnelle",
        }),
        created_at: now,
        updated_at: now,
      },
      {
        enfant_id: childId.Nada,
        educateur_id: educateur2.id,
        date_observation: "2025-09-07",
        contenu: JSON.stringify({
          contexte: "Première semaine à l'association",
          forces: "Très musicale, bon contact visuel",
          besoins: "Renforcer l'autonomie en classe",
        }),
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("observation_initiale", null);
    await queryInterface.bulkDelete("parents_fiche", null);
    await queryInterface.bulkDelete("fiche_enfant", null);
    await queryInterface.bulkDelete("enfants", {
      nom: ["Sami", "Nada"],
    });
  },
};
