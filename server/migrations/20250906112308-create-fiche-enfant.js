'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fiche_enfant', {
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey: true, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      lieu_naissance: Sequelize.STRING(150),
      diagnostic_medical: Sequelize.TEXT,
      nb_freres: Sequelize.INTEGER,
      nb_soeurs: Sequelize.INTEGER,
      rang_enfant: Sequelize.INTEGER,
      situation_familiale: Sequelize.ENUM('deux_parents','pere_seul','mere_seule','autre'),
      diag_auteur_nom: Sequelize.STRING(150),
      diag_auteur_description: Sequelize.TEXT,
      carte_invalidite_numero: Sequelize.STRING(100),
      carte_invalidite_couleur: Sequelize.STRING(50),
      type_handicap: Sequelize.STRING(150),
      troubles_principaux: Sequelize.TEXT,
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('fiche_enfant');
  }
};
