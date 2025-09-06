'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      thread_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'threads', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      expediteur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      texte: { type: Sequelize.TEXT, allowNull: false },
      pieces_jointes: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('messages');
  }
};
