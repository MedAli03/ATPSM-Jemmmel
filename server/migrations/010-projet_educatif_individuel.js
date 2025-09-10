"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("projet_educatif_individuel", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      enfant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "enfants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      educateur_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      annee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "annees_scolaires", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      date_creation: { type: Sequelize.DATEONLY, allowNull: false },
      objectifs: { type: Sequelize.TEXT, allowNull: true },
      statut: {
        type: Sequelize.ENUM("brouillon", "actif", "clos"),
        allowNull: false,
        defaultValue: "brouillon",
      },
      precedent_projet_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "projet_educatif_individuel", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      date_derniere_maj: { type: Sequelize.DATE, allowNull: true },
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
    await queryInterface.addIndex("projet_educatif_individuel", [
      "enfant_id",
      "annee_id",
    ]);
    await queryInterface.addIndex("projet_educatif_individuel", ["statut"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("projet_educatif_individuel");
  },
};
