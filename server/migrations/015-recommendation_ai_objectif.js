"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recommendation_ai_objectif", {
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
      texte: { type: Sequelize.TEXT, allowNull: false },
      accepte: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.addIndex("recommendation_ai_objectif", [
      "recommendation_id",
    ]);
  },
  async down(queryInterface) {
    await queryInterface.dropTable("recommendation_ai_objectif");
  },
};
