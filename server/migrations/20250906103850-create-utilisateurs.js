'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('utilisateurs', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nom: Sequelize.STRING(100),
      prenom: Sequelize.STRING(100),
      email: { type: Sequelize.STRING(150), unique: true },
      mot_de_passe: Sequelize.STRING(255),
      telephone: Sequelize.STRING(50),
      role: Sequelize.ENUM('ADMIN', 'DIRECTEUR', 'MANAGER', 'EDUCATEUR', 'PARENT'),
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      avatar_url: Sequelize.STRING(255),
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('utilisateurs');
  }
};
