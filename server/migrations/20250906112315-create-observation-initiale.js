'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('observation_initiale', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_observation: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      contenu: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('observation_initiale');
  }
};
