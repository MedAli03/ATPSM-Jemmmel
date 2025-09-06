'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activite_projet', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      projet_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'projet_educatif_individuel', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_activite: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      titre: { type: Sequelize.STRING(150) },
      description: { type: Sequelize.TEXT },
      objectifs: { type: Sequelize.TEXT },
      type: { type: Sequelize.ENUM('atelier','jeu','reco','autre'), defaultValue: 'autre' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('activite_projet');
  }
};
