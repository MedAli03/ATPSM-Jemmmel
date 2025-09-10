"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("enfants", [
      {
        nom: "Ali",
        prenom: "Mohamed",
        date_naissance: "2015-05-10",
        parent_user_id: 4, // this should match an existing utilisateur ID with role: PARENT
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nom: "Fatma",
        prenom: "Sami",
        date_naissance: "2014-11-20",
        parent_user_id: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nom: "Omar",
        prenom: "Zouari",
        date_naissance: "2016-01-15",
        parent_user_id: 4,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("enfants", null, {});
  },
};
