'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('evenements', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      document_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'documents', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      admin_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      titre: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT },
      debut: { type: Sequelize.DATE },
      fin: { type: Sequelize.DATE },
      audience: { type: Sequelize.ENUM('parents','educateurs','tous'), defaultValue: 'tous' },
      lieu: { type: Sequelize.STRING(200) },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('evenements');
  }
};
