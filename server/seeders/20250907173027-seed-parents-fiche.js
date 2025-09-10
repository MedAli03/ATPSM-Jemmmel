"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("parents_fiche", [
      {
        enfant_id: 1, // Make sure this ID exists in your `enfants` table

        pere_nom: "Belkhiria",
        pere_prenom: "Ahmed",
        pere_naissance_date: "1985-06-15",
        pere_naissance_lieu: "Sousse",
        pere_origine: "Tunisie",
        pere_cin_numero: "09876543",
        pere_cin_delivree_a: "Sousse",
        pere_adresse: "Rue El Manar, Sousse",
        pere_profession: "Enseignant",
        pere_couverture_sociale: "CNAM",
        pere_tel_domicile: "73200000",
        pere_tel_travail: "73330000",
        pere_tel_portable: "98111222",


        mere_nom: "Mejri",
        mere_prenom: "Aicha",
        mere_naissance_date: "1987-04-20",
        mere_naissance_lieu: "Monastir",
        mere_origine: "Tunisie",
        mere_cin_numero: "12345678",
        mere_cin_delivree_a: "Monastir",
        mere_adresse: "Rue Tahar Haddad, Monastir",
        mere_profession: "Infirmière",
        mere_couverture_sociale: "CNSS",
        mere_tel_domicile: "73223344",
        mere_tel_travail: "73334455",
        mere_tel_portable: "98333444",

        created_at: new Date(),
        updated_at: new Date(),
      },
      // You can add more entries if needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("parents_fiche", null, {});
  },
};
