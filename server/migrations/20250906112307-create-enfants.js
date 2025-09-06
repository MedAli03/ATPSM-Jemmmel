'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('enfants', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      nom: { type: Sequelize.STRING(100), allowNull: false },
      prenom: { type: Sequelize.STRING(100), allowNull: false },
      date_naissance: { type: Sequelize.DATEONLY, allowNull: false },
      parent_user_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('enfants');
  }
};
