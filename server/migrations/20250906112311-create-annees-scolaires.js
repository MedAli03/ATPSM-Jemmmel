'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('annees_scolaires', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      libelle: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      date_debut: { type: Sequelize.DATEONLY, allowNull: false },
      date_fin: { type: Sequelize.DATEONLY, allowNull: false },
      est_active: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('annees_scolaires');
  }
};
