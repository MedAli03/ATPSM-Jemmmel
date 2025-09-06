'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('projet_educatif_individuel', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      annee_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'annees_scolaires', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_creation: { type: Sequelize.DATEONLY, allowNull: false },
      objectifs: { type: Sequelize.TEXT },
      statut: { type: Sequelize.ENUM('brouillon','actif','clos'), defaultValue: 'brouillon' },
      precedent_projet_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'projet_educatif_individuel', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      date_derniere_maj: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('projet_educatif_individuel');
  }
};
