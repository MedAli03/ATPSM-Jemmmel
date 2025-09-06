"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("affectations_educateurs", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      annee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: { model: "annees_scolaires", key: "id" },
      },
      groupe_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: { model: "groupes", key: "id" },
      },
      educateur_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: { model: "utilisateurs", key: "id" },
      },
      date_affectation: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex(
      "affectations_educateurs",
      ["educateur_id", "annee_id"],
      { unique: true }
    );
    await queryInterface.addIndex(
      "affectations_educateurs",
      ["groupe_id", "annee_id"],
      { unique: true }
    );
  },
  async down(queryInterface) {
    await queryInterface.dropTable("affectations_educateurs");
  },
};
