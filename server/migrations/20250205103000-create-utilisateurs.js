"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("utilisateurs", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      nom: { type: Sequelize.STRING(100), allowNull: false },
      prenom: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      mot_de_passe: { type: Sequelize.STRING(255), allowNull: false },
      telephone: { type: Sequelize.STRING(50) },
      role: {
        type: Sequelize.ENUM(
          "ADMIN",
          "DIRECTEUR",
          "MANAGER",
          "EDUCATEUR",
          "PARENT"
        ),
        allowNull: false,
      },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      avatar_url: { type: Sequelize.STRING(255) },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("utilisateurs");
  },
};
