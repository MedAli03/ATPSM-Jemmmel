"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("historique_projet", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      projet_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "projet_educatif_individuel", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      educateur_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      date_modification: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      ancien_objectifs: { type: Sequelize.TEXT, allowNull: true },
      ancien_statut: { type: Sequelize.STRING(30), allowNull: true },
      raison_modification: { type: Sequelize.TEXT, allowNull: true },
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
  },
  async down(queryInterface) {
    await queryInterface.dropTable("historique_projet");
  },
};
