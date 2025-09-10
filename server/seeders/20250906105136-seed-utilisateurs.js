"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    await queryInterface.bulkInsert("utilisateurs", [
      {
        nom: "Belkhiria",
        prenom: "Mohamed Ali",
        email: "president@example.com",
        mot_de_passe: hashedPassword,
        telephone: "98123456",
        role: "PRESIDENT",
        is_active: true,
        avatar_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nom: "Sassi",
        prenom: "Karim",
        email: "directeur@example.com",
        mot_de_passe: await bcrypt.hash("direct123", 10),
        telephone: "98234567",
        role: "DIRECTEUR",
        is_active: true,
        avatar_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nom: "Ben Salem",
        prenom: "Noura",
        email: "educateur@example.com",
        mot_de_passe: await bcrypt.hash("educ123", 10),
        telephone: "98345678",
        role: "EDUCATEUR",
        is_active: true,
        avatar_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        nom: "Trabelsi",
        prenom: "Omar",
        email: "parent@example.com",
        mot_de_passe: await bcrypt.hash("parent123", 10),
        telephone: "98456789",
        role: "PARENT",
        is_active: true,
        avatar_url: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("utilisateurs", null, {});
  },
};
