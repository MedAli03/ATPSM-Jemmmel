"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("inscriptions_enfants", {
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
      enfant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        references: { model: "enfants", key: "id" },
      },
      date_inscription: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
    await queryInterface.addIndex(
      "inscriptions_enfants",
      ["enfant_id", "annee_id"],
      { unique: true }
    );
  },
  async down(queryInterface) {
    await queryInterface.dropTable("inscriptions_enfants");
  },
};
