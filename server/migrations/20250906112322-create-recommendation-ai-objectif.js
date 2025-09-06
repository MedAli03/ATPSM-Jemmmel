'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('recommendation_ai_objectif', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      recommendation_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'recommendation_ai', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      texte: { type: Sequelize.TEXT },
      accepte: { type: Sequelize.BOOLEAN, defaultValue: false },
      applique_le: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('recommendation_ai_objectif');
  }
};
