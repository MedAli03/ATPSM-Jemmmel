'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('recommendation_ai', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      evaluation_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'evaluation_projet', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      projet_source_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'projet_educatif_individuel', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      projet_cible_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: 'projet_educatif_individuel', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      statut: { type: Sequelize.ENUM('proposee','validee','modifiee','rejetee'), defaultValue: 'proposee' },
      model_version: { type: Sequelize.STRING(50) },
      visible_parent: { type: Sequelize.BOOLEAN, defaultValue: false },
      date_creation: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      commentaire: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('recommendation_ai');
  }
};
