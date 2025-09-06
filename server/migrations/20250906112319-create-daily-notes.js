'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('daily_notes', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      projet_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'projet_educatif_individuel', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_note: { type: Sequelize.DATEONLY, allowNull: false },
      contenu: { type: Sequelize.TEXT },
      type: { type: Sequelize.STRING(50) },
      pieces_jointes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('daily_notes');
  }
};
