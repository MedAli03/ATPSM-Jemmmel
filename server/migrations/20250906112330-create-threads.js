'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('threads', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      created_by: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      sujet: { type: Sequelize.STRING(200), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('threads');
  }
};
