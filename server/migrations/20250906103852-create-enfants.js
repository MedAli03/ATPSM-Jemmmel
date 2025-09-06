'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('enfants', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nom: Sequelize.STRING(100),
      prenom: Sequelize.STRING(100),
      date_naissance: Sequelize.DATEONLY,
      parent_user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'utilisateurs', key: 'id' },
        onDelete: 'SET NULL'
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('enfants');
  }
};
