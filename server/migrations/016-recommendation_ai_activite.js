"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recommendation_ai_activite", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      recommendation_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "recommendation_ai", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      description: { type: Sequelize.TEXT, allowNull: false },
      objectifs: { type: Sequelize.TEXT, allowNull: true },
      accepte: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_activite_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "activite_projet", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      applique_le: { type: Sequelize.DATE, allowNull: true },
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
    await queryInterface.addIndex("recommendation_ai_activite", [
      "recommendation_id",
    ]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("recommendation_ai_activite");
  },
};
