"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("groupes", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      annee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: { model: "annees_scolaires", key: "id" },
      },
      nom: { type: Sequelize.STRING(120), allowNull: false },
      description: Sequelize.TEXT,
      manager_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: { model: "utilisateurs", key: "id" },
      },
      statut: {
        type: Sequelize.ENUM("actif", "archive"),
        defaultValue: "actif",
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("groupes");
  },
};
