"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("chatbot_messages", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      enfant_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "enfants", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      educateur_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "utilisateurs", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      annee_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "annees_scolaires", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      role: {
        type: Sequelize.ENUM("user", "assistant"),
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("chatbot_messages", ["enfant_id", "annee_id", "created_at"]);
    await queryInterface.addIndex("chatbot_messages", ["educateur_id", "enfant_id", "annee_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("chatbot_messages");
  },
};

