'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inscriptions_enfants', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      annee_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'annees_scolaires', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      groupe_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'groupes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      enfant_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'enfants', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_inscription: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
    await queryInterface.addIndex('inscriptions_enfants', ['enfant_id','annee_id'], { unique: true, name: 'uniq_enfant_annee' });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('inscriptions_enfants');
  }
};
