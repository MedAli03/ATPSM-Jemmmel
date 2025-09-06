'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reglements', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      document_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'documents', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      version: { type: Sequelize.STRING(30) },
      date_effet: { type: Sequelize.DATEONLY },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('reglements');
  }
};
