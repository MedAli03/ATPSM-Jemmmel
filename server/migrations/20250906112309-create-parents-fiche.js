'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('parents_fiche', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, unique: true, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      pere_user_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      pere_nom: Sequelize.STRING(100),
      pere_prenom: Sequelize.STRING(100),
      pere_naissance_date: Sequelize.DATEONLY,
      pere_naissance_lieu: Sequelize.STRING(150),
      pere_origine: Sequelize.STRING(150),
      pere_cin_numero: Sequelize.STRING(50),
      pere_cin_delivree_a: Sequelize.STRING(150),
      pere_adresse: Sequelize.STRING(255),
      pere_profession: Sequelize.STRING(120),
      pere_couverture_sociale: Sequelize.STRING(255),
      pere_tel_domicile: Sequelize.STRING(50),
      pere_tel_travail: Sequelize.STRING(50),
      pere_tel_portable: Sequelize.STRING(50),
      mere_user_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      mere_nom: Sequelize.STRING(100),
      mere_prenom: Sequelize.STRING(100),
      mere_naissance_date: Sequelize.DATEONLY,
      mere_naissance_lieu: Sequelize.STRING(150),
      mere_origine: Sequelize.STRING(150),
      mere_cin_numero: Sequelize.STRING(50),
      mere_cin_delivree_a: Sequelize.STRING(150),
      mere_adresse: Sequelize.STRING(255),
      mere_profession: Sequelize.STRING(120),
      mere_couverture_sociale: Sequelize.STRING(255),
      mere_tel_domicile: Sequelize.STRING(50),
      mere_tel_travail: Sequelize.STRING(50),
      mere_tel_portable: Sequelize.STRING(50),
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('parents_fiche');
  }
};
