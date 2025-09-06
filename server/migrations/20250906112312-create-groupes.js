'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('groupes', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      annee_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'annees_scolaires', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      nom: { type: Sequelize.STRING(120), allowNull: false },
      description: Sequelize.TEXT,
      manager_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      statut: { type: Sequelize.ENUM('actif','archive'), defaultValue: 'actif' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('groupes');
  }
};
