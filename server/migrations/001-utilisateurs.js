"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("utilisateurs", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      nom: { type: Sequelize.STRING(100), allowNull: false },
      prenom: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      mot_de_passe: { type: Sequelize.STRING(255), allowNull: false },
      telephone: { type: Sequelize.STRING(50), allowNull: true },
      role: { type: Sequelize.ENUM("PRESIDENT","DIRECTEUR","EDUCATEUR","PARENT"), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      avatar_url: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("utilisateurs", ["role"]);
    await queryInterface.addIndex("utilisateurs", ["is_active"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("utilisateurs");
  }
};
