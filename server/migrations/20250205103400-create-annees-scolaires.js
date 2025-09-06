"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("annees_scolaires", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      libelle: { type: Sequelize.STRING(20), unique: true },
      date_debut: { type: Sequelize.DATEONLY, allowNull: false },
      date_fin: { type: Sequelize.DATEONLY, allowNull: false },
      est_active: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("annees_scolaires");
  },
};
