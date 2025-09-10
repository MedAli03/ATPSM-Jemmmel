"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("parents_fiche", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      enfant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
        references: { model: "enfants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      // Père
      pere_nom: { type: Sequelize.STRING(150), allowNull: true },
      pere_prenom: { type: Sequelize.STRING(150), allowNull: true },
      pere_naissance_date: { type: Sequelize.DATEONLY, allowNull: true },
      pere_naissance_lieu: { type: Sequelize.STRING(150), allowNull: true },
      pere_origine: { type: Sequelize.STRING(150), allowNull: true },
      pere_cin_numero: { type: Sequelize.STRING(100), allowNull: true },
      pere_cin_delivree_a: { type: Sequelize.STRING(150), allowNull: true },
      pere_adresse: { type: Sequelize.STRING(255), allowNull: true },
      pere_profession: { type: Sequelize.STRING(150), allowNull: true },
      pere_couverture_sociale: { type: Sequelize.STRING(150), allowNull: true },
      pere_tel_domicile: { type: Sequelize.STRING(50), allowNull: true },
      pere_tel_travail: { type: Sequelize.STRING(50), allowNull: true },
      pere_tel_portable: { type: Sequelize.STRING(50), allowNull: true },
      // Mère
      mere_nom: { type: Sequelize.STRING(150), allowNull: true },
      mere_prenom: { type: Sequelize.STRING(150), allowNull: true },
      mere_naissance_date: { type: Sequelize.DATEONLY, allowNull: true },
      mere_naissance_lieu: { type: Sequelize.STRING(150), allowNull: true },
      mere_origine: { type: Sequelize.STRING(150), allowNull: true },
      mere_cin_numero: { type: Sequelize.STRING(100), allowNull: true },
      mere_cin_delivree_a: { type: Sequelize.STRING(150), allowNull: true },
      mere_adresse: { type: Sequelize.STRING(255), allowNull: true },
      mere_profession: { type: Sequelize.STRING(150), allowNull: true },
      mere_couverture_sociale: { type: Sequelize.STRING(150), allowNull: true },
      mere_tel_domicile: { type: Sequelize.STRING(50), allowNull: true },
      mere_tel_travail: { type: Sequelize.STRING(50), allowNull: true },
      mere_tel_portable: { type: Sequelize.STRING(50), allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
    await queryInterface.addIndex("parents_fiche", ["enfant_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("parents_fiche");
  },
};
