'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('affectations_educateurs', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      annee_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'annees_scolaires', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      groupe_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'groupes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      educateur_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: 'utilisateurs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      date_affectation: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
    await queryInterface.addIndex('affectations_educateurs', ['educateur_id','annee_id'], { unique: true, name: 'uniq_educateur_annee' });
    await queryInterface.addIndex('affectations_educateurs', ['groupe_id','annee_id'], { unique: true, name: 'uniq_groupe_annee' });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('affectations_educateurs');
  }
};
