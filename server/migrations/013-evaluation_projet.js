"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("evaluation_projet", {
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
      date_evaluation: { type: Sequelize.DATEONLY, allowNull: false },
      score: { type: Sequelize.INTEGER, allowNull: true },
      grille: { type: Sequelize.JSON, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
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
    await queryInterface.addIndex("evaluation_projet", ["projet_id"]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("evaluation_projet");
  },
};
