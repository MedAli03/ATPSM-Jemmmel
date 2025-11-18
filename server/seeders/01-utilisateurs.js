"use strict";
const bcrypt = require("bcrypt");
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const hash = await bcrypt.hash("password", 10);
    await queryInterface.bulkInsert("utilisateurs", [
      {
        nom: "Admin",
        prenom: "Root",
        email: "admin@asso.tn",
        mot_de_passe: hash,
        telephone: "20000000",
        role: "PRESIDENT",
        is_active: true,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        nom: "Ben",
        prenom: "Directeur",
        email: "directeur@asso.tn",
        mot_de_passe: hash,
        telephone: "20000001",
        role: "DIRECTEUR",
        is_active: true,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        nom: "Ali",
        prenom: "Educateur",
        email: "educateur@asso.tn",
        mot_de_passe: hash,
        telephone: "20000002",
        role: "EDUCATEUR",
        is_active: true,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        nom: "Salma",
        prenom: "Educatrice",
        email: "educatrice@asso.tn",
        mot_de_passe: hash,
        telephone: "20000004",
        role: "EDUCATEUR",
        is_active: true,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        nom: "Habib",
        prenom: "Parent",
        email: "parent@asso.tn",
        mot_de_passe: hash,
        telephone: "20000003",
        role: "PARENT",
        is_active: true,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
      {
        nom: "Rahma",
        prenom: "Parent",
        email: "parent2@asso.tn",
        mot_de_passe: hash,
        telephone: "20000005",
        role: "PARENT",
        is_active: true,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("utilisateurs", {
      email: [
        "admin@asso.tn",
        "directeur@asso.tn",
        "educateur@asso.tn",
        "educatrice@asso.tn",
        "parent@asso.tn",
        "parent2@asso.tn",
      ],
    });
  },
};
