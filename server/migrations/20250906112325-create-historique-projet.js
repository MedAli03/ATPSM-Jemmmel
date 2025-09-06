'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('historique_projet', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      projet_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'projet_educatif_individuel', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_modification: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      ancien_objectifs: { type: Sequelize.TEXT },
      ancien_statut: { type: Sequelize.STRING(30) },
      raison_modification: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('historique_projet');
  }
};
